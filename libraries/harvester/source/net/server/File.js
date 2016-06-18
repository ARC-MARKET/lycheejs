
lychee.define('harvester.net.server.File').requires([
	'harvester.data.Filesystem'
]).exports(function(lychee, global, attachments) {

	var _MIME = {

		'default': { binary: true,  type: 'application/octet-stream'      },

		'css':     { binary: false, type: 'text/css'                      },
		'env':     { binary: false, type: 'application/json'              },
		'eot':     { binary: false, type: 'application/vnd.ms-fontobject' },
		'gz':      { binary: true,  type: 'application/x-gzip'            },
		'fnt':     { binary: false, type: 'application/json'              },
		'html':    { binary: false, type: 'text/html'                     },
		'ico':     { binary: true,  type: 'image/x-icon'                  },
		'jpg':     { binary: true,  type: 'image/jpeg'                    },
		'js':      { binary: false, type: 'application/javascript'        },
		'json':    { binary: false, type: 'application/json'              },
		'md':      { binary: false, type: 'text/x-markdown'               },
		'mf':      { binary: false, type: 'text/cache-manifest'           },
		'mp3':     { binary: true,  type: 'audio/mp3'                     },
		'ogg':     { binary: true,  type: 'application/ogg'               },
		'pkg':     { binary: false, type: 'application/json'              },
		'store':   { binary: false, type: 'application/json'              },
		'tar':     { binary: true,  type: 'application/x-tar'             },
		'ttf':     { binary: false, type: 'application/x-font-truetype'   },
		'txt':     { binary: false, type: 'text/plain'                    },
		'png':     { binary: true,  type: 'image/png'                     },
		'svg':     { binary: true,  type: 'image/svg+xml'                 },
		'woff':    { binary: true,  type: 'application/font-woff'         },
		'woff2':   { binary: true,  type: 'application/font-woff'         },
		'xml':     { binary: false, type: 'text/xml'                      },
		'zip':     { binary: true,  type: 'application/zip'               }

	};

	var _Filesystem        = lychee.import('harvester.data.Filesystem');
	var _PUBLIC_CULTIVATOR = {
		identifier: '/projects/cultivator',
		filesystem: new _Filesystem('/projects/cultivator')
	};
	var _PUBLIC_PROJECT    = {
		identifier: '/libraries/harvester/public',
		filesystem: new _Filesystem('/libraries/harvester/public')
	};



	/*
	 * HELPERS
	 */

	var _get_headers = function(info, mime) {

		var headers = {
			'status':          '200 OK',
			'e-tag':           '"' + info.length + '-' + Date.parse(info.mtime) + '"',
			'last-modified':   new Date(info.mtime).toUTCString(),
			'content-control': 'no-transform',
			'content-type':    mime.type,
			'expires':         new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toUTCString(),
			'vary':            'Accept-Encoding',
			'@binary':         mime.binary
		};


		if (mime.type.substr(0, 4) === 'text') {
			headers['content-type'] = mime.type + '; charset=utf-8';
		}


		return headers;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {

		/*
		 * MODULE API
		 */

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

			var info    = null;
			var path    = null;
			var project = null;
			var tunnel  = this.tunnel;
			var url     = headers['url'];
			var mime    = _MIME[url.split('.').pop()] || _MIME['default'];


			// Multi-library mode /libraries/*
			if (url.substr(0, 10) === '/libraries') {

				identifier = url.split('/').slice(0, 3).join('/');
				path       = '/' + url.split('/').slice(3).join('/');
				project    = lychee.import('MAIN')._libraries[identifier] || null;


			// Multi-project mode /projects/cultivator/*
			} else if (url.substr(0, 20) === '/projects/cultivator') {

				identifier = url.split('/').slice(0, 4).join('/');
				path       = '/' + url.split('/').slice(4).join('/');
				project    = lychee.import('MAIN')._projects[identifier] || null;


				// /projects/cultivator/design/*, /projects/cultivator/index.html
				if (project === null) {
					identifier = url.split('/').slice(0, 3).join('/');
					path       = '/' + url.split('/').slice(3).join('/');
					project    = _PUBLIC_CULTIVATOR;
				}


			// Multi-project mode /projects/*
			} else if (url.substr(0, 9) === '/projects') {

				identifier = url.split('/').slice(0, 3).join('/');
				path       = '/' + url.split('/').slice(3).join('/');
				project    = lychee.import('MAIN')._projects[identifier] || null;


			// Single-project mode
			} else if (lychee.ROOT.lychee !== lychee.ROOT.project) {

				identifier = lychee.ROOT.project;
				path       = url;
				project    = lychee.import('MAIN')._projects[identifier] || null;


			// /favicon.ico
			} else {

				identifier = null;
				path       = url;
				project    = _PUBLIC_PROJECT;

			}


			if (project !== null) {
				info = project.filesystem.info(path);
			}


			if (project !== null && info !== null && info.type === 'file') {

				var timestamp = headers['if-modified-since'] || null;
				if (timestamp !== null) {

					var diff = info.mtime > new Date(timestamp);
					if (diff === false) {

						tunnel.send('', {
							'status':        '304 Not Modified',
							'last-modified': info.mtime.toUTCString()
						});

						return true;

					} else {

						project.filesystem.read(path, function(payload) {
							tunnel.send(payload, _get_headers(info, mime));
						});

						return true;

					}

				} else {

					project.filesystem.read(path, function(payload) {
						tunnel.send(payload, _get_headers(info, mime));
					});


					return true;

				}

			}


			return false;

		}

	};


	return Module;

});

