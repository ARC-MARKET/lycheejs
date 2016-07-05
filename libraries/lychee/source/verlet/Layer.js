
lychee.define('lychee.verlet.Layer').requires([
	'lychee.app.Layer',
	'lychee.math.Vector3'
]).exports(function(lychee, global, attachments) {

	var _Layer   = lychee.import('lychee.app.Layer');
	var _Vector3 = lychee.import('lychee.math.Vector3');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		this.friction   = 0.99;
		this.gravity    = new _Vector3({ x: 0, y: 1, z: 0 });


		this.__velocity = new _Vector3();


		this.setFriction(settings.friction);
		this.setGravity(settings.gravity);

		delete settings.friction;
		delete settings.gravity;


		_Layer.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = _Layer.prototype.serialize.call(this);
			data['constructor'] = 'lychee.verlet.Layer';

			var settings = data['arguments'][0];
			var blob     = (data['blob'] || {});


			if (this.friction !== 0.99)      settings.friction = this.friction;
			if (this.gravity.length() !== 0) settings.gravity  = lychee.serialize(this.gravity);


			return data;

		},

		update: function(clock, delta) {

			_Layer.prototype.update.call(this, clock, delta);


			var gravity  = this.gravity;
			var friction = this.friction;
			var velocity = this.__velocity;


			var hwidth  = this.width  / 2;
			var hheight = this.height / 2;


			for (var e = 0, el = this.entities.length; e < el; e++) {

				var entity   = this.entities[e];
				var position = entity.position;
				var origin   = entity.position.clone();


				position.copy(velocity);
				velocity.subtract(origin);
				velocity.scale(friction);


				if (position.y >= hheight && velocity.squaredLength() > 0.00000001) {

					var m = velocity.length();

					velocity.x /= m;
					velocity.y /= m;
					velocity.z /= m;

					velocity.scale(m * 0.8);

				}


				position.copy(origin);
				position.add(gravity);
				position.add(velocity);


				if (position.y > hheight) {
					position.y = hheight;
				}

			}

		},



		/*
		 * CUSTOM API
		 */

		setFriction: function(friction) {

			friction = typeof friction === 'number' ? friction : 0.99;


			if (friction > 0 && friction < 1) {

				this.friction = 1 - friction;

				return true;

			}


			return false;

		},

		setGravity: function(gravity) {

			gravity = gravity instanceof _Vector3 ? gravity : null;


			if (gravity !== null) {

				this.gravity = gravity;

				return true;

			}


			return false;

		}

	};


	return Class;

});

