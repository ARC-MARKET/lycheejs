
lychee.define('game.app.sprite.Portal').requires([
	'lychee.effect.Sound',
	'game.effect.Lightning'
]).includes([
	'lychee.app.Sprite'
]).exports(function(lychee, global, attachments) {

	var _Entity    = lychee.import('lychee.app.Entity');
	var _Lightning = lychee.import('game.effect.Lightning');
	var _Sound     = lychee.import('lychee.effect.Sound');
	var _Sprite    = lychee.import('lychee.app.Sprite');
	var _TEXTURE   = attachments["png"];
	var _CONFIG    = attachments["json"].buffer;
	var _SOUND     = attachments["snd"];



	/*
	 * HELPERS
	 */

	var _update_effects = function() {

		for (var e = 0; e < 8; e++) {

			var delay    = (e * Math.random() * 2000) | 0;
			var duration = (e * 2000 + Math.random() * 1000) | 0;
			var f        = Math.random() * 2 * Math.PI;
			var position = { x: Math.sin(f) * 64, y: Math.cos(f) * 64 };


			position.x *= Math.random() * 5;
			position.y *= Math.random() * 5;

			if (Math.random() > 0.5) position.x *= -1;
			if (Math.random() > 0.5) position.y *= -1;

			position.x = ((position.x / 32) | 0) * 32 + 16;
			position.y = ((position.y / 32) | 0) * 32 + 16;


			this.addEffect(new _Lightning({
				type:     _Lightning.TYPE.linear,
				duration: duration,
				delay:    delay,
				position: position
			}));

			this.addEffect(new _Sound({
				delay: delay,
				sound: _SOUND
			}));

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data, main) {

		var settings = Object.assign({}, data);


		settings.collision = _Entity.COLLISION.A;
		settings.texture   = _TEXTURE;
		settings.map       = _CONFIG.map;
		settings.width     = _CONFIG.width;
		settings.height    = _CONFIG.height;
		settings.shape     = _Entity.SHAPE.rectangle;
		settings.states    = _CONFIG.states;
		settings.state     = 'default';


		_Sprite.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.app.sprite.Portal';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			var texture = this.texture;
			if (texture !== null) {

				var alpha    = this.alpha;
				var position = this.position;

				var x1 = 0;
				var y1 = 0;


				if (alpha !== 1) {
					renderer.setAlpha(alpha);
				}


				var map = this.getMap();
				if (map !== null) {

					x1 = position.x + offsetX - map.w / 2;
					y1 = position.y + offsetY - map.h / 2;

					renderer.drawSprite(
						x1,
						y1,
						texture,
						map
					);

				} else {

					var hw = (this.width / 2)  || this.radius;
					var hh = (this.height / 2) || this.radius;

					x1 = position.x + offsetX - hw;
					y1 = position.y + offsetY - hh;

					renderer.drawSprite(
						x1,
						y1,
						texture
					);

				}


				if (alpha !== 1) {
					renderer.setAlpha(1.0);
				}

			}


			_Entity.prototype.render.call(this, renderer, offsetX, offsetY);

		},

		update: function(clock, delta) {

			_Entity.prototype.update.call(this, clock, delta);


			if (this.effects.length === 0) {
				_update_effects.call(this);
			}

		}

	};


	return Composite;

});

