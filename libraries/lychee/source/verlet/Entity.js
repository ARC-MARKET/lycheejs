
lychee.define('lychee.verlet.Entity').requires([
	'lychee.math.Vector3',
	'lychee.verlet.Constraint'
]).includes([
	'lychee.app.Entity'
]).exports(function(lychee, global, attachments) {

	var _Constraint = lychee.import('lychee.verlet.Constraint');
	var _Entity     = lychee.import('lychee.app.Entity');
	var _Vector3    = lychee.import('lychee.math.Vector3');



	/*
	 * HELPERS
	 */

	var _on_change = function() {

		var constraints = [];
		var particles   = [ this.position ];
		var rigidity    = this.rigidity;
		var shape       = this.shape;


		if (shape === Composite.SHAPE.circle) {

			var origin   = new _Vector3(this.position);
			var radius   = this.radius;
			var segments = Math.min(64, Math.max(4, Math.pow(radius / 8, 2)));

			for (var s = 0; s < segments; s++) {

				var theta = s * (2 * Math.PI) / segments;

				particles.push(new _Vector3({
					x: origin.x + Math.cos(theta) * radius,
					y: origin.y + Math.sin(theta) * radius,
					z: 0
				}));

			}

			for (var s = 0; s < segments; s++) {

				var curr = particles[s % segments];
				var prev = particles[(s - 1) % segments] || null;
				var next = particles[(s + 1) % segments] || null;


				if (curr !== prev && prev !== null) {
					constraints.push(new _Constraint(curr, prev, rigidity));
				}

				if (curr !== next && next !== null) {
					constraints.push(new _Constraint(curr, next, rigidity));
				}

				constraints.push(new _Constraint(curr, origin, rigidity));

			}


// TODO: Implement this stuff here

		} else if (shape === Composite.SHAPE.sphere) {
		} else if (shape === Composite.SHAPE.rectangle) {
		} else if (shape === Composite.SHAPE.cuboid) {
		}


		this.constraints = constraints;
		this.particles   = particles;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		var settings = Object.assign({}, data);


		this.constraints = [];
		this.particles   = [];
		this.rigidity    = 1;


		this.setRigidity(settings.rigidity);

		delete settings.rigidity;


		_Entity.call(this, settings);

		settings = null;

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

			var data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'lychee.verlet.Entity';


			if (this.position.length() > 0) settings.position = lychee.serialize(this.position);


			return data;

		},

		update: function(clock, delta) {

			_Entity.prototype.update.call(this, clock, delta);


			var constraints = this.constraints;
			for (var c = 0, cl = constraints.length; c < cl; c++) {
				constraints[c].update(clock, delta);
			}

		},



		/*
		 * CUSTOM API
		 */

		setPosition: function(position) {

			position = position instanceof _Vector3 ? position : new _Vector3(position);


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

