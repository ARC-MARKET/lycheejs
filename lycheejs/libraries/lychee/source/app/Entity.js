
lychee.define('lychee.app.Entity').exports((lychee, global, attachments) => {

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

	const _sphere_sphere = function(a, b) {

		let dx  = Math.sqrt(Math.pow(b.position.x - a.position.x, 2));
		let dy  = Math.sqrt(Math.pow(b.position.y - a.position.y, 2));
		let dz  = Math.sqrt(Math.pow(b.position.z - a.position.z, 2));

		let rxy = 0;
		let rxz = 0;

		if (a.shape === Composite.SHAPE.sphere) {
			rxy += a.radius;
			rxz += a.radius;
		}

		if (b.shape === Composite.SHAPE.sphere) {
			rxy += b.radius;
			rxz += b.radius;
		}

		return ((dx + dy) <= rxy && (dx + dz) <= rxz);

	};

	const _sphere_cuboid = function(a, b) {

		let r  = a.radius;
		let hw = b.width  / 2;
		let hh = b.height / 2;
		let hd = b.depth  / 2;

		let ax = a.position.x;
		let ay = a.position.y;
		let az = a.position.z;

		let bx = b.position.x;
		let by = b.position.y;
		let bz = b.position.z;

		let colx = (ax + r >= bx - hw) && (ax - r <= bx + hw);
		let coly = (ay + r >= by - hh) && (ay - r <= by + hh);

		if (a.shape === Composite.SHAPE.circle) {
			r = 0;
		}

		let colz = (az + r >= bz - hd) && (az - r <= bz + hd);

		return (colx && coly && colz);

	};

	const _cuboid_cuboid = function(a, b) {

		let dx = Math.abs(b.position.x - a.position.x);
		let dy = Math.abs(b.position.y - a.position.y);
		let dz = Math.abs(b.position.z - a.position.z);

		let hw = (a.width  + b.width)  / 2;
		let hh = (a.height + b.height) / 2;
		let hd = (a.depth  + b.depth)  / 2;

		return (dx <= hw && dy <= hh && dz <= hd);

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.width  = typeof states.width === 'number'  ? states.width  : 0;
		this.height = typeof states.height === 'number' ? states.height : 0;
		this.depth  = typeof states.depth === 'number'  ? states.depth  : 0;
		this.radius = typeof states.radius === 'number' ? states.radius : 0;

		this.alpha     = 1;
		this.collision = Composite.COLLISION.none;
		this.effects   = [];
		this.shape     = Composite.SHAPE.rectangle;
		this.state     = 'default';
		this.states    = { 'default': null };
		this.position  = { x: 0, y: 0, z: 0 };
		this.velocity  = { x: 0, y: 0, z: 0 };


		this.setAlpha(states.alpha);
		this.setCollision(states.collision);
		this.setShape(states.shape);
		this.setStates(states.states);
		this.setState(states.state);
		this.setPosition(states.position);
		this.setVelocity(states.velocity);


		states = null;

	};


	// Same ENUM values as lychee.ui.Entity
	Composite.COLLISION = {
		none: 0,
		A:    1,
		B:    2,
		C:    3,
		D:    4
	};


	// Same ENUM values as lychee.ui.Entity
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

			let states = {};


			if (this.width  !== 0) states.width  = this.width;
			if (this.height !== 0) states.height = this.height;
			if (this.depth  !== 0) states.depth  = this.depth;
			if (this.radius !== 0) states.radius = this.radius;

			if (this.alpha !== 1)                            states.alpha     = this.alpha;
			if (this.collision !== Composite.COLLISION.none) states.collision = this.collision;
			if (this.shape !== Composite.SHAPE.rectangle)    states.shape     = this.shape;
			if (this.state !== 'default')                    states.state     = this.state;
			if (Object.keys(this.states).length > 1)         states.states    = this.states;


			if (this.position.x !== 0 || this.position.y !== 0 || this.position.z !== 0) {

				states.position = {};

				if (this.position.x !== 0) states.position.x = this.position.x;
				if (this.position.y !== 0) states.position.y = this.position.y;
				if (this.position.z !== 0) states.position.z = this.position.z;

			}


			if (this.velocity.x !== 0 || this.velocity.y !== 0 || this.velocity.z !== 0) {

				states.velocity = {};

				if (this.velocity.x !== 0) states.velocity.x = this.velocity.x;
				if (this.velocity.y !== 0) states.velocity.y = this.velocity.y;
				if (this.velocity.z !== 0) states.velocity.z = this.velocity.z;

			}


			return {
				'constructor': 'lychee.app.Entity',
				'arguments':   [ states ],
				'blob':        null
			};

		},

		render: function(renderer, offsetX, offsetY) {

			let effects = this.effects;
			for (let e = 0, el = effects.length; e < el; e++) {
				effects[e].render(renderer, offsetX, offsetY);
			}

		},

		update: function(clock, delta) {

			let velocity = this.velocity;

			if (velocity.x !== 0 || velocity.y !== 0 || velocity.z !== 0) {

				let x = this.position.x;
				let y = this.position.y;
				let z = this.position.z;


				let vt = delta / 1000;

				if (velocity.x !== 0) {
					x += velocity.x * vt;
				}

				if (velocity.y !== 0) {
					y += velocity.y * vt;
				}

				if (velocity.z !== 0) {
					z += velocity.z * vt;
				}


				this.position.x = x;
				this.position.y = y;
				this.position.z = z;

			}


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

			entity = lychee.interfaceof(Composite, entity) ? entity : null;


			if (entity !== null) {

				let none = Composite.COLLISION.none;
				if (this.collision !== entity.collision || this.collision === none || entity.collision === none) {
					return false;
				}


				let circle    = Composite.SHAPE.circle;
				let sphere    = Composite.SHAPE.sphere;
				let rectangle = Composite.SHAPE.rectangle;
				let cuboid    = Composite.SHAPE.cuboid;

				let shapeA    = this.shape;
				let shapeB    = entity.shape;

				let issphereA = shapeA === circle    || shapeA === sphere;
				let issphereB = shapeB === circle    || shapeB === sphere;
				let iscuboidA = shapeA === rectangle || shapeA === cuboid;
				let iscuboidB = shapeB === rectangle || shapeB === cuboid;

				if (issphereA && issphereB) {
					return _sphere_sphere(this, entity);
				} else if (iscuboidA && iscuboidB) {
					return _cuboid_cuboid(this, entity);
				} else if (issphereA && iscuboidB) {
					return _sphere_cuboid(this, entity);
				} else if (iscuboidA && issphereB) {
					return _sphere_cuboid(entity, this);
				}

			}


			return false;

		},

		confines: function(position) {

			position = position instanceof Object ? position : null;


			if (position !== null) {

				position.x = typeof position.x === 'number' ? position.x : 0;
				position.y = typeof position.y === 'number' ? position.y : 0;
				position.z = typeof position.z === 'number' ? position.z : 0;


				let ax = position.x;
				let ay = position.y;
				let az = position.z;
				let bx = this.position.x;
				let by = this.position.y;
				let bz = this.position.z;


				let shape = this.shape;
				if (shape === Composite.SHAPE.circle) {

					let dist = Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
					if (dist < this.radius) {
						return true;
					}

				} else if (shape === Composite.SHAPE.sphere) {

					let dist = Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2) + Math.pow(az - bz, 2));
					if (dist < this.radius) {
						return true;
					}

				} else if (shape === Composite.SHAPE.rectangle) {

					let hwidth  = this.width  / 2;
					let hheight = this.height / 2;
					let colX    = (ax >= bx - hwidth)  && (ax <= bx + hwidth);
					let colY    = (ay >= by - hheight) && (ay <= by + hheight);

					return colX && colY;

				} else if (shape === Composite.SHAPE.cuboid) {

					let hwidth  = this.width  / 2;
					let hheight = this.height / 2;
					let hdepth  = this.depth  / 2;
					let colX    = (ax >= bx - hwidth)  && (ax <= bx + hwidth);
					let colY    = (ay >= by - hheight) && (ay <= by + hheight);
					let colZ    = (az >= bz - hdepth)  && (az <= bz + hdepth);

					return colX && colY && colZ;

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

		setCollision: function(collision) {

			collision = lychee.enumof(Composite.COLLISION, collision) ? collision : null;


			if (collision !== null) {

				this.collision = collision;

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
				this.position.z = typeof position.z === 'number' ? position.z : this.position.z;

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
					'default': null
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

		setVelocity: function(velocity) {

			velocity = velocity instanceof Object ? velocity : null;


			if (velocity !== null) {

				this.velocity.x = typeof velocity.x === 'number' ? velocity.x : this.velocity.x;
				this.velocity.y = typeof velocity.y === 'number' ? velocity.y : this.velocity.y;
				this.velocity.z = typeof velocity.z === 'number' ? velocity.z : this.velocity.z;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

