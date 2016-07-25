
lychee.define('lychee.verlet.Constraint').requires([
	'lychee.math.Vector3'
]).exports(function(lychee, global, attachments) {

	var _Vector3 = lychee.import('lychee.math.Vector3');
	var _cache   = new _Vector3();


	var Composite = function(a_vector, b_vector, rigidity) {

        this.__a_vector = a_vector instanceof _Vector3 ? a_vector : null;
        this.__b_vector = b_vector instanceof _Vector3 ? b_vector : null;
		this.__distance = 0;

		this.rigidity = typeof rigidity === 'number' ? rigidity : 1;


		if (this.__a_vector !== null && this.__b_vector !== null) {

			this.__a_vector.copy(_cache);
			_cache.subtract(this.__b_vector);
			this.__distance = _cache.squaredLength();

		}

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var a_vector = lychee.serialize(this.__a_vector);
			var b_vector = lychee.serialize(this.__b_vector);


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

			var u = delta / 1000;
			var a = this.__a_vector;
			var b = this.__b_vector;


			if (a !== null && b !== null) {

				a.copy(_cache);
				_cache.sub(b);

				var distance = this.__distance;
				var rigidity = this.rigidity;
				var m        = _cache.squaredLength();
				var scale    = ((distance - m) / m) * rigidity * u;

				_cache.scale(scale);
				a.add(_cache);
				b.sub(_cache);

			}

		},

		render: function(renderer, offsetX, offsetY) {

			var a = this.__a_vector;
			var b = this.__b_vector;


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

