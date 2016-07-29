
lychee.define('lychee.verlet.Layer').requires([
	'lychee.app.Layer',
	'lychee.math.Vector3'
]).exports(function(lychee, global, attachments) {

	const _Layer   = lychee.import('lychee.app.Layer');
	const _Vector3 = lychee.import('lychee.math.Vector3');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


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


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Layer.prototype.serialize.call(this);
			data['constructor'] = 'lychee.verlet.Layer';

			let settings = data['arguments'][0];
			let blob     = (data['blob'] || {});


			if (this.friction !== 0.99)      settings.friction = this.friction;
			if (this.gravity.length() !== 0) settings.gravity  = lychee.serialize(this.gravity);


			return data;

		},

		update: function(clock, delta) {

			_Layer.prototype.update.call(this, clock, delta);


			let entities = this.entities;
			let friction = this.friction;
			let gravity  = this.gravity;
			let velocity = this.__velocity;


			let hwidth  = this.width  / 2;
			let hheight = this.height / 2;

			for (let e = 0, el = entities.length; e < el; e++) {

				let entity    = entities[e];
				let position  = entity.position.clone();
                let particles = entity.particles;

				for (let p = 0, pl = particles.length; p < pl; p++) {

					let particle = particles[p];


					particle.copy(velocity);
					velocity.sub(position);
					velocity.scale(friction);


					if (particle.y >= hheight && velocity.squaredLength() > 0.00000001) {

						let m = velocity.length();

						velocity.x /= m;
						velocity.y /= m;
						velocity.z /= m;

						velocity.scale(m * 0.8);

					}


					particle.copy(position);
					particle.add(gravity);
					particle.add(velocity);


					if (particle.y > hheight) {
						particle.y = hheight;
					}

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


	return Composite;

});

