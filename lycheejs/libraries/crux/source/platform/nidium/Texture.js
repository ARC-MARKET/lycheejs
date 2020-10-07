
(function(lychee, global) {



	/*
	 * HELPERS
	 */

	let   _TEXTURE_ID    = 0;
	const _TEXTURE_CACHE = {};

	const _clone_texture = function(origin, clone) {

		// Keep reference of Texture ID for OpenGL alike platforms
		clone.id = origin.id;


		if (origin.buffer !== null) {

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

				let image = new Image();

				image.onload = _ => {
					this.buffer = image;
					this.width  = image.width;
					this.height = image.height;
				};

				image.src   = blob.buffer;
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


			let buffer;

			let url = this.url;
			if (url.startsWith('data:')) {

				if (url.startsWith('data:image/png;')) {

					buffer = new Image();

					buffer.addEventListener('load', _ => {

						this.buffer = buffer;
						this.width  = buffer.width;
						this.height = buffer.height;

						this.__load = false;
						this.buffer.toString('base64');


						let is_power_of_two = (this.width & (this.width - 1)) === 0 && (this.height & (this.height - 1)) === 0;
						if (lychee.debug === true && is_power_of_two === false) {
							console.warn('Invalid Texture at data:image/png; (NOT power-of-two).');
						}


						if (this.onload instanceof Function) {
							this.onload(true);
							this.onload = null;
						}

					});

					buffer.addEventListener('error', _ => {

						if (this.onload instanceof Function) {
							this.onload(false);
							this.onload = null;
						}

					});

					buffer.src = url;

				} else {

					console.warn('Invalid Texture at "' + url.substr(0, 15) + '" (No PNG file).');


					if (this.onload instanceof Function) {
						this.onload(false);
						this.onload = null;
					}

				}

			} else {

				if (url.endsWith('.png')) {

					buffer = new Image();

					buffer.addEventListener('load', _ => {

						this.buffer = buffer;
						this.width  = buffer.width;
						this.height = buffer.height;

						this.__load = false;
						this.buffer.toString('base64');


						let is_power_of_two = (this.width & (this.width - 1)) === 0 && (this.height & (this.height - 1)) === 0;
						if (lychee.debug === true && is_power_of_two === false) {
							console.warn('Invalid Texture at "' + this.url + '" (NOT power-of-two).');
						}


						if (this.onload instanceof Function) {
							this.onload(true);
							this.onload = null;
						}

					});

					buffer.addEventListener('error', _ => {

						if (this.onload instanceof Function) {
							this.onload(false);
							this.onload = null;
						}

					});


					buffer.src = lychee.environment.resolve(url);

				} else {

					console.warn('Invalid Texture at "' + this.url + '" (no PNG file).');


					if (this.onload instanceof Function) {
						this.onload(false);
						this.onload = null;
					}

				}

			}

		}

	};


	global.Texture = Texture;

})(lychee, typeof global !== 'undefined' ? global : this);
