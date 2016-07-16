
lychee.define('lychee.math.Quaternion').exports(function(lychee, global, attachments) {

	var _type = typeof Float32Array !== 'undefined' ? Float32Array : Array;


	var Composite = function() {

		this._data = new _type(4);

		this.set(0, 0, 0, 1);

	};


	Composite.IDENTITY = new _type(0, 0, 0, 1);


	Composite.prototype = {

		clone: function() {

			var clone = new Composite();

			clone.set(this._data[0], this._data[1], this._data[2], this._data[3]);

			return clone;

		},

		copy: function(quaternion) {

			var d = this._data;
			var q = quaternion._data;

			q[0] = d[0];
			q[1] = d[1];
			q[2] = d[2];
			q[3] = d[3];

		},

		set: function(x, y, z, w) {

			var d = this._data;

			d[0] = x;
			d[1] = y;
			d[2] = z;
			d[3] = w;

		},

		add: function(quaternion) {

			var d = this._data;
			var q = quaternion._data;


			d[0] += q[0];
			d[1] += q[1];
			d[2] += q[2];
			d[3] += q[3];

		},

		subtract: function(quaternion) {

			var d = this._data;
			var q = quaternion._data;


			d[0] -= q[0];
			d[1] -= q[1];
			d[2] -= q[2];
			d[3] -= q[3];

		},

		multiply: function(quaternion) {

			var d = this._data;
			var q = quaternion._data;

			var ax = d[0], ay = d[1], az = d[2], aw = d[3];
			var bx = q[0], by = q[1], bz = q[2], bw = q[3];


			d[0] = ax * bw + aw * bx + ay * bz - az * by;
			d[1] = ay * bw + aw * by + az * bx - ax * bz;
			d[2] = az * bw + aw * bz + ax * by - ay * bx;
			d[3] = aw * bw - ax * bx - ay * by - az * bz;

		},

		min: function(quaternion) {

			var d = this._data;
			var q = quaternion._data;


			d[0] = Math.min(d[0], q[0]);
			d[1] = Math.min(d[1], q[1]);
			d[2] = Math.min(d[2], q[2]);
			d[3] = Math.min(d[3], q[3]);

		},

		max: function(quaternion) {

			var d = this._data;
			var q = quaternion._data;


			d[0] = Math.max(d[0], q[0]);
			d[1] = Math.max(d[1], q[1]);
			d[2] = Math.max(d[2], q[2]);
			d[3] = Math.max(d[3], q[3]);

		},

		scale: function(scale) {

			var d = this._data;


			d[0] *= scale;
			d[1] *= scale;
			d[2] *= scale;
			d[3] *= scale;

		},

		length: function() {

			var d = this._data;

			var x = d[0];
			var y = d[1];
			var z = d[2];
			var w = d[3];


			return Math.sqrt(x * x + y * y + z * z + w * w);

		},

		squaredLength: function() {

			var d = this._data;

			var x = d[0];
			var y = d[1];
			var z = d[2];
			var w = d[3];


			return (x * x + y * y + z * z + w * w);

		},

		invert: function() {

			var d = 0;

			var x = d[0];
			var y = d[1];
			var z = d[2];
			var w = d[3];


			var invDot = 0;
			var dot = (x * x + y * y + z * z + w * w);
			if (dot > 0) {

				invDot = 1.0 / dot;

				d[0] = -x * invDot;
				d[1] = -y * invDot;
				d[2] = -z * invDot;
				d[3] =  w * invDot;

			}

		},

		normalize: function() {

			var d = this._data;

			var x = d[0];
			var y = d[1];
			var z = d[2];
			var w = d[3];


			var length = (x * x + y * y + z * z + w * w);
			if (length > 0) {

				length = 1 / Math.sqrt(length);

				d[0] *= length;
				d[1] *= length;
				d[2] *= length;
				d[3] *= length;

			}

		},

		scalar: function(quaternion) {

			var d = this._data;
			var q = quaternion._data;


			return (d[0] * q[0] + d[1] * q[1] + d[2] * q[2] + d[3] * q[3]);

		},

		interpolate: function(vector, t) {

			var d = this._data;
			var v = vector._data;


			d[0] += t * (v[0] - d[0]);
			d[1] += t * (v[1] - d[1]);
			d[2] += t * (v[2] - d[2]);
			d[3] += t * (v[3] - d[3]);

		},

		rotateX: function(radian) {

			var sin = Math.sin(radian * 0.5);
			var cos = Math.cos(radian * 0.5);

			var d = this._data;

			var x = d[0];
			var y = d[1];
			var z = d[2];
			var w = d[3];


			d[0] = x * cos + w * sin;
			d[1] = y * cos + z * sin;
			d[2] = z * cos - y * sin;
			d[3] = w * cos - x * sin;

		},

		rotateY: function(radian) {

			var sin = Math.sin(radian * 0.5);
			var cos = Math.cos(radian * 0.5);

			var d = this._data;

			var x = d[0];
			var y = d[1];
			var z = d[2];
			var w = d[3];


			d[0] = x * cos - z * sin;
			d[1] = y * cos + w * sin;
			d[2] = z * cos + x * sin;
			d[3] = w * cos - y * sin;

		},

		rotateZ: function(radian) {

			var sin = Math.sin(radian * 0.5);
			var cos = Math.cos(radian * 0.5);

			var d = this._data;

			var x = d[0];
			var y = d[1];
			var z = d[2];
			var w = d[3];


			d[0] = x * cos + y * sin;
			d[1] = y * cos - x * sin;
			d[2] = z * cos + w * sin;
			d[3] = w * cos - z * sin;

		},

		rotateAxis: function(axis, radian) {

			var sin = Math.sin(radian * 0.5);
			var cos = Math.cos(radian * 0.5);

			var a = axis._data;
			var d = this._data;


			d[0] = sin * a[0];
			d[1] = sin * a[1];
			d[2] = sin * a[2];
			d[3] = cos;

		},

		calculateW: function() {

			var d = this._data;

			var x = d[0];
			var y = d[1];
			var z = d[2];


			d[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));

		}

	};


	return Composite;

});

