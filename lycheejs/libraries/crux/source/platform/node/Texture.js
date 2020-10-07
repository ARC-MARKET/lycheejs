
(function(lychee, global) {

	const _fs = require('fs');



	/*
	 * HELPERS
	 */

	let   _TEXTURE_ID    = 0;
	const _TEXTURE_CACHE = {};

	const _parse_texture = function(data) {

		this.width  = (data[0] << 24) | (data[1] << 16) | (data[2] << 8) | data[3];
		this.height = (data[4] << 24) | (data[5] << 16) | (data[6] << 8) | data[7];

	};

	const _clone_texture = function(origin, clone) {

		if (origin.buffer !== null) {

			clone.id     = origin.id;

			clone.buffer = origin.buffer;
			clone.width  = origin.width;
			clone.height = origin.height;

			clone.__load = false;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Texture = function(url) {

		url = typeof url === 'string' ? url : null;


		this.id     = _TEXTURE_ID++;
		this.url    = url;
		this.onload = null;
		this.buffer = null;
		this.width  = 0;
		this.height = 0;

		this.__load = true;


		if (url !== null && url.startsWith('data:image') === false) {

			if (_TEXTURE_CACHE[url] !== undefined) {
				_clone_texture(_TEXTURE_CACHE[url], this);
			} else {
				_TEXTURE_CACHE[url] = this;
			}

		}

	};


	Texture.prototype = {

		deserialize: function(blob) {

			if (typeof blob.buffer === 'string') {

				let tmp = blob.buffer.substr(blob.buffer.indexOf(',') + 1);

				this.buffer = Buffer.from(tmp, 'base64');
				this.__load = false;

			}

		},

		serialize: function() {

			let blob = {};


			if (this.buffer !== null) {
				blob.buffer = 'data:image/png;base64,' + this.buffer.toString('base64');
			}


			return {
				'constructor': 'Texture',
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


			let url = this.url;
			if (url.startsWith('data:')) {

				if (url.startsWith('data:image/png;')) {

					let b64data = url.substr(15, url.length - 15);
					this.buffer = Buffer.from(b64data, 'base64');
					this.__load = false;

					_parse_texture.call(this, this.buffer.slice(16, 24));


					let is_power_of_two = (this.width & (this.width - 1)) === 0 && (this.height & (this.height - 1)) === 0;
					if (lychee.debug === true && is_power_of_two === false) {
						console.warn('Invalid Texture at data:image/png; (NOT power-of-two).');
					}

				} else {

					console.warn('Invalid Texture at "' + url.substr(0, 15) + '" (No PNG file).');

				}


				if (this.onload instanceof Function) {
					this.onload(this.buffer !== null);
					this.onload = null;
				}

			} else {

				if (url.endsWith('.png')) {


					let path = lychee.environment.resolve(url);

					_fs.readFile(path, (error, buffer) => {

						this.buffer = buffer || null;
						this.__load = false;

						if (this.buffer !== null) {
							_parse_texture.call(this, this.buffer);
						}

						let is_power_of_two = (this.width & (this.width - 1)) === 0 && (this.height & (this.height - 1)) === 0;
						if (lychee.debug === true && is_power_of_two === false) {
							console.warn('Invalid Texture at "' + this.url + '" (NOT power-of-two).');
						}

						if (this.onload instanceof Function) {
							this.onload(buffer !== null);
							this.onload = null;
						}

					});

				} else {

					console.warn('Invalid Texture at "' + this.url + '" (No PNG file).');


					if (this.onload instanceof Function) {
						this.onload(false);
						this.onload = null;
					}

				}

			}

		}

	};


	global.Texture = Texture;

})(lychee, global);

