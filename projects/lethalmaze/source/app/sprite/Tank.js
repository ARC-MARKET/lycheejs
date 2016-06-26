
lychee.define('game.app.sprite.Tank').requires([
	'lychee.effect.Position'
]).includes([
	'lychee.app.Sprite'
]).exports(function(lychee, global, attachments) {

	var _Entity  = lychee.import('lychee.app.Entity');
	var _Sprite  = lychee.import('lychee.app.Sprite');
	var _TEXTURE = attachments["png"];
	var _CONFIG  = attachments["json"].buffer;
	var _SOUNDS  = {
		powerup: attachments["powerup.snd"],
		shoot:   attachments["shoot.snd"]
	};


	var _id  = 0;
	var _IDS = [ 'rainbow', 'red', 'green', 'blue', 'black', 'white' ];



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		this.id        = _IDS[(_id++ % _IDS.length)];
		this.direction = 'top';
		this.ammo      = 16;
		this.life      = 4;


		this.__clock     = null;
		this.__ammoclock = null;
		this.__lifeclock = null;


		this.setAmmo(settings.ammo);
		this.setLife(settings.life);


		delete settings.ammo;
		delete settings.life;


		settings.collision = _Entity.COLLISION.A;
		settings.texture   = _TEXTURE;
		settings.map       = _CONFIG.map;
		settings.width     = _CONFIG.width;
		settings.height    = _CONFIG.height;
		settings.shape     = _Entity.SHAPE.rectangle;
		settings.states    = _CONFIG.states;
		settings.state     = this.id + '-' + this.direction;


		_Sprite.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.setDirection(settings.direction);


		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		destroy: function() {

			_id--;

		},

		serialize: function() {

			var data = _Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.app.sprite.Tank';


			var settings = data['arguments'][0] || {};
			var blob     = data['blob'] || {};


			if (this.ammo !== 16)         settings.ammo      = this.ammo;
			if (this.direction !== 'top') settings.direction = this.direction;
			if (this.life !== 4)          settings.life      = this.life;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			_Sprite.prototype.render.call(this, renderer, offsetX, offsetY);


			var position = this.position;
			var texture  = this.texture;


			var clock = this.__clock;
			if (clock < this.__lifeclock) {

				var life_map = this.__map['life'][this.life - 1] || null;
				if (life_map !== null) {

					renderer.drawSprite(
						position.x + offsetX - life_map.w / 2,
						position.y + offsetY - life_map.h / 2,
						texture,
						life_map
					);

				}

			} else if (clock < this.__ammoclock) {

				var ammo_map = this.__map['ammo'][(this.ammo / 16 * 4 - 1) | 0] || null;
				if (ammo_map !== null) {

					renderer.drawSprite(
						position.x + offsetX - ammo_map.w / 2,
						position.y + offsetY - ammo_map.h / 2,
						texture,
						ammo_map
					);

				}

			}

		},

		update: function(clock, delta) {

			this.__clock = clock;

			_Sprite.prototype.update.call(this, clock, delta);

		},



		/*
		 * CUSTOM API
		 */

		move: function(direction) {

			direction = typeof direction === 'string' ? direction : null;


			if (direction !== null) {

				var width    = this.width;
				var height   = this.height;
				var position = {
					x: this.position.x,
					y: this.position.y
				};


				switch(direction) {

					case 'top':    position.y -= height; break;
					case 'right':  position.x += width;  break;
					case 'bottom': position.y += height; break;
					case 'left':   position.x -= width;  break;
					default:                             break;

				}


				this.setDirection(direction);


				if (this.effects.length === 0) {

					this.addEffect(new lychee.effect.Position({
						type:     lychee.effect.Position.TYPE.easeout,
						duration: 300,
						position: position
					}));


					return true;

				}

			}


			return false;

		},

		shoot: function() {

			if (this.ammo > 0) {

				_SOUNDS.shoot.play();
				this.__ammoclock = this.__clock + 2000;
				this.ammo--;


				return true;

			}


			return false;

		},

		hit: function() {

			if (this.life > 0) {

				this.__lifeclock = this.__clock + 2000;
				this.life--;

				if (this.life === 0) {
					return false;
				}


				return true;

			}


			return false;

		},

		powerup: function() {

			if (this.ammo < 16) {

				return this.setAmmo(16);

			} else if (this.life < 4) {

				return this.setLife(4);

			}


			return false;

		},

		setAmmo: function(ammo) {

			ammo = typeof ammo === 'number' ? (ammo | 0) : null;


			if (ammo !== null) {

				if (this.ammo !== ammo) {

					_SOUNDS.powerup.play();
					this.__ammoclock = this.__clock + 2000;
					this.ammo = ammo;

				}


				return true;

			}


			return false;

		},

		setDirection: function(direction) {

			var result = this.setState(this.id + '-' + direction);
			if (result === true) {

				this.direction = direction;


				return true;

			}


			return false;

		},

		setLife: function(life) {

			life = typeof life === 'number' ? (life | 0) : null;


			if (life !== null) {

				if (this.life !== life) {

					_SOUNDS.powerup.play();
					this.__lifeclock = this.__clock + 2000;
					this.life = life;

				}


				return true;

			}


			return false;

		}

	};


	return Class;

});

