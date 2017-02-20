
lychee.define('lychee.ui.Sprite').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global, attachments) {

	const _Entity = lychee.import('lychee.ui.Entity');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.frame   = 0;
		this.texture = null;

		this.__animation = {
			active:   false,
			start:    null,
			frames:   0,
			duration: 0,
			loop:     false
		};
		this.__map = {
			'default': null,
			'active':  null
		};


		this.setAnimation(settings.animation);
		this.setTexture(settings.texture);
		this.setMap(settings.map);

		delete settings.texture;
		delete settings.map;


		_Entity.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			let texture = lychee.deserialize(blob.texture);
			if (texture !== null) {
				this.setTexture(texture);
			}

		},

		serialize: function() {

			let data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.Sprite';

			let settings = data['arguments'][0];
			let blob     = (data['blob'] || {});


			if (this.__animation.active === true) {

				settings.animation = {};

				if (this.__animation.duration !== 1000) settings.animation.duration = this.__animation.duration;
				if (this.frame !== 0)                   settings.animation.frame    = this.frame;
				if (this.__animation.frames !== 25)     settings.animation.frames   = this.__animation.frames;
				if (this.__animation.loop !== false)    settings.animation.loop     = this.__animation.loop;

			}

			if (Object.keys(this.__map).length > 0) {

				settings.map = {};


				for (let stateId in this.__map) {

					settings.map[stateId] = [];


					let frames = this.__map[stateId] || null;
					if (frames !== null) {

						for (let f = 0, fl = frames.length; f < fl; f++) {

							let frame  = frames[f];
							let sframe = {};

							if (frame.x !== 0) sframe.x = frame.x;
							if (frame.y !== 0) sframe.y = frame.y;
							if (frame.w !== 0) sframe.w = frame.w;
							if (frame.h !== 0) sframe.h = frame.h;


							settings.map[stateId].push(sframe);

						}

					}

				}

			}


			if (this.texture !== null) blob.texture = lychee.serialize(this.texture);


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let texture = this.texture;
			if (texture !== null) {

				let alpha    = this.alpha;
				let position = this.position;

				let x1 = 0;
				let y1 = 0;


				if (alpha !== 1) {
					renderer.setAlpha(alpha);
				}


				let map = this.getMap();
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

					let hw = (this.width  / 2) || this.radius;
					let hh = (this.height / 2) || this.radius;

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


			let animation = this.__animation;

			// 1. Animation (Interpolation)
			if (animation.active === true) {

				if (animation.start !== null) {

					let t = (clock - animation.start) / animation.duration;
					if (t <= 1) {

						this.frame = Math.max(0, Math.ceil(t * animation.frames) - 1);

					} else {

						if (animation.loop === true) {
							animation.start = clock;
						} else {
							this.frame = animation.frames - 1;
							animation.active = false;
						}

					}

				}

			}

		},



		/*
		 * CUSTOM API
		 */

		setAnimation: function(settings) {

			settings = settings instanceof Object ? settings : null;


			if (settings !== null) {

				let duration = typeof settings.duration === 'number' ? settings.duration : 1000;
				let frame    = typeof settings.frame === 'number'    ? settings.frame    : 0;
				let frames   = typeof settings.frames === 'number'   ? settings.frames   : 25;
				let loop     = settings.loop === true;


				let animation = this.__animation;

				animation.start    = null;
				animation.active   = true;
				animation.duration = duration;
				animation.frames   = frames;
				animation.loop     = loop;

				this.frame = frame;

				return true;

			}


			return false;

		},

		clearAnimation: function() {

			this.__animation.active = false;
			this.frame = 0;

		},

		setState: function(id) {

			id = typeof id === 'string' ? id : null;


			let result = _Entity.prototype.setState.call(this, id);
			if (result === true) {

				let map = this.__map[this.state] || null;
				if (map !== null) {

					if (map instanceof Array) {

						let statemap = this.getStateMap();
						if (statemap !== null && statemap instanceof Object) {

							this.clearAnimation();

							if (statemap.animation === true) {

								this.setAnimation({
									duration: statemap.duration || 1000,
									frame:    0,
									frames:   map.length,
									loop:     statemap.loop === true
								});

							}

						}


						map = map[0];

					}


					if (map.width !== undefined && typeof map.width === 'number') {
						this.width = map.width;
					}

					if (map.height !== undefined && typeof map.height === 'number') {
						this.height = map.height;
					}

					if (map.radius !== undefined && typeof map.radius === 'number') {
						this.radius = map.radius;
					}

				}

			}


			return result;

		},

		setTexture: function(texture) {

			texture = texture instanceof Texture ? texture : null;


			this.texture = texture;

			return true;

		},

		getMap: function() {

			let state = this.state;
			let frame = this.frame;

			if (this.__map[state] instanceof Array && this.__map[state][frame] !== undefined) {
				return this.__map[state][frame];
			}


			return null;

		},

		setMap: function(map) {

			map = map instanceof Object ? map : null;


			let valid = false;

			if (map !== null) {

				for (let stateId in map) {

					let frames = map[stateId];
					if (frames instanceof Array) {

						this.__map[stateId] = [];


						for (let f = 0, fl = frames.length; f < fl; f++) {

							let frame = frames[f];
							if (frame instanceof Object) {

								frame.x = typeof frame.x === 'number' ? frame.x : 0;
								frame.y = typeof frame.y === 'number' ? frame.y : 0;
								frame.w = typeof frame.w === 'number' ? frame.w : 0;
								frame.h = typeof frame.h === 'number' ? frame.h : 0;


								this.__map[stateId].push(frame);

							}

						}


						valid = true;

					}

				}

			}


			return valid;

		}

	};


	return Composite;

});

