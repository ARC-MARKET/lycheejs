
lychee.define('harvester.net.server.File').requires([
	'harvester.data.Filesystem'
]).exports((lychee, global, attachments) => {

	const _Filesystem = lychee.import('harvester.data.Filesystem');
	const _MIME       = {
		'default':  { binary: true,  type: 'application/octet-stream'      },
		'appcache': { binary: false, type: 'text/cache-manifest'           },
		'css':      { binary: false, type: 'text/css'                      },
		'env':      { binary: false, type: 'application/json'              },
		'eot':      { binary: false, type: 'application/vnd.ms-fontobject' },
		'gz':       { binary: true,  type: 'application/x-gzip'            },
		'fnt':      { binary: false, type: 'application/json'              },
		'html':     { binary: false, type: 'text/html'                     },
		'ico':      { binary: true,  type: 'image/x-icon'                  },
		'jpg':      { binary: true,  type: 'image/jpeg'                    },
		'js':       { binary: false, type: 'application/javascript'        },
		'json':     { binary: false, type: 'application/json'              },
		'md':       { binary: false, type: 'text/x-markdown'               },
		'mf':       { binary: false, type: 'text/cache-manifest'           },
		'mp3':      { binary: true,  type: 'audio/mp3'                     },
		'ogg':      { binary: true,  type: 'application/ogg'               },
		'pkg':      { binary: false, type: 'application/json'              },
		'store':    { binary: false, type: 'application/json'              },
		'tar':      { binary: true,  type: 'application/x-tar'             },
		'ttf':      { binary: false, type: 'application/x-font-truetype'   },
		'txt':      { binary: false, type: 'text/plain'                    },
		'png':      { binary: true,  type: 'image/png'                     },
		'svg':      { binary: true,  type: 'image/svg+xml'                 },
		'woff':     { binary: true,  type: 'application/font-woff'         },
		'woff2':    { binary: true,  type: 'application/font-woff'         },
		'xml':      { binary: false, type: 'text/xml'                      },
		'zip':      { binary: true,  type: 'application/zip'               }
	};

	const _ROOT_PROJECT = {
		identifier: '',
		filesystem: new _Filesystem()
	};

	const _GUIDES_PROJECT = {
		identifier: '/guides',
		filesystem: new _Filesystem({
			root: '/guides'
		})
	};



	/*
	 * HELPERS
	 */

	const _get_headers = function(info, mime, custom) {

		custom = custom instanceof Object ? custom : null;


		let headers = {
			'status':          '200 OK',
			'e-tag':           '"' + info.length + '-' + Date.parse(info.mtime) + '"',
			'last-modified':   new Date(info.mtime).toUTCString(),
			'content-control': 'no-transform',
			'content-type':    mime.type,
			'expires':         new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toUTCString(),
			'vary':            'Accept-Encoding',
			'@binary':         mime.binary
		};


		if (custom !== null) {

			for (let c in custom) {
				headers['@' + c] = custom[c];
			}

		}


		if (mime.type.startsWith('text')) {
			headers['content-type'] = mime.type + '; charset=utf-8';
		}


		return headers;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		/*
		 * MODULE API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'harvester.net.server.File',
				'arguments': []
			};

		},



		/*
		 * CUSTOM API
		 */

		receive: function(payload, headers) {

			payload = payload instanceof Buffer ? payload : null;
			headers = headers instanceof Object ? headers : {};


			let identifier = null;
			let info       = null;
			let path       = null;
			let project    = null;
			let tunnel     = this.tunnel;

			let url = headers['url'];
			if (url.includes('?')) {
				url = url.split('?')[0];
			}

			let mime = _MIME[url.split('.').pop()] || _MIME['default'];

			if (url.startsWith('/libraries')) {

				// /libraries/lychee/*

				identifier = url.split('/').slice(0, 3).join('/');
				path       = '/' + url.split('/').slice(3).join('/');
				project    = lychee.import('MAIN')._libraries[identifier] || null;


			} else if (url.startsWith('/projects')) {

				// /projects/boilerplate/*

				identifier = url.split('/').slice(0, 3).join('/');
				path       = '/' + url.split('/').slice(3).join('/');
				project    = lychee.import('MAIN')._projects[identifier] || null;

			} else if (url.startsWith('/guides')) {

				// /guides/software/lycheejs-breeder.md

				identifier = null;
				path       = '/' + url.split('/').slice(2).join('/');
				project    = _GUIDES_PROJECT;

			} else {

				identifier = null;
				project    = _ROOT_PROJECT;

				if (url.startsWith('/') === false) {
					url = '/' + url;
				}

				if (url === '/CHANGELOG.md' || url === '/README.md') {
					path = url;
				} else {
					path = '/libraries/harvester/public' + url;
				}

			}


			if (project !== null) {
				info = project.filesystem.info(path);
			}


			if (project !== null && info !== null && info.type === 'file') {

				let custom = null;

				if (path.startsWith('/build/') && path.endsWith('.js')) {

					let check = project.filesystem.info(path + '.map');
					if (check !== null && check.type === 'file') {
						custom = {
							'sourcemap': url + '.map'
						};
					}

				}


				let timestamp = headers['if-modified-since'] || null;
				if (timestamp !== null) {

					let diff = info.mtime > new Date(timestamp);
					if (diff === false) {

						tunnel.send('', {
							'status':        '304 Not Modified',
							'last-modified': info.mtime.toUTCString()
						});

						return true;

					} else {

						project.filesystem.read(path, payload => {
							tunnel.send(payload, _get_headers(info, mime, custom));
						});

						return true;

					}

				} else {

					project.filesystem.read(path, payload => {
						tunnel.send(payload, _get_headers(info, mime, custom));
					});


					return true;

				}

			}


			return false;

		}

	};


	return Module;

});

