
lychee.define('lychee.verlet.Entity').requires([
	'lychee.math.Vector3',
	'lychee.verlet.Constraint'
]).includes([
	'lychee.app.Entity'
]).exports((lychee, global, attachments) => {

	const _Constraint = lychee.import('lychee.verlet.Constraint');
	const _Entity     = lychee.import('lychee.app.Entity');
	const _Vector3    = lychee.import('lychee.math.Vector3');



	/*
	 * HELPERS
	 */

	const _on_change = function() {

		let constraints = [];
		let particles   = [ this.position ];
		let rigidity    = this.rigidity;
		let shape       = this.shape;


		if (shape === Composite.SHAPE.circle) {

			let origin   = new _Vector3(this.position);
			let radius   = this.radius;
			let segments = Math.min(64, Math.max(4, Math.pow(radius / 8, 2)));
			let s        = 0;

			for (s = 0; s < segments; s++) {

				let theta = s * (2 * Math.PI) / segments;

				particles.push(new _Vector3({
					x: origin.x + Math.cos(theta) * radius,
					y: origin.y + Math.sin(theta) * radius,
					z: 0
				}));

			}

			for (s = 0; s < segments; s++) {

				let curr = particles[s % segments];
				let prev = particles[(s - 1) % segments] || null;
				let next = particles[(s + 1) % segments] || null;


				if (curr !== prev && prev !== null) {
					constraints.push(new _Constraint(curr, prev, rigidity));
				}

				if (curr !== next && next !== null) {
					constraints.push(new _Constraint(curr, next, rigidity));
				}

				constraints.push(new _Constraint(curr, origin, rigidity));

			}


		// TODO: Implement this stuff here
		// } else if (shape === Composite.SHAPE.sphere) {
		// } else if (shape === Composite.SHAPE.rectangle) {
		// } else if (shape === Composite.SHAPE.cuboid) {
		}


		this.constraints = constraints;
		this.particles   = particles;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.constraints = [];
		this.particles   = [];
		this.rigidity    = 1;


		this.setRigidity(states.rigidity);

		delete states.rigidity;


		_Entity.call(this, states);

		states = null;

	};


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

			let data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'lychee.verlet.Entity';

			let states = data['arguments'][0];
			let blob   = (data['blob'] || {});


			if (this.position.length() > 0) states.position = lychee.serialize(this.position);


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		update: function(clock, delta) {

			_Entity.prototype.update.call(this, clock, delta);


			let constraints = this.constraints;
			for (let c = 0, cl = constraints.length; c < cl; c++) {
				constraints[c].update(clock, delta);
			}

		},



		/*
		 * CUSTOM API
		 */

		setPosition: function(position) {

			position = position instanceof _Vector3 ? position : null;


			if (position !== null) {

				this.position = position;
				_on_change.call(this);

				return true;

			}


			return false;

		},

		setRigidity: function(rigidity) {

			rigidity = typeof rigidity === 'number' ? rigidity : null;


			if (rigidity !== null) {

				this.rigidity = rigidity;
				_on_change.call(this);

				return true;

			}


			return false;

		},

		setShape: function(shape) {

			shape = lychee.enumof(Composite.SHAPE, shape) ? shape : null;


			if (shape !== null) {

				this.shape = shape;
				_on_change.call(this);

				return true;

			}


			return false;


		}

	};


	return Composite;

});

