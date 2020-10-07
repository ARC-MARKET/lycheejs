
lychee.define('lychee.ui.Entity').includes([
	'lychee.event.Emitter'
]).exports((lychee, global, attachments) => {

	const _Emitter = lychee.import('lychee.event.Emitter');



	/*
	 * HELPERS
	 */

	const _validate_effect = function(effect) {

		if (effect instanceof Object) {

			if (
				typeof effect.update === 'function'
				&& typeof effect.render === 'function'
			) {
				return true;
			}

		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.width  = typeof states.width  === 'number' ? states.width  : 0;
		this.height = typeof states.height === 'number' ? states.height : 0;
		this.depth  = typeof states.depth === 'number'  ? states.depth  : 0;
		this.radius = typeof states.radius === 'number' ? states.radius : 0;

		this.alpha     = 1;
		this.collision = Composite.COLLISION.none;
		this.effects   = [];
		this.shape     = Composite.SHAPE.rectangle;
		this.state     = 'default';
		this.states    = { 'default': null, 'active': null };
		this.position  = { x: 0, y: 0, z: 0 };
		this.visible   = true;


		this.setAlpha(states.alpha);
		this.setShape(states.shape);
		this.setStates(states.states);
		this.setState(states.state);
		this.setPosition(states.position);
		this.setVisible(states.visible);


		_Emitter.call(this);

		states = null;

	};


	// Same ENUM values as lychee.app.Entity
	Composite.COLLISION = {
		none: 0,
		A:    1,
		B:    2,
		C:    3,
		D:    4
	};


	// Same ENUM values as lychee.app.Entity
	Composite.SHAPE = {
		circle:    0,
		rectangle: 1,
		sphere:    2,
		cuboid:    3
	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.Entity';

			let states = {};
			let blob   = (data['blob'] || {});


			if (this.width  !== 0) states.width  = this.width;
			if (this.height !== 0) states.height = this.height;
			if (this.depth !== 0)  states.depth  = this.depth;
			if (this.radius !== 0) states.radius = this.radius;

			if (this.alpha !== 1)                         states.alpha   = this.alpha;
			if (this.shape !== Composite.SHAPE.rectangle) states.shape   = this.shape;
			if (this.state !== 'default')                 states.state   = this.state;
			if (Object.keys(this.states).length > 0)      states.states  = this.states;
			if (this.visible !== true)                    states.visible = this.visible;


			if (this.position.x !== 0 || this.position.y !== 0) {

				states.position = {};

				if (this.position.x !== 0) states.position.x = this.position.x;
				if (this.position.y !== 0) states.position.y = this.position.y;

			}


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			let effects = this.effects;
			for (let e = 0, el = effects.length; e < el; e++) {
				effects[e].render(renderer, offsetX, offsetY);
			}

		},

		update: function(clock, delta) {

			let effects = this.effects;
			for (let e = 0, el = effects.length; e < el; e++) {

				let effect = effects[e];
				if (effect.update(this, clock, delta) === false) {
					this.removeEffect(effect);
					el--;
					e--;
				}

			}

		},



		/*
		 * CUSTOM API
		 */

		collides: function(entity) {

			entity = lychee.interfaceof(lychee.ui.Entity, entity) ? entity : null;


			if (entity !== null) {
				// XXX: UI Entities cannot collide
			}


			return false;

		},

		confines: function(position) {

			position = position instanceof Object ? position : null;


			if (position !== null) {

				position.x = typeof position.x === 'number' ? position.x : 0;
				position.y = typeof position.y === 'number' ? position.y : 0;


				let ax = position.x;
				let ay = position.y;
				let bx = this.position.x;
				let by = this.position.y;


				let shape = this.shape;
				if (shape === Composite.SHAPE.circle) {

					let dist = Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
					if (dist < this.radius) {
						return true;
					}

				} else if (shape === Composite.SHAPE.rectangle) {

					let hwidth  = this.width  / 2;
					let hheight = this.height / 2;
					let colX    = (ax >= bx - hwidth)  && (ax <= bx + hwidth);
					let colY    = (ay >= by - hheight) && (ay <= by + hheight);


					return colX && colY;

				}

			}


			return false;

		},

		setAlpha: function(alpha) {

			alpha = typeof alpha === 'number' ? alpha : null;


			if (alpha !== null) {

				this.alpha = Math.min(Math.max(alpha, 0), 1);

				return true;

			}


			return false;

		},

		addEffect: function(effect) {

			effect = _validate_effect(effect) ? effect : null;


			if (effect !== null) {

				let index = this.effects.indexOf(effect);
				if (index === -1) {

					this.effects.push(effect);

					return true;

				}

			}


			return false;

		},

		removeEffect: function(effect) {

			effect = _validate_effect(effect) ? effect : null;


			if (effect !== null) {

				let index = this.effects.indexOf(effect);
				if (index !== -1) {

					this.effects.splice(index, 1);

					return true;

				}

			}


			return false;

		},

		removeEffects: function() {

			let effects = this.effects;

			for (let e = 0, el = effects.length; e < el; e++) {

				effects[e].update(this, Infinity, 0);
				this.removeEffect(effects[e]);

				el--;
				e--;

			}


			return true;

		},

		setPosition: function(position) {

			position = position instanceof Object ? position : null;


			if (position !== null) {

				this.position.x = typeof position.x === 'number' ? position.x : this.position.x;
				this.position.y = typeof position.y === 'number' ? position.y : this.position.y;

				return true;

			}


			return false;

		},

		setShape: function(shape) {

			shape = lychee.enumof(Composite.SHAPE, shape) ? shape : null;


			if (shape !== null) {

				this.shape = shape;

				return true;

			}


			return false;

		},

		setStates: function(states) {

			states = states instanceof Object ? states : null;


			if (states !== null) {

				this.states = {
					'default': null,
					'active':  null
				};

				for (let id in states) {

					if (states.hasOwnProperty(id)) {

						let state = states[id];
						if (state instanceof Object) {
							this.states[id] = states[id];
						}

					}

				}

				return true;

			}


			return false;

		},

		setState: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null && this.states[id] !== undefined) {

				this.state = id;

				return true;

			}


			return false;

		},

		setVisible: function(visible) {

			visible = typeof visible === 'boolean' ? visible : null;


			if (visible !== null) {

				this.visible = visible;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

