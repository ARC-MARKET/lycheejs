
lychee.define('lychee.ui.entity.Texture').requires([
	'lychee.ui.Entity',
	'lychee.ui.entity.Upload',
	'lychee.ui.Sprite'
]).exports(function(lychee, global, attachments) {

	var _Entity = lychee.import('lychee.ui.Entity');
	var _Upload = lychee.import('lychee.ui.entity.Upload');
	var _Sprite = lychee.import('lychee.ui.Sprite');


	var Class = function() {

		var settings = Object.assign({}, data);


		this.font    = null;
		this.label   = 'UPLOAD';
		this.texture = null;
		this.value   = null;

		this.__sprite = new _Sprite({});
		this.__upload = new _Upload({
			type: _Upload.TYPE.texture
		});


		this.setFont(settings.font);
		this.setLabel(settings.label);
		this.setTexture(settings.texture);
		this.setValue(settings.value);

		delete settings.font;
		delete settings.label;
		delete settings.texture;
		delete settings.value;


		_Entity.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function(id, position, delta) {
			return this.__upload.trigger('touch', [ id, position, delta ]);
		}, this);

		this.bind('key', function(key, name, delta) {
			return this.__upload.trigger('key', [ key, name, delta ]);
		}, this);

		this.bind('relayout', function() {

			var sprite  = this.__sprite;
			var upload  = this.__upload;
			var dim     = (Math.min(this.width, this.height) / 32 | 0) * 32;


			upload.position.x =  0;
			upload.position.y =  1/2 * this.height - 1/2 * upload.height;

			sprite.width      = dim;
			sprite.height     = dim;
			sprite.position.x =  0;
			sprite.position.y = -1/2 * this.height + 1/2 * sprite.height;
			sprite.trigger('relayout');

		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			var font = lychee.deserialize(blob.font);
			if (font !== null) {
				this.setFont(font);
			}

			var texture = lychee.deserialize(blob.texture);
			if (texture !== null) {
				this.setTexture(texture);
			}

		},

		serialize: function() {

			var data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.entity.Button';

			var settings = data['arguments'][0];
			var blob     = (data['blob'] || {});


			if (this.label !== null) settings.label = this.label;
			if (this.value !== null) settings.value = this.value;


			if (this.font !== null)    blob.font    = lychee.serialize(this.font);
			if (this.texture !== null) blob.texture = lychee.serialize(this.texture);


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		update: function(clock, delta) {

			_Entity.prototype.render.call(this, clock, delta);

			this.__sprite.update(clock, delta);
			this.__upload.update(clock, delta);

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var alpha    = this.alpha;
			var position = this.position;
			var x        = position.x + offsetX;
			var y        = position.y + offsetY;


			_Entity.prototype.render.call(this, renderer, offsetX, offsetY);

			this.__sprite.render(renderer, x, y);
			this.__upload.render(renderer, x, y);

		},



		/*
		 * CUSTOM API
		 */

		setFont: function(font) {

			font = font instanceof Font ? font : null;


			if (font !== null) {

				this.__upload.setFont(font);
				this.font = font;

				return true;

			}


			return false;

		},

		setLabel: function(label) {

			label = typeof label === 'string' ? label : null;


			if (label !== null) {

				this.__upload.setLabel(label);
				this.label = label;

				return true;

			}


			return false;

		},

		setTexture: function(texture) {

			texture = texture instanceof Texture ? texture : null;


			if (texture !== null) {

				this.__sprite.setTexture(texture);
				this.texture = texture;

				return true;

			}


			return false;

		},

		setValue: function(value) {

			value = typeof value === 'string' ? value : null;


			if (value !== null) {

				this.__upload.setValue(value);
				this.value = value;

				return true;

			}


			return false;

		}

	};


	return Class;

});

