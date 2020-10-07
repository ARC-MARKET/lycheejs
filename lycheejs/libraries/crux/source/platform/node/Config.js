
(function(lychee, global) {

	const _fs = require('fs');



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

			_fs.readFile(path, 'utf8', (error, buffer) => {

				let data = null;
				try {
					data = JSON.parse(buffer);
				} catch (err) {
				}


				this.buffer = data;
				this.__load = false;

				if (data === null) {
					console.warn('Invalid Config at "' + this.url + '" (No JSON file).');
					console.warn(path);
				}

				if (this.onload instanceof Function) {
					this.onload(data !== null);
					this.onload = null;
				}

			});

		}

	};


	global.Config = Config;

})(lychee, global);

