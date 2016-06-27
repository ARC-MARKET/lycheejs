
lychee.define('lychee.verlet.Tire').requires([
	'lychee.verlet.Particle',
	'lychee.verlet.DistanceConstraint'
]).exports(function(lychee, global) {

	var _particle   = lychee.verlet.Particle;
	var _constraint = lychee.verlet.DistanceConstraint;


	var Class = function(data) {

		var settings = Object.assign({}, data);


		this.constraints = [];
		this.particles   = [];

		this.position = { x: 0, y: 0 };
		this.origin   = null;
		this.radius   = 0;
		this.segments = 0;
		this.rigidity = {
			spoke: 1,
			tread: 1
		};


		this.setPosition(settings.position);
		this.setRadius(settings.radius);
		this.setRigidity(settings.rigidity);
		this.setSegments(settings.segments);


		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var settings = {};


			if (this.radius !== 0)   settings.radius = this.radius;
			if (this.segments !== 0) settings.segments = this.segments;


			if (this.origin.position.x !== 0 || this.origin.position.y !== 0) {

				settings.origin = {};

				if (this.origin.position.x !== 0) settings.origin.x = this.origin.position.x;
				if (this.origin.position.y !== 0) settings.origin.y = this.origin.position.y;

			}

			if (this.position.x !== 0 || this.position.y !== 0) {

				settings.position = {};

				if (this.position.x !== 0) settings.position.x = this.position.x;
				if (this.position.y !== 0) settings.position.y = this.position.y;

			}

			if (this.rigidity.spoke !== 1 || this.rigidity.tread !== 1) {

				settings.rigidity = {};

				if (this.rigidity.spoke !== 1) settings.rigidity.spoke = this.rigidity.spoke;
				if (this.rigidity.tread !== 1) settings.rigidity.tread = this.rigidity.tread;

			}


			return {
				'constructor': 'lychee.verlet.Tire',
				'arguments':   [ settings ]
			};

		},

		update: function(clock, delta) {

			for (var c = 0, cl = this.constraints.length; c < cl; c++) {
				this.constraints[c].update(clock, delta);
			}

		},

		render: function(renderer, offsetX, offsetY) {

			var position = this.position;

			var x = position.x + offsetX;
			var y = position.y + offsetY;


			for (var c = 0, cl = this.constraints.length; c < cl; c++) {
				this.constraints[c].render(renderer, x, y);
			}

			for (var p = 0, pl = this.particles.length; p < pl; p++) {
				this.particles[p].render(renderer, x, y);
			}

		},



		/*
		 * CUSTOM API
		 */

		setPosition: function(position) {

			if (position instanceof Object) {

				this.position.x = typeof position.x === 'number' ? position.x : this.position.x;
				this.position.y = typeof position.y === 'number' ? position.y : this.position.y;

				return true;

			}


			return false;

		},

		setRadius: function(radius) {

			radius = typeof radius === 'number' ? radius : null;

			if (radius !== null) {

				this.radius = radius;

				return true;

			}


			return false;

		},

		setRigidity: function(rigidity) {

			if (rigidity instanceof Object) {

				this.rigidity.tread = typeof rigidity.tread === 'number' ? rigidity.tread : this.rigidity.tread;
				this.rigidity.spoke = typeof rigidity.spoke === 'number' ? rigidity.spoke : this.rigidity.spoke;

				return true;

			}


			return false;

		},

		setSegments: function(segments) {

			segments = typeof segments === 'number' ? segments : null;

			if (segments !== null && segments !== this.segments) {

				this.particles = [];


				var origin = new _particle({
					x: this.position.x,
					y: this.position.y
				});



				var stride = (2*Math.PI) / segments;

				for (var sp = 0; sp < segments; sp++) {

					var theta = sp * stride;

					this.particles.push(new _particle({
						x: origin.position.x + Math.cos(theta) * this.radius,
						y: origin.position.y + Math.sin(theta) * this.radius
					}));

				}


				var constraint;
				var spoke_rigidity = this.rigidity.spoke;
				var tread_rigidity = this.rigidity.tread;

				for (var s = 0; s < segments; s++) {

					var current = this.particles[s % segments];

					this.constraints.push(new _constraint(
						current,
						origin,
						spoke_rigidity
					));

					this.constraints.push(new _constraint(
						current,
						this.particles[(s + 1) % segments],
						tread_rigidity
					));

					this.constraints.push(new _constraint(
						current,
						this.particles[(s + 5) % segments],
						tread_rigidity
					));

				}


				this.particles.push(origin);

				this.origin   = origin;
				this.segments = segments;

			}

		}

	};


	return Class;

});

