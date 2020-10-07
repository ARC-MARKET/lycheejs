
(function(lychee, global) {

	const _document = global.document;


	(function(location, selfpath) {

		let origin   = location.origin || '';
		let cwd      = (location.pathname || '');
		let protocol = origin.split(':')[0];


		// Hint: CDNs might have no proper redirect to index.html
		if (/\.(htm|html)$/g.test(cwd.split('/').pop()) === true) {
			cwd = cwd.split('/').slice(0, -1).join('/');
		}


		if (/^(http|https)$/g.test(protocol)) {

			// Hint: The harvester (HTTP server) understands
			// /projects/* and /libraries/* requests.

			lychee.ROOT.lychee = '';


			if (cwd !== '') {
				lychee.ROOT.project = cwd === '/' ? '' : cwd;
			}

		} else if (/^(app|file|chrome-extension)$/g.test(protocol)) {

			let tmp1 = selfpath.indexOf('/libraries/lychee');
			let tmp2 = selfpath.indexOf('://');

			if (tmp1 !== -1 && tmp2 !== -1) {
				lychee.ROOT.lychee = selfpath.substr(0, tmp1).substr(tmp2 + 3);
			} else if (tmp1 !== -1) {
				lychee.ROOT.lychee = selfpath.substr(0, tmp1);
			}


			let tmp3 = selfpath.split('/').slice(0, 3).join('/');
			if (tmp3.startsWith('/opt/lycheejs')) {
				lychee.ROOT.lychee = tmp3;
			}

			if (cwd !== '') {
				lychee.ROOT.project = cwd;
			}

		}

	})(global.location || {}, (_document.currentScript || {}).src || '');



	/*
	 * FEATURE DETECTION
	 */

	(function() {

		const _buffer_cache = {};
		const _load_buffer  = function(url) {

			let cache = _buffer_cache[url] || null;
			if (cache === null) {

				let xhr = new XMLHttpRequest();

				xhr.open('GET', url, true);
				xhr.responseType = 'arraybuffer';
				xhr.onload = function() {
					cache = _buffer_cache[url] = Buffer.from(xhr.response);
				};
				xhr.onerror = xhr.ontimeout = function() {
					cache = _buffer_cache[url] = Buffer.alloc(0);
				};
				xhr.send(null);

			}

			return cache;

		};


		let audio = 'Audio' in global && typeof Audio !== 'undefined';
		if (audio === false) {

			Audio = function() {

				this.src         = '';
				this.currentTime = 0;
				this.volume      = 0;
				this.autobuffer  = false;
				this.preload     = false;

				this.onload  = null;
				this.onerror = null;

			};


			Audio.prototype = {

				load: function() {

					if (this.onerror !== null) {
						this.onerror.call(this);
					}

				},

				play: function() {

				},

				pause: function() {

				},

				addEventListener: function() {

				}

			};

		}


		Audio.prototype.toString = function(encoding) {

			if (encoding === 'base64' || encoding === 'binary') {

				let url = this.src;
				if (url !== '' && url.startsWith('data:') === false) {

					let buffer = _load_buffer(url);
					if (buffer !== null) {
						return buffer.toString(encoding);
					}

				}


				let index = url.indexOf('base64,') + 7;
				if (index > 7) {

					let tmp = url.substr(index, url.length - index);
					if (tmp.length > 0) {
						return Buffer.from(tmp, 'base64').toString(encoding);
					}

				}


				return '';

			}


			return Object.prototype.toString.call(this);

		};


		let image = 'Image' in global && typeof Image !== 'undefined';
		if (image === false) {

			Image = function() {

				this.src    = '';
				this.width  = 0;
				this.height = 0;

				this.onload  = null;
				this.onerror = null;

			};


			Image.prototype = {

				load: function() {

					if (this.onerror !== null) {
						this.onerror.call(this);
					}

				}

			};

		}


		Image.prototype.toString = function(encoding) {

			if (encoding === 'base64' || encoding === 'binary') {

				let url = this.src;
				if (url !== '' && url.startsWith('data:') === false) {

					let buffer = _load_buffer(url);
					if (buffer !== null) {
						return buffer.toString(encoding);
					}

				}


				let index = url.indexOf('base64,') + 7;
				if (index > 7) {

					let tmp = url.substr(index, url.length - index);
					if (tmp.length > 0) {
						return Buffer.from(tmp, 'base64').toString(encoding);
					}

				}


				return '';

			}


			return Object.prototype.toString.call(this);

		};

	})();



	/*
	 * EXPORTS
	 */

	Object.defineProperty(lychee, 'FILENAME', {

		get: function() {

			let script = _document.currentScript || null;
			if (script !== null) {
				return script._filename;
			}

			return null;

		},

		set: function() {
			return false;
		}

	});

})(this.lychee, this);

