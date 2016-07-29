
lychee.define('lychee.verlet.Constraint').requires([
	'lychee.math.Vector3'
]).exports(function(lychee, global, attachments) {

	const _Vector3 = lychee.import('lychee.math.Vector3');
	const _CACHE   = new _Vector3();



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(a_vector, b_vector, rigidity) {

        this.__a_vector = a_vector instanceof _Vector3 ? a_vector : null;
        this.__b_vector = b_vector instanceof _Vector3 ? b_vector : null;
		this.__distance = 0;

		this.rigidity = typeof rigidity === 'number' ? rigidity : 1;


		if (this.__a_vector !== null && this.__b_vector !== null) {

			this.__a_vector.copy(_CACHE);
			_CACHE.subtract(this.__b_vector);
			this.__distance = _CACHE.squaredLength();

		}

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let a_vector = lychee.serialize(this.__a_vector);
			let b_vector = lychee.serialize(this.__b_vector);


			return {
				'constructor': 'lychee.verlet.Constraint',
				'arguments':   [ a_vector, b_vector, this.rigidity ],
				'blob':        null
			};

		},



		/*
		 * CUSTOM API
		 */

		update: function(clock, delta) {

			let u = delta / 1000;
			let a = this.__a_vector;
			let b = this.__b_vector;


			if (a !== null && b !== null) {

				a.copy(_CACHE);
				_CACHE.sub(b);

				let distance = this.__distance;
				let rigidity = this.rigidity;
				let m        = _CACHE.squaredLength();
				let scale    = ((distance - m) / m) * rigidity * u;

				_CACHE.scale(scale);
				a.add(_CACHE);
				b.sub(_CACHE);

			}

		},

		render: function(renderer, offsetX, offsetY) {

			let a = this.__a_vector;
			let b = this.__b_vector;


			if (a !== null && b !== null) {

				renderer.drawLine(
					a.x + offsetX,
					a.y + offsetY,
					b.x + offsetX,
					b.y + offsetY,
					'#ff0000',
					2
				);

			}

		}

	};


	return Composite;

});

