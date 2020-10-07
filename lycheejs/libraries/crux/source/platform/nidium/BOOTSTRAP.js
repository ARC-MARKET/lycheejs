
(function(lychee, global) {

	const _File = global.File;


	(function(process, selfpath) {

		let tmp1 = selfpath.indexOf('/libraries/lychee');
		if (tmp1 !== -1) {
			lychee.ROOT.lychee = selfpath.substr(0, tmp1);
		}

		let tmp2 = selfpath.split('/').slice(0, 3).join('/');
		if (tmp2.startsWith('/opt/lycheejs')) {
			lychee.ROOT.lychee = tmp2;
		}

		let cwd = typeof process.cwd === 'function' ? process.cwd() : '';
		if (cwd !== '') {
			lychee.ROOT.project = cwd;
		}

	})(global.process || {}, typeof __filename === 'string' ? __filename : '');



	/*
	 * FEATURE DETECTION
	 */

	(function() {

		const _buffer_cache = {};
		const _load_buffer  = function(url) {

			let cache = _buffer_cache[url] || null;
			if (cache === null) {

				let path = lychee.environment.resolve(url);
				let file = new _File(path, { encoding: 'binary' });

				try {
					cache = _buffer_cache[url] = Buffer.from(file.readSync());
				} catch (err) {
					cache = _buffer_cache[url] = Buffer.alloc(0);
				}

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

	global.require = require;

	Object.defineProperty(lychee, 'FILENAME', {

		get: function() {

			let filename = global.__FILENAME || null;
			if (filename !== null) {
				return filename;
			}

			return null;

		},

		set: function() {
			return false;
		}

	});

})(lychee, typeof global !== 'undefined' ? global : this);

