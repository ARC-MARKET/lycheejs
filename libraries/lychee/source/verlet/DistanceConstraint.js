
lychee.define('lychee.verlet.DistanceConstraint').requires([
	'lychee.math.Vector2',
	'lychee.verlet.Particle'
]).exports(function(lychee, global, attachments) {

	var _Particle = lychee.import('lychee.verlet.Particle');
	var _Vector2  = lychee.import('lychee.math.Vector2');
	var _cache    = new _Vector2();


	var Class = function(a, b, rigidity) {

		this.a = a instanceof _Particle ? a : null;
		this.b = b instanceof _Particle ? b : null;

		this.distance = 0;
		this.rigidity = typeof rigidity === 'number' ? rigidity : 1;


		if (this.a !== null && this.b !== null) {

			this.a.position.copy(_cache);
			_cache.subtract(this.b.position);
			this.distance = _cache.squaredLength();

		}

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		update: function(clock, delta) {

			var u = delta / 1000;


			var a = this.a;
			var b = this.b;

			if (a !== null && b !== null) {

				a.position.copy(_cache);
				_cache.subtract(b.position);

				var dist  = _cache.length();
				var m     = _cache.squaredLength();
				var scale = ((this.distance - m) / m) * this.rigidity * u;

				_cache.scale(scale);

				a.position.add(_cache);
				b.position.subtract(_cache);

			}

		},

		render: function(renderer, offsetX, offsetY) {

			var a = this.a.position;
			var b = this.b.position;


			var x1 = a.x + offsetX;
			var y1 = a.y + offsetY;
			var x2 = b.x + offsetX;
			var y2 = b.y + offsetY;


			renderer.drawLine(
				x1,
				y1,
				x2,
				y2,
				'#ff0000',
				2
			);

		}

	};


	return Class;

});

