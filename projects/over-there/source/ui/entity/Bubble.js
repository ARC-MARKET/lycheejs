
lychee.define('app.ui.entity.Bubble').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global, attachments) {

	var _Entity  = lychee.import('lychee.ui.Entity');
	var _CONFIG  = attachments["json"].buffer;
	var _FONT    = attachments["fnt"];
	var _TEXTURE = attachments["png"];
	var _AVATAR  = {
		config:  attachments["avatar.json"].buffer,
		texture: attachments["avatar.png"]
	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		this.key   = 'urine';
		this.value = '0%';


		this.setKey(settings.key);
		this.setValue(settings.value);


		delete settings.key;
		delete settings.value;


		settings.alpha  = 1.0;
		settings.radius = 32;
		settings.shape  = _Entity.SHAPE.circle;


		_Entity.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'app.ui.entity.Bubble';


			var settings = data['arguments'][0] || {};
			var blob     = data['blob'] || {};


			if (this.key !== 'urine') settings.key   = this.key;
			if (this.value !== '0%')  settings.value = this.value;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var alpha    = this.alpha;
			var position = this.position;
			var map      = null;
			var radius   = this.radius;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			renderer.drawCircle(
				position.x + offsetX,
				position.y + offsetY,
				radius - 1,
				'#00000',
				true
			);

			renderer.drawCircle(
				position.x + offsetX,
				position.y + offsetY,
				radius,
				'#0ba2ff',
				false,
				1
			);


			if (this.key === 'avatar') {

				map = _AVATAR.config.map[this.value] || null;

				if (map !== null) {

					renderer.drawSprite(
						position.x + offsetX - 24,
						position.y + offsetY - 24,
						_AVATAR.texture,
						map[0]
					);

				}

			} else {

				map = _CONFIG.map[this.key] || _CONFIG.map[this.value] || null;

				if (map !== null) {

					renderer.drawSprite(
						position.x + offsetX - 16,
						position.y + offsetY - 30,
						_TEXTURE,
						map[0]
					);

					renderer.drawText(
						position.x + offsetX,
						position.y + offsetY + 12,
						this.value,
						_FONT,
						true
					);

				} else {

					renderer.drawText(
						position.x + offsetX,
						position.y + offsetY + 2,
						this.value,
						_FONT,
						true
					);

				}

			}


			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}

		},



		/*
		 * CUSTOM API
		 */

		setKey: function(key) {

			key = typeof key === 'string' ? key : null;


			if (key !== null) {

				this.key = key;


				return true;

			}

		},

		setValue: function(value) {

			value = typeof value === 'string' ? value : null;


			if (value !== null) {

				this.value = value;


				return true;

			}


			return false;

		}

	};


	return Class;

});

