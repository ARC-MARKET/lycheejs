
editor.plugins.model.sprite = function(canvas, ui, editor) {

	this.type = 'model';
	this.name = 'sprite';

	this._canvas = canvas;
	this._ui = ui;
	this._editor = editor;

	this.reset();
	this.init();

};



editor.plugins.model.sprite.prototype = {

	reset: function() {

		this.__data = {};
		this.__shift = null;

	},

	/*
	 * PLUGIN API
	 */
	init: function() {

		this.__fieldset = this._ui.addFieldset(this.type, this.name);
		this.__lightbox = this._ui.addLightbox(this.type, this.name);
		this.__layer = this._canvas.addLayer(this.name, 'canvas');
		this.__ctx = this.__layer.element.getContext('2d');

		this.__initUI();

	},

	onActivate: function() {
		this.__layer.show();
	},

	onDeactivate: function() {
		this.__layer.hide();
	},

	onImport: function(data) {

		this.reset();

		if (data.sprite !== undefined) {

			// translate the sprite's pixel position to absolute pixel position
			var position = {
				x: data.sprite.position.x,
				y: data.sprite.position.y
			};

			if (this._canvas.settings.invertedX === true) {
				position.x *= -1;
			}
			if (this._canvas.settings.invertedY === true) {
				position.y *= -1;
			}

			var absolute = this._canvas.translateTo('absolute', position, true, true);

			this.__data = {
				sprite: data.sprite,
				position: absolute
			};

		}

		this.__refreshLayer();

	},

	onExport: function(data) {

		if (this.__data.sprite !== undefined) {

			var sprite = this.__data.sprite;
			var position = this._canvas.translateTo('relative', this.__data.position, true, true);

			if (this._canvas.settings.invertedX === true) {
				position.x *= -1;
			}
			if (this._canvas.settings.invertedY === true) {
				position.y *= -1;
			}

			sprite.position.x = position.x;
			sprite.position.y = position.y;

			data.sprite = sprite;

		}

	},



	/*
	 * PRIVATE API
	 */
	__initUI: function() {

		var content,
			fieldset = this.__fieldset;

		fieldset.clear();

		content = new ly.ui.button('Set', function() {
			this.__showLightbox();
		}, this);
		fieldset.add(content);

		content = new ly.ui.button('Move', function() {
			this.__layer.once(this.__move, this);
		}, this);
		fieldset.add(content);

	},

	__refreshLayer: function() {

		if (this.__ctx !== undefined) {

			var ctx = this.__ctx;
			ctx.clearRect(0, 0, this.__layer.element.width, this.__layer.element.height);

			if (Object.prototype.toString.call(this.__data.sprite) === '[object Object]') {

				var position = this.__data.position,
					sprite = this.__data.sprite;

				ctx.drawImage(
					sprite.image,
					0, 0, sprite.width, sprite.height,
					position.x, position.y, sprite.width, sprite.height
				);

			}

		}

	},

	__set: function(sprite) {

		if (sprite instanceof HTMLElement) {

			var relative = {
				x: -1 * sprite.width / 2,
				y: -1 * sprite.height / 2
			};

			if (this._canvas.settings.invertedX === true) {
				relative.x *= -1;
			}
			if (this._canvas.settings.invertedY === true) {
				relative.y *= -1;
			}

			var absolute = this._canvas.translateTo('absolute', relative, true, true);

			this.__data = {
				position: absolute,
				sprite: {
					width: sprite.width,
					height: sprite.height,
					image: sprite,
					position: {
						x: 0, y: 0 // dummy data
					}
				}
			};

			this.__refreshLayer();

		}


	},

	__move: function(event, relative, absolute) {

		if (this.__data.sprite === undefined) {
			return;
		}


		if (event === 'down') {

			this.__shift = {
				x: this.__data.position.x - absolute.x * absolute.tile,
				y: this.__data.position.y - absolute.y * absolute.tile
			};

			return;

		} else if (event === 'up') {

			this.__shift = null;
			return;

		} else if (this.__shift !== null) {

			this.__data.position.x = this.__shift.x + absolute.x * absolute.tile;
			this.__data.position.y = this.__shift.y + absolute.y * absolute.tile;

			this.__refreshLayer();

		}

	},

	__showLightbox: function() {

		this.__lightbox.title('Set Sprite');

		var wrapper = document.createElement('div');
		wrapper.className = 'gui-gallery';

		var gallery = document.createElement('div');

		var title = document.createElement('h3');
		title.innerHTML = 'Available Sprites';

		var amount = 0,
			sprites = this._editor._cache.source.all();
		for (var sId in sprites) {

			var item = document.createElement('div');
			(function(sprite, that) {
				item.onclick = function() {
					that.__set(sprite);
					that.__lightbox.hide();
				};
			})(sprites[sId], this);

			item.appendChild(sprites[sId].cloneNode(true));
			gallery.appendChild(item);

			amount++;

		}

		gallery.style.width = (amount * 110) + 'px';
		wrapper.appendChild(gallery);

		this.__lightbox.add(title);
		this.__lightbox.add(wrapper);


		this.__lightbox.show();

	}

};

