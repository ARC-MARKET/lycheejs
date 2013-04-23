
lychee.define('lychee.math.Vector3').exports(function(lychee, global) {

	var _type = typeof Float32Array !== 'undefined' ? Float32Array : Array;


	var Class = function() {
		this._data = new _type(3);
	};


	Class.prototype = {

		clone: function() {

			var clone = new Class();

			this.copy(clone);

			return clone;

		},

		copy: function(vector) {

			vector.set(this._data[0], this._data[1], this._data[2]);

		},

		set: function(x, y, z) {

			var d = this._data;

			d[0] = x;
			d[1] = y;
			d[2] = z;

		},

		add: function(vector) {

			var d = this._data;
			var v = vector._data;

			d[0] += v[0];
			d[1] += v[1];
			d[2] += v[2];

		},

		subtract: function(vector) {

			var d = this._data;
			var v = vector._data;

			d[0] -= v[0];
			d[1] -= v[1];
			d[2] -= v[2];

		},

		multiply: function(vector) {

			var d = this._data;
			var v = vector._data;

			d[0] *= v[0];
			d[1] *= v[1];
			d[2] *= v[2];

		},

		divide: function(vector) {

			var d = this._data;
			var v = vector._data;

			d[0] /= v[0];
			d[1] /= v[1];
			d[2] /= v[2];

		},

		min: function(vector) {

			var d = this._data;
			var v = vector._data;

			d[0] = Math.min(d[0], v[0]);
			d[1] = Math.min(d[1], v[1]);
			d[2] = Math.min(d[2], v[2]);

		},

		max: function(vector) {

			var d = this._data;
			var v = vector._data;

			d[0] = Math.max(d[0], v[0]);
			d[1] = Math.max(d[1], v[1]);
			d[2] = Math.max(d[2], v[2]);

		},

		scale: function(scale) {

			var d = this._data;
			var v = vector._data;

			d[0] *= scale;
			d[1] *= scale;
			d[2] *= scale;

		},

		distance: function(vector) {

			var d = this._data;
			var v = vector._data;

			var x = v[0] - d[0];
			var y = v[1] - d[1];
			var z = v[2] - d[2];


			return Math.sqrt(x*x + y*y + z*z);

		},

		squaredDistance: function(vector) {

			var d = this._data;
			var v = vector._data;

			var x = v[0] - d[0];
			var y = v[1] - d[1];
			var z = v[2] - d[2];


			return (x*x + y*y + z*z);

		},

		length: function() {

			var d = this._data;

			var x = d[0];
			var y = d[1];
			var z = d[2];


			return Math.sqrt(x*x + y*y + z*z);

		},

		squaredLength: function() {

			var d = this._data;

			var x = d[0];
			var y = d[1];
			var z = d[2];


			return (x*x + y*y + z*z);

		},

		invert: function() {

			var d = this._data;

			d[0] *= -1;
			d[1] *= -1;
			d[2] *= -1;

		},

		normalize: function() {

			var d = this._data;

			var x = d[0];
			var y = d[1];
			var z = d[2];


			var length = (x*x + y*y + z*z);
			if (length > 0) {

				length = 1 / Math.sqrt(length);

				d[0] *= length;
				d[1] *= length;
				d[2] *= length;

			}

		},

		scalar: function(vector) {

			var d = this._data;
			var v = vector._data;


			return (
				  d[0] * v[0]
				+ d[1] * v[1]
				+ d[2] * v[2]
			);

		},

		cross: function(vector) {

			var d = this._data;
			var v = vector._data;

			var ax = d[0],
				ay = d[1],
				az = d[2];

			var bx = v[0],
				by = v[1],
				bz = v[2];


			d[0] = ay * bz - az * by;
			d[1] = az * bx - ax * bz;
			d[2] = ax * by - ay * bx;

		},

		interpolate: function(vector, t) {

			var d = this._data;
			var v = vector._data;

			d[0] += t * (v[0] - d[0]);
			d[1] += t * (v[1] - d[1]);
			d[2] += t * (v[2] - d[2]);

		},

		interpolateAdd: function(vector, t) {

			var d = this._data;
			var v = vector._data;

 			d[0] += t * v[0];
			d[1] += t * v[1];
			d[2] += t * v[2];

		},

		interpolateSet: function(vector, t) {

			var d = this._data;
			var v = vector._data;

 			d[0] = t * v[0];
			d[1] = t * v[1];
			d[2] = t * v[2];

		},

		applyMatrix4: function(matrix) {

			var d = this._data;
			var m = matrix._data;

			var x = d[0];
			var y = d[1];
			var z = d[2];


			d[0] = m[0]*x  +  m[4]*y  + m[8]*z  + m[12];
			d[1] = m[1]*x  +  m[5]*y  + m[9]*z  + m[13];
			d[2] = m[2]*x  +  m[6]*y  + m[10]*z + m[14];

		},

		applyQuaternion: function(quaternion) {

			var d = this._data;
			var q = quaternion._data;


			var vx = d[0];
			var vy = d[1];
			var vz = d[2];

			var qx = q[0];
			var qy = q[1];
			var qz = q[2];
			var qw = q[3];

			var ix =  qw * vx + qy * vz - qz * vy;
			var iy =  qw * vy + qz * vx - qx * vz;
			var iz =  qw * vz + qx * vy - qy * vx;
			var iw = -qx * vx - qy * vy - qz * vz;


			d[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
			d[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
			d[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;

		}

	};


	return Class;

});

