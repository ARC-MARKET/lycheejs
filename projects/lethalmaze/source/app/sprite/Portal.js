
lychee.define('game.app.sprite.Portal').requires([
	'lychee.effect.Sound',
	'game.effect.Lightning'
]).includes([
	'lychee.app.Sprite'
]).exports(function(lychee, game, global, attachments) {

	var _TEXTURE = attachments["png"];
	var _CONFIG  = attachments["json"].buffer;
	var _SOUND   = attachments["snd"];



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


			this.addEffect(new game.effect.Lightning({
				type:     game.effect.Lightning.TYPE.linear,
				duration: duration,
				delay:    delay,
				position: position
			}));

			this.addEffect(new lychee.effect.Sound({
				delay: delay,
				sound: _SOUND
			}));

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data, main) {

		var settings = lychee.extend({}, data);


		settings.collision = lychee.app.Entity.COLLISION.A;
		settings.texture   = _TEXTURE;
		settings.map       = _CONFIG.map;
		settings.width     = _CONFIG.width;
		settings.height    = _CONFIG.height;
		settings.shape     = lychee.app.Entity.SHAPE.rectangle;
		settings.states    = _CONFIG.states;
		settings.state     = 'default';


		lychee.app.Sprite.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.app.Sprite.prototype.serialize.call(this);
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


			lychee.app.Entity.prototype.render.call(this, renderer, offsetX, offsetY);

		},

		update: function(clock, delta) {

			lychee.app.Entity.prototype.update.call(this, clock, delta);


			if (this.effects.length === 0) {
				_update_effects.call(this);
			}

		}

	};


	return Class;

});

