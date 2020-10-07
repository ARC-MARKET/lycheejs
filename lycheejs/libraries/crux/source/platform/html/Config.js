
(function(lychee, global) {

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

	const _CONFIG_CACHE = {};

	const _clone_config = function(origin, clone) {

		if (origin.buffer !== null) {

			clone.buffer = JSON.parse(JSON.stringify(origin.buffer));

			clone.__load = false;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Config = function(url) {

		url = typeof url === 'string' ? url : null;


		this.url    = url;
		this.onload = null;
		this.buffer = null;

		this.__load = true;


		if (url !== null) {

			if (_CONFIG_CACHE[url] !== undefined) {
				_clone_config(_CONFIG_CACHE[url], this);
			} else {
				_CONFIG_CACHE[url] = this;
			}

		}

	};


	Config.prototype = {

		deserialize: function(blob) {

			if (typeof blob.buffer === 'string') {

				let tmp1 = blob.buffer.substr(blob.buffer.indexOf(',') + 1);
				let tmp2 = Buffer.from(tmp1, 'base64');

				try {
					this.buffer = JSON.parse(tmp2.toString('utf8'));
				} catch (err) {
				}

				this.__load = false;

			}

		},

		serialize: function() {

			let blob = {};


			if (this.buffer !== null) {

				let tmp1 = JSON.stringify(this.buffer, null, '\t');
				let tmp2 = Buffer.from(tmp1, 'utf8');

				blob.buffer = 'data:application/json;base64,' + tmp2.toString('base64');

			}


			return {
				'constructor': 'Config',
				'arguments':   [ this.url ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		load: function() {

			if (this.__load === false) {

				if (this.onload instanceof Function) {
					this.onload(true);
					this.onload = null;
				}

				return;

			}


			let path = lychee.environment.resolve(this.url);
			let xhr  = new XMLHttpRequest();

			if (path.startsWith('/opt/lycheejs') && _protocol !== null) {
				xhr.open('GET', _protocol + '://' + path, true);
			} else {
				xhr.open('GET', path, true);
			}

			xhr.setRequestHeader('Content-Type', 'application/json; charset=utf8');

			xhr.onload = function() {

				let data = null;

				try {
					data = JSON.parse(xhr.responseText);
				} catch (err) {
				}

				this.buffer = data;
				this.__load = false;

				if (data === null) {

					console.warn('Invalid Config at "' + this.url + '" (No JSON file).');

					if (path.startsWith('/opt/lycheejs') && _protocol !== null) {
						console.warn(_protocol + '://' + path);
					} else {
						console.warn(path);
					}

				}

				if (this.onload instanceof Function) {
					this.onload(data !== null);
					this.onload = null;
				}

			}.bind(this);

			xhr.onerror = xhr.ontimeout = function() {

				this.buffer = null;
				this.__load = false;

				console.warn('Invalid Config at "' + this.url + '" (No JSON file).');

				if (path.startsWith('/opt/lycheejs') && _protocol !== null) {
					console.warn(_protocol + '://' + path);
				} else {
					console.warn(path);
				}

				if (this.onload instanceof Function) {
					this.onload(false);
					this.onload = null;
				}

			}.bind(this);

			xhr.send(null);

		}

	};


	global.Config = Config;

})(this.lychee, this);

