
lychee.define('lychee.physics.Particle').requires([
	'lychee.math.Vector3'
]).exports(function(lychee, global) {

	var _vector3 = lychee.math.Vector3;


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.__force    = new _vector3();
		this.__position = new _vector3();
		this.__velocity = new _vector3();

		this.__damping     = 1;
		this.__inverseMass = null;
		this.__inverseForce = new _vector3();


		this.setForce(settings.force);
		this.setMass(settings.mass);
		this.setPosition(settings.position);
		this.setVelocity(settings.velocity);


		settings = null;

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		update: function(clock, delta) {

			// Skip if our physical mass is Infinity
			if (this.__inverseMass === null) return;


			var t = delta / 1000;
			if (t > 0) {

				this.__position.interpolateAdd(
					this.__velocity, t
				);

				this.__velocity.interpolateAdd(
					this.__inverseForce, t
				);

			}

		},



		/*
		 * GETTERS AND SETTERS
		 */

		getDamping: function() {
			return this.__damping;
		},

		setDamping: function(damping) {

			damping = typeof damping === 'number' ? damping : null;

			if (damping !== null) {
				this.__damping = damping;
				return true;
			}


			return false;

		},

		getForce: function() {
			return this.__force;
		},

		setForce: function(force) {

			if (force instanceof Object) {

				var d = this.__force.data;

				d[0] = typeof force.x === 'number' ? force.x : d[0];
				d[1] = typeof force.y === 'number' ? force.y : d[1];
				d[2] = typeof force.z === 'number' ? force.z : d[2];


				this.__inverseForce.interpolateSet(
					this.__force, this.__inverseMass
				);


				return true;

			}


			return false;

		},

		getMass: function() {

			if (this.__inverseMass !== null) {
				return (1 / this.__inverseMass);
			}


			return Infinity;

		},

		setMass: function(mass) {

			if (mass !== 0) {

				this.__inverseMass = 1 / mass;
				this.__inverseForce.interpolateSet(
					this.__force,
					this.__inverseMass
				);


				return true;

			}


			return false;

		},

		getPosition: function() {
			return this.__position;
		},

		setPosition: function(position) {

			if (position instanceof Object) {

				var d = this.__position._data;

				d[0] = typeof position.x === 'number' ? position.x : d[0];
				d[1] = typeof position.y === 'number' ? position.y : d[1];
				d[2] = typeof position.z === 'number' ? position.z : d[2];


				return true;

			}


			return false;

		},

		getVelocity: function() {
			return this.__velocity;
		},

		setVelocity: function(velocity) {

			if (velocity instanceof Object) {

				var d = this.__velocity._data;

				d[0] = typeof velocity.x === 'number' ? velocity.x : d[0];
				d[1] = typeof velocity.y === 'number' ? velocity.y : d[1];
				d[2] = typeof velocity.z === 'number' ? velocity.z : d[2];


				return true;

			}


			return false;

		}

	};


	return Class;

});

