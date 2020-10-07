
lychee.define('game.app.sprite.Tank').requires([
	'lychee.app.Entity',
	'lychee.effect.Position'
]).includes([
	'lychee.app.Sprite'
]).exports((lychee, global, attachments) => {

	let   _id      = 0;
	const _Entity  = lychee.import('lychee.app.Entity');
	const _Sprite  = lychee.import('lychee.app.Sprite');
	const _IDS     = [ 'rainbow', 'red', 'green', 'blue', 'black', 'white' ];
	const _TEXTURE = attachments['png'];
	const _CONFIG  = attachments['json'].buffer;
	const _SOUNDS  = {
		powerup: attachments['powerup.snd'],
		shoot:   attachments['shoot.snd']
	};





	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.id        = '' + _IDS[(_id++ % _IDS.length)];
		this.direction = 'top';
		this.ammo      = 16;
		this.life      = 4;


		this.__clock     = null;
		this.__ammoclock = null;
		this.__lifeclock = null;


		this.setAmmo(states.ammo);
		this.setLife(states.life);


		delete states.ammo;
		delete states.life;


		states.collision = _Entity.COLLISION.A;
		states.texture   = _TEXTURE;
		states.map       = _CONFIG.map;
		states.width     = _CONFIG.width;
		states.height    = _CONFIG.height;
		states.shape     = _Entity.SHAPE.rectangle;
		states.states    = _CONFIG.states;
		states.state     = this.id + '-' + this.direction;


		_Sprite.call(this, states);



		/*
		 * INITIALIZATION
		 */

		this.setDirection(states.direction);


		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		destroy: function() {

			_id--;

			return true;

		},

		serialize: function() {

			let data = _Sprite.prototype.serialize.call(this);
			data['constructor'] = 'game.app.sprite.Tank';


			let states = data['arguments'][0] || {};
			let blob   = (data['blob'] || {});


			if (this.ammo !== 16)         states.ammo      = this.ammo;
			if (this.direction !== 'top') states.direction = this.direction;
			if (this.life !== 4)          states.life      = this.life;


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			_Sprite.prototype.render.call(this, renderer, offsetX, offsetY);


			let position = this.position;
			let texture  = this.texture;


			let clock = this.__clock;
			if (clock < this.__lifeclock) {

				let life_map = this.__map['life'][this.life - 1] || null;
				if (life_map !== null) {

					renderer.drawSprite(
						position.x + offsetX - life_map.w / 2,
						position.y + offsetY - life_map.h / 2,
						texture,
						life_map
					);

				}

			} else if (clock < this.__ammoclock) {

				let ammo_map = this.__map['ammo'][(this.ammo / 16 * 4 - 1) | 0] || null;
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

				let width    = this.width;
				let height   = this.height;
				let position = {
					x: this.position.x,
					y: this.position.y
				};


				switch (direction) {

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

				let result = this.setAmmo(16);
				if (result === true) {
					return true;
				}

			} else if (this.life < 4) {

				let result = this.setLife(4);
				if (result === true) {
					return true;
				}

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

			direction = typeof direction === 'string' ? direction : null;


			if (direction !== null) {

				let result = this.setState(this.id + '-' + direction);
				if (result === true) {

					this.direction = direction;

					return true;

				}

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


	return Composite;

});

