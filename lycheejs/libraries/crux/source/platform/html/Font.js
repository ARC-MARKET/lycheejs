
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

	const _parse_font = function() {

		let data = this.__buffer;

		if (typeof data.kerning === 'number' && typeof data.spacing === 'number') {

			if (data.kerning > data.spacing) {
				data.kerning = data.spacing;
			}

		}


		if (data.texture !== undefined) {

			let texture = new Texture(data.texture);

			texture.onload = result => {
				this.texture = texture;
			};

			texture.load();

		} else {

			console.warn('Invalid Font at "' + this.url + '" (No FNT file).');

		}


		this.baseline   = typeof data.baseline === 'number'   ? data.baseline   : this.baseline;
		this.charset    = typeof data.charset === 'string'    ? data.charset    : this.charset;
		this.lineheight = typeof data.lineheight === 'number' ? data.lineheight : this.lineheight;
		this.kerning    = typeof data.kerning === 'number'    ? data.kerning    : this.kerning;
		this.spacing    = typeof data.spacing === 'number'    ? data.spacing    : this.spacing;


		if (data.font instanceof Object) {

			this.__font.color   = data.font.color   || '#ffffff';
			this.__font.family  = data.font.family  || 'Ubuntu Mono';
			this.__font.outline = data.font.outline || 0;
			this.__font.size    = data.font.size    || 16;
			this.__font.style   = data.font.style   || 'normal';

		}


		_parse_font_characters.call(this);

	};

	const _parse_font_characters = function() {

		let data = this.__buffer;
		let url  = this.url;

		if (_CHAR_CACHE[url] === undefined) {
			_CHAR_CACHE[url] = {};
		}

		if (data.map instanceof Array) {

			let offset = this.spacing;

			for (let c = 0, cl = this.charset.length; c < cl; c++) {

				let id  = this.charset[c];
				let chr = {
					width:      data.map[c] + this.spacing * 2,
					height:     this.lineheight,
					realwidth:  data.map[c],
					realheight: this.lineheight,
					x:          offset - this.spacing,
					y:          0
				};

				offset += chr.width;

				_CHAR_CACHE[url][id] = chr;

			}

		}

	};


	const _CHAR_CACHE = {};
	const _FONT_CACHE = {};

	const _clone_font = function(origin, clone) {

		if (origin.__buffer !== null) {

			clone.__buffer = origin.__buffer;
			clone.__load   = false;

			_parse_font.call(clone);

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Font = function(url) {

		url = typeof url === 'string' ? url : null;


		this.url        = url;
		this.onload     = null;
		this.texture    = null;

		this.baseline   = 0;
		this.charset    = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
		this.kerning    = 0;
		this.spacing    = 0;
		this.lineheight = 0;

		this.__buffer   = null;
		this.__font     = {
			color:   '#ffffff',
			family:  'Ubuntu Mono',
			outline: 0,
			size:    16,
			style:   'normal'
		};
		this.__load     = true;


		if (url !== null) {

			if (_CHAR_CACHE[url] === undefined) {

				_CHAR_CACHE[url]     = {};
				_CHAR_CACHE[url][''] = {
					width:      0,
					height:     this.lineheight,
					realwidth:  0,
					realheight: this.lineheight,
					x:          0,
					y:          0
				};

			}


			if (_FONT_CACHE[url] !== undefined) {
				_clone_font(_FONT_CACHE[url], this);
			} else {
				_FONT_CACHE[url] = this;
			}

		}

	};


	Font.prototype = {

		deserialize: function(blob) {

			if (typeof blob.buffer === 'string') {

				let tmp1 = blob.buffer.substr(blob.buffer.indexOf(',') + 1);
				let tmp2 = Buffer.from(tmp1, 'base64');

				try {
					this.__buffer = JSON.parse(tmp2.toString('utf8'));
				} catch (err) {
				}

				this.__load   = false;
				_parse_font.call(this);

			}

		},

		serialize: function() {

			let blob = {};


			if (this.__buffer !== null) {

				let tmp1 = JSON.stringify(this.__buffer, null, '\t');
				let tmp2 = Buffer.from(tmp1, 'utf8');

				blob.buffer = 'data:application/json;base64,' + tmp2.toString('base64');

			}


			return {
				'constructor': 'Font',
				'arguments':   [ this.url ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		measure: function(text) {

			text = typeof text === 'string' ? text : '';


			let buffer = this.__buffer;
			if (buffer !== null) {

				// Cache Usage
				if (this.__load === false) {

					let cache = _CHAR_CACHE[this.url] || null;
					if (cache !== null) {

						let tl = text.length;
						if (tl === 1) {

							if (cache[text] !== undefined) {
								return cache[text];
							}

						} else if (tl > 1) {

							let data = cache[text] || null;
							if (data === null) {

								let width = 0;
								let map   = buffer.map;

								for (let t = 0; t < tl; t++) {

									let m = this.charset.indexOf(text[t]);
									if (m !== -1) {
										width += map[m] + this.kerning;
									}

								}

								if (width > 0) {

									// TODO: Embedded Font ligatures will set x and y values based on settings.map
									data = cache[text] = {
										width:      width,
										height:     this.lineheight,
										realwidth:  width,
										realheight: this.lineheight,
										x:          0,
										y:          0
									};

								}

							}


							return data;

						}


						return cache[''];

					}

					// Temporary Usage
				} else {

					let tl = text.length;
					if (tl === 1) {

						let m = this.charset.indexOf(text);
						if (m !== -1) {

							let offset  = this.spacing;
							let spacing = this.spacing;
							let map     = buffer.map;

							for (let c = 0; c < m; c++) {
								offset += map[c] + spacing * 2;
							}

							return {
								width:      map[m] + spacing * 2,
								height:     this.lineheight,
								realwidth:  map[m],
								realheight: this.lineheight,
								x:          offset - spacing,
								y:          0
							};

						}

					} else if (tl > 1) {

						let width = 0;
						let map   = buffer.map;

						for (let t = 0; t < tl; t++) {

							let m = this.charset.indexOf(text[t]);
							if (m !== -1) {
								width += map[m] + this.kerning;
							}

						}

						if (width > 0) {

							return {
								width:      width,
								height:     this.lineheight,
								realwidth:  width,
								realheight: this.lineheight,
								x:          0,
								y:          0
							};

						}

					}


					return {
						width:      0,
						height:     this.lineheight,
						realwidth:  0,
						realheight: this.lineheight,
						x:          0,
						y:          0
					};

				}

			}


			return null;

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

				this.__buffer = data;
				this.__load   = false;

				if (data !== null) {
					_parse_font.call(this);
				}

				if (this.onload instanceof Function) {
					this.onload(data !== null);
					this.onload = null;
				}

			}.bind(this);

			xhr.onerror = xhr.ontimeout = function() {

				this.__buffer = null;
				this.__load   = false;

				if (this.onload instanceof Function) {
					this.onload(false);
					this.onload = null;
				}

			}.bind(this);

			xhr.send(null);

		}

	};


	global.Font = Font;

})(this.lychee, this);

