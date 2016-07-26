
lychee.define('lychee.math.Quaternion').exports(function(lychee, global, attachments) {

	var _Array = typeof Float32Array !== 'undefined' ? Float32Array : Array;



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		this.data = new _Array(4);


		if (data instanceof Array) {

			this.set.call(this, data);

		} else {

			this.set.call(this, Composite.IDENTITY);

		}

	};


	Composite.IDENTITY = new _Array(0, 0, 0, 1);


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = this.data.slice(0);


			return {
				'constructor': 'lychee.math.Quaternion',
				'arguments':   [ data ],
				'blob':        null
			};

		},



		/*
		 * CUSTOM API
		 */

		clone: function() {

			return new Composite(this.data.slice(0));

		},

		copy: function(quaternion) {

			var d = this.data;
			var q = quaternion.data;


			q[0] = d[0];
			q[1] = d[1];
			q[2] = d[2];
			q[3] = d[3];


			return this;

		},

		set: function(x, y, z, w) {

			var d = this.data;


			d[0] = x;
			d[1] = y;
			d[2] = z;
			d[3] = w;


			return this;

		},

		add: function(quaternion) {

			var d = this.data;
			var q = quaternion.data;


			d[0] += q[0];
			d[1] += q[1];
			d[2] += q[2];
			d[3] += q[3];


			return this;

		},

		subtract: function(quaternion) {

			var d = this.data;
			var q = quaternion.data;


			d[0] -= q[0];
			d[1] -= q[1];
			d[2] -= q[2];
			d[3] -= q[3];


			return this;

		},

		multiply: function(quaternion) {

			var d = this.data;
			var q = quaternion.data;

			var ax = d[0], ay = d[1], az = d[2], aw = d[3];
			var bx = q[0], by = q[1], bz = q[2], bw = q[3];


			d[0] = ax * bw + aw * bx + ay * bz - az * by;
			d[1] = ay * bw + aw * by + az * bx - ax * bz;
			d[2] = az * bw + aw * bz + ax * by - ay * bx;
			d[3] = aw * bw - ax * bx - ay * by - az * bz;


			return this;

		},

		min: function(quaternion) {

			var d = this.data;
			var q = quaternion.data;


			d[0] = Math.min(d[0], q[0]);
			d[1] = Math.min(d[1], q[1]);
			d[2] = Math.min(d[2], q[2]);
			d[3] = Math.min(d[3], q[3]);


			return this;

		},

		max: function(quaternion) {

			var d = this.data;
			var q = quaternion.data;


			d[0] = Math.max(d[0], q[0]);
			d[1] = Math.max(d[1], q[1]);
			d[2] = Math.max(d[2], q[2]);
			d[3] = Math.max(d[3], q[3]);


			return this;

		},

		scale: function(scale) {

			var d = this.data;


			d[0] *= scale;
			d[1] *= scale;
			d[2] *= scale;
			d[3] *= scale;


			return this;

		},

		length: function() {

			var d = this.data;
			var x = d[0];
			var y = d[1];
			var z = d[2];
			var w = d[3];


			return Math.sqrt(x * x + y * y + z * z + w * w);

		},

		squaredLength: function() {

			var d = this.data;
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


			return this;

		},

		normalize: function() {

			var d = this.data;

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


			return this;

		},

		scalar: function(quaternion) {

			var d = this.data;
			var q = quaternion.data;


			return (d[0] * q[0] + d[1] * q[1] + d[2] * q[2] + d[3] * q[3]);

		},

		interpolate: function(vector, t) {

			var d = this.data;


			d[0] += t * (vector.x - d[0]);
			d[1] += t * (vector.y - d[1]);
			d[2] += t * (vector.z - d[2]);
			d[3] += t * (vector.w - d[3]);


			return this;

		},

		rotateX: function(radian) {

			var sin = Math.sin(radian * 0.5);
			var cos = Math.cos(radian * 0.5);

			var d = this.data;

			var x = d[0];
			var y = d[1];
			var z = d[2];
			var w = d[3];


			d[0] = x * cos + w * sin;
			d[1] = y * cos + z * sin;
			d[2] = z * cos - y * sin;
			d[3] = w * cos - x * sin;


			return this;

		},

		rotateY: function(radian) {

			var sin = Math.sin(radian * 0.5);
			var cos = Math.cos(radian * 0.5);

			var d = this.data;

			var x = d[0];
			var y = d[1];
			var z = d[2];
			var w = d[3];


			d[0] = x * cos - z * sin;
			d[1] = y * cos + w * sin;
			d[2] = z * cos + x * sin;
			d[3] = w * cos - y * sin;


			return this;

		},

		rotateZ: function(radian) {

			var sin = Math.sin(radian * 0.5);
			var cos = Math.cos(radian * 0.5);

			var d = this.data;

			var x = d[0];
			var y = d[1];
			var z = d[2];
			var w = d[3];


			d[0] = x * cos + y * sin;
			d[1] = y * cos - x * sin;
			d[2] = z * cos + w * sin;
			d[3] = w * cos - z * sin;


			return this;

		},

		rotateAxis: function(vector, radian) {

			var sin = Math.sin(radian * 0.5);
			var cos = Math.cos(radian * 0.5);

			var d = this.data;


			d[0] = sin * vector.x;
			d[1] = sin * vector.y;
			d[2] = sin * vector.z;
			d[3] = cos;


			return this;

		},

		calculateW: function() {

			var d = this.data;

			var x = d[0];
			var y = d[1];
			var z = d[2];


			d[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));


			return this;

		}

	};


	return Composite;

});

