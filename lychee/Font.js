
lychee.define('Font').exports(function(lychee, global) {

	var Class = function(spriteOrImages, settings) {

		this.settings = lychee.extend({}, this.defaults, settings);

		if (this.settings.kerning > this.settings.spacing) {
			this.settings.kerning = this.settings.spacing;
		}

		this.__cache = {};
		this.__images = null;
		this.__sprite = null;


		if (Object.prototype.toString.call(spriteOrImages) === '[object Array]') {

			this.__images = spriteOrImages;

		} else {

			this.__sprite = spriteOrImages;

		}

		this.__init();

	};


	Class.prototype = {

		defaults: {
			// default charset from 32-126
			charset: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
			baseline: 0,
			spacing: 0,
			kerning: 0,
			map: null
		},

		__init: function() {

			// Single Image Mode
			if (this.__images !== null) {

				this.__initImages();

			// Sprite Image Mode
			} else if (this.__sprite !== null) {

				if (Object.prototype.toString.call(this.settings.map) === '[object Array]') {

					var test = this.settings.map[0];
					if (Object.prototype.toString.call(test) === '[object Object]') {
						this.__initSpriteXY();
					} else if (typeof test === 'number') {
						this.__initSpriteX();
					}

				}

			}

		},

		__initImages: function() {

			for (var c = 0, l = this.settings.charset.length; c < l; c++) {

				var image = this.__images[c] || null;
				if (image === null) continue;

				var chr = {
					id: this.settings.charset[c],
					image: image,
					width: image.width,
					height: image.height,
					x: 0,
					y: 0
				};

				this.__cache[chr.id] = chr;

			}

		},

		__initSpriteX: function() {

			var offset = this.settings.spacing;

			for (var c = 0, l = this.settings.charset.length; c < l; c++) {

				var chr = {
					id: this.settings.charset[c],
					width: this.settings.map[c] + this.settings.spacing * 2,
					height: this.__sprite.height,
					real: this.settings.map[c],
					x: offset - this.settings.spacing,
					y: 0
				};


				offset += chr.width;

				this.__cache[chr.id] = chr;

			}

		},

		__initSpriteXY: function() {

			for (var c = 0, l = this.settings.charset.length; c < l; c++) {

				var frame = this.settings.map[c];

				var chr = {
					id: this.settings.charset[c],
					width: frame.width + this.settings.spacing * 2,
					height: frame.height,
					real: frame.width,
					x: frame.x - this.settings.spacing,
					y: frame.y
				};

				this.__cache[chr.id] = chr;

			}

		},

		get: function(id) {

			if (this.__cache[id] !== undefined) {
				return this.__cache[id];
			}


			return null;

		},

		getSettings: function() {
			return this.settings;
		},

		getSprite: function() {
			return this.__sprite;
		}

	};


	return Class;

});

