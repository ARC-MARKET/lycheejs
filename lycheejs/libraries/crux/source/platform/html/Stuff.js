
(function(lychee, global) {

	const _document = global.document;
	const _protocol = (function(location) {

		let origin   = location.origin || '';
		let protocol = origin.split(':')[0] || '';

		if (/^(http|https)$/g.test(protocol)) {
			return protocol;
		} else if (/^(file|chrome-extension)$/g.test(protocol)) {
			return 'file';
		} else {
			return null;
		}

	})(global.location || {});



	/*
	 * HELPERS
	 */

	const _STUFF_CACHE = {};

	const _clone_stuff = function(origin, clone) {

		if (origin.buffer !== null) {

			clone.buffer = origin.buffer;

			clone.__load = false;

		}

	};

	const _execute_stuff = function(callback) {

		let url    = this.url;
		let ignore = this.__ignore;

		if (url.endsWith('.js') && ignore === false) {

			let tmp = _document.createElement('script');

			tmp._filename = url;
			tmp.async     = true;

			tmp.onload = function() {

				callback.call(this, true);
				_document.body.removeChild(tmp);

			}.bind(this);

			tmp.onerror = function() {

				callback.call(this, false);
				_document.body.removeChild(tmp);

			}.bind(this);

			let path = lychee.environment.resolve(url);
			if (path.startsWith('/opt/lycheejs') && _protocol !== null) {
				tmp.src = _protocol + '://' + path;
			} else {
				tmp.src = path;
			}

			_document.body.appendChild(tmp);

		} else {

			callback.call(this, true);

		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Stuff = function(url, ignore) {

		url    = typeof url === 'string' ? url : null;
		ignore = ignore === true;


		this.url      = url;
		this.onload   = null;
		this.buffer   = null;

		this.__ignore = ignore;
		this.__load   = true;


		if (url !== null) {

			if (_STUFF_CACHE[url] !== undefined) {
				_clone_stuff(_STUFF_CACHE[url], this);
			} else {
				_STUFF_CACHE[url] = this;
			}

		}

	};


	Stuff.prototype = {

		deserialize: function(blob) {

			if (typeof blob.buffer === 'string') {

				let tmp = blob.buffer.substr(blob.buffer.indexOf(',') + 1);

				this.buffer = Buffer.from(tmp, 'base64');
				this.__load = false;

			}

		},

		serialize: function() {

			let blob = {};
			let mime = 'application/octet-stream';


			if (this.url.endsWith('.js')) {
				mime = 'application/javascript';
			}


			if (this.buffer !== null) {
				blob.buffer = 'data:' + mime + ';base64,' + this.buffer.toString('base64');
			}


			return {
				'constructor': 'Stuff',
				'arguments':   [ this.url ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		load: function() {

			if (this.__load === false) {

				_execute_stuff.call(this, function(result) {

					if (this.onload instanceof Function) {
						this.onload(result);
						this.onload = null;
					}

				});


				return;

			}


			let path = lychee.environment.resolve(this.url);
			let xhr  = new XMLHttpRequest();

			if (path.startsWith('/opt/lycheejs') && _protocol !== null) {
				xhr.open('GET', _protocol + '://' + path, true);
			} else {
				xhr.open('GET', path, true);
			}

			xhr.responseType = 'arraybuffer';

			xhr.onload = function() {

				let raw = xhr.response || null;
				if (raw !== null) {

					this.buffer = Buffer.from(raw);
					this.__load = false;

					_execute_stuff.call(this, function(result) {

						if (this.onload instanceof Function) {
							this.onload(result);
							this.onload = null;
						}

					});

				} else {

					this.buffer = null;
					this.__load = false;

					if (this.onload instanceof Function) {
						this.onload(false);
						this.onload = null;
					}

				}

			}.bind(this);

			xhr.onerror = xhr.ontimeout = function() {

				this.buffer = null;
				this.__load = false;

				if (this.onload instanceof Function) {
					this.onload(false);
					this.onload = null;
				}

			}.bind(this);

			xhr.send(null);

		}

	};


	global.Stuff = Stuff;

})(this.lychee, this);

