
lychee.define('lychee.math.Vector4').exports(function(lychee, global) {

	var _type = typeof Float32Array !== 'undefined' ? Float32Array : Array;


	var Class = function() {
		this._data = new _type(4);
	};


	Class.prototype = {

		clone: function() {

			var clone = new Class();

			clone.set(this._data[0], this._data[1], this._data[2], this._data[3]);

			return clone;

		},

		copy: function(vector) {

			var d = this._data;
			var v = vector._data;


			v[0] = d[0];
			v[1] = d[1];
			v[2] = d[2];
			v[3] = d[3];

		},

		set: function(x, y, z, w) {

			var d = this._data;


			d[0] = x;
			d[1] = y;
			d[2] = z;
			d[3] = w;

		},

		add: function(vector) {

			var d = this._data;
			var v = vector._data;


			d[0] += v[0];
			d[1] += v[1];
			d[2] += v[2];
			d[3] += v[3];

		},

		subtract: function(vector) {

			var d = this._data;
			var v = vector._data;


			d[0] -= v[0];
			d[1] -= v[1];
			d[2] -= v[2];
			d[3] -= v[3];

		},

		multiply: function(vector) {

			var d = this._data;
			var v = vector._data;


			d[0] *= v[0];
			d[1] *= v[1];
			d[2] *= v[2];
			d[3] *= v[3];

		},

		divide: function(vector) {

			var d = this._data;
			var v = vector._data;


			d[0] /= v[0];
			d[1] /= v[1];
			d[2] /= v[2];
			d[3] /= v[3];

		},

		min: function(vector) {

			var d = this._data;
			var v = vector._data;


			d[0] = Math.min(d[0], v[0]);
			d[1] = Math.min(d[1], v[1]);
			d[2] = Math.min(d[2], v[2]);
			d[3] = Math.min(d[3], v[3]);

		},

		max: function(vector) {

			var d = this._data;
			var v = vector._data;


			d[0] = Math.max(d[0], v[0]);
			d[1] = Math.max(d[1], v[1]);
			d[2] = Math.max(d[2], v[2]);
			d[3] = Math.max(d[3], v[3]);

		},

		scale: function(scale) {

			var d = this._data;


			d[0] *= scale;
			d[1] *= scale;
			d[2] *= scale;
			d[3] *= scale;

		},

		distance: function(vector) {

			var d = this._data;
			var v = vector._data;

			var x = v[0] - d[0];
			var y = v[1] - d[1];
			var z = v[2] - d[2];
			var w = v[3] - d[3];


			return Math.sqrt(x*x + y*y + z*z + w*w);

		},

		squaredDistance: function(vector) {

			var d = this._data;
			var v = vector._data;

			var x = v[0] - d[0];
			var y = v[1] - d[1];
			var z = v[2] - d[2];
			var w = v[3] - d[3];


			return (x*x + y*y + z*z + w*w);

		},

		length: function() {

			var d = this._data;

			var x = d[0];
			var y = d[1];
			var z = d[2];
			var w = d[3];


			return Math.sqrt(x*x + y*y + z*z + w*w);

		},

		squaredLength: function() {

			var d = this._data;

			var x = d[0];
			var y = d[1];
			var z = d[2];
			var w = d[3];


			return (x*x + y*y + z*z + w*w);

		},

		invert: function() {

			var d = this._data;


			d[0] *= -1;
			d[1] *= -1;
			d[2] *= -1;
			d[3] *= -1;

		},

		normalize: function() {

			var d = this._data;

			var x = d[0];
			var y = d[1];
			var z = d[2];
			var w = d[3];


			var length = (x*x + y*y + z*z + w*w);
			if (length > 0) {

				length = 1 / Math.sqrt(length);

				d[0] *= length;
				d[1] *= length;
				d[2] *= length;
				d[3] *= length;

			}

		},

		scalar: function(vector) {

			var d = this._data;
			var v = vector._data;


			return (
				  d[0] * v[0]
				+ d[1] * v[1]
				+ d[2] * v[2]
				+ d[3] * v[3]
			);

		},

		interpolate: function(vector, t) {

			var d = this._data;
			var v = vector._data;


			d[0] += t * (v[0] - d[0]);
			d[1] += t * (v[1] - d[1]);
			d[2] += t * (v[2] - d[2]);
			d[3] += t * (v[3] - d[3]);

		},

		interpolateAdd: function(vector, t) {

			var d = this._data;
			var v = vector._data;

 			d[0] += t * v[0];
			d[1] += t * v[1];
			d[2] += t * v[2];
			d[3] += t * v[3];

		},

		interpolateSet: function(vector, t) {

			var d = this._data;
			var v = vector._data;

 			d[0] = t * v[0];
			d[1] = t * v[1];
			d[2] = t * v[2];
			d[3] = t * v[3];

		},

		applyMatrix4: function(matrix) {

			var d = this._data;
			var m = matrix._data;

			var x = d[0];
			var y = d[1];
			var z = d[2];
			var w = d[3];


			d[0] = m[0]*x  +  m[4]*y  + m[8]*z  + m[12]*w;
			d[1] = m[1]*x  +  m[5]*y  + m[9]*z  + m[13]*w;
			d[2] = m[2]*x  +  m[6]*y  + m[10]*z + m[14]*w;
			d[3] = m[3]*x  +  m[7]*y  + m[11]*z + m[15]*w;

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

