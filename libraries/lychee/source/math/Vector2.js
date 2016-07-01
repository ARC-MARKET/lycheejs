
lychee.define('lychee.math.Vector2').exports(function(lychee, global, attachments) {

	var _type = typeof Float32Array !== 'undefined' ? Float32Array : Array;


	var Class = function() {

		this._data = new _type(2);

	};


	Class.prototype = {

		clone: function() {

			var clone = new Class();

			this.copy(clone);

			return clone;

		},

		copy: function(vector) {

			vector.set(this._data[0], this._data[1]);

		},

		set: function(x, y) {

			var d = this._data;


			d[0] = x;
			d[1] = y;

		},

		add: function(vector) {

			var d = this._data;
			var v = vector._data;


			d[0] += v[0];
			d[1] += v[1];

		},

		subtract: function(vector) {

			var d = this._data;
			var v = vector._data;


			d[0] -= v[0];
			d[1] -= v[1];

		},

		multiply: function(vector) {

			var d = this._data;
			var v = vector._data;


			d[0] *= v[0];
			d[1] *= v[1];

		},

		divide: function(vector) {

			var d = this._data;
			var v = vector._data;


			d[0] /= v[0];
			d[1] /= v[1];

		},

		min: function(vector) {

			var d = this._data;
			var v = vector._data;


			d[0] = Math.min(d[0], v[0]);
			d[1] = Math.min(d[1], v[1]);

		},

		max: function(vector) {

			var d = this._data;
			var v = vector._data;


			d[0] = Math.max(d[0], v[0]);
			d[1] = Math.max(d[1], v[1]);

		},

		scale: function(scale) {

			var d = this._data;
			var v = vector._data;


			d[0] *= scale;
			d[1] *= scale;

		},

		distance: function(vector) {

			var d = this._data;
			var v = vector._data;

			var x = v[0] - d[0];
			var y = v[1] - d[1];


			return Math.sqrt(x * x + y * y);

		},

		squaredDistance: function(vector) {

			var d = this._data;
			var v = vector._data;

			var x = v[0] - d[0];
			var y = v[1] - d[1];


			return (x * x + y * y);

		},

		length: function() {

			var d = this._data;

			var x = d[0];
			var y = d[1];


			return Math.sqrt(x * x + y * y);

		},

		squaredLength: function() {

			var d = this._data;

			var x = d[0];
			var y = d[1];


			return (x * x + y * y);

		},

		invert: function() {

			var d = this._data;

			d[0] *= -1;
			d[1] *= -1;

		},

		normalize: function() {

			var d = this._data;

			var x = d[0];
			var y = d[1];


			var length = (x * x + y * y);
			if (length > 0) {

				length = 1 / Math.sqrt(length);

				d[0] *= length;
				d[1] *= length;

			}

		},

		scalar: function(vector) {

			var d = this._data;
			var v = vector._data;


			return (d[0] * v[0] + d[1] * v[1]);

		},

		cross: function(vector) {

			var d = this._data;
			var v = vector._data;

			// R^2 -> R^2 will just flip the coordinates
			// to have the assumed orthogonal behaviour
			// of the resulting vector

			d[0] =      v[1];
			d[1] = -1 * v[0];

		},

		interpolate: function(vector, t) {

			var d = this._data;
			var v = vector._data;


			d[0] += t * (v[0] - d[0]);
			d[1] += t * (v[1] - d[1]);

		},

		interpolateAdd: function(vector, t) {

			var d = this._data;
			var v = vector._data;


 			d[0] += t * v[0];
			d[1] += t * v[1];

		},

		interpolateSet: function(vector, t) {

			var d = this._data;
			var v = vector._data;


 			d[0] = t * v[0];
			d[1] = t * v[1];

		},

		rotate: function(origin, t) {

			var d  = this._data;
			var o  = origin._data;
			var dx = d[0] - o[0];
			var dy = d[1] - o[1];


			d[0] = o[0] + dx * Math.cos(t) - dy * Math.sin(t);
			d[1] = o[1] + dx * Math.sin(t) + dy * Math.cos(t);

		}

	};


	return Class;

});

