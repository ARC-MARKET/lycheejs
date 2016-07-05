
lychee.define('lychee.math.Vector3').exports(function(lychee, global, attachments) {



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		this.x = typeof settings.x === 'number' ? (settings.x | 0) : 0;
		this.y = typeof settings.y === 'number' ? (settings.y | 0) : 0;
		this.z = typeof settings.z === 'number' ? (settings.z | 0) : 0;


		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var settings = {};


			if (this.x !== 0) settings.x = this.x;
			if (this.y !== 0) settings.y = this.y;
			if (this.z !== 0) settings.z = this.z;


			return {
				'constructor': 'lychee.math.Vector3',
				'arguments':   [ settings ],
				'blob':        null
			};

		},



		/*
		 * CUSTOM API
		 */

		clone: function() {

			return new Class({
				x: this.x,
				y: this.y,
				z: this.z
			});

		},

		copy: function(vector) {

			vector.set(this.x, this.y, this.z);

		},

		set: function(x, y, z) {

			this.x = x;
			this.y = y;
			this.z = z;

		},

		add: function(vector) {

			this.x += vector.x;
			this.y += vector.y;
			this.z += vector.z;

		},

		subtract: function(vector) {

			this.x -= vector.x;
			this.y -= vector.y;
			this.z -= vector.z;

		},

		multiply: function(vector) {

			this.x *= vector.x;
			this.y *= vector.y;
			this.z *= vector.z;

		},

		divide: function(vector) {

			this.x /= vector.x;
			this.y /= vector.y;
			this.z /= vector.z;

		},

		min: function(vector) {

			this.x = Math.min(this.x, vector.x);
			this.y = Math.min(this.y, vector.y);
			this.z = Math.min(this.z, vector.z);

		},

		max: function(vector) {

			this.x = Math.max(this.x, vector.x);
			this.y = Math.max(this.y, vector.y);
			this.z = Math.max(this.z, vector.z);

		},

		scale: function(scale) {

			this.x *= scale;
			this.y *= scale;
			this.z *= scale;

		},

		distance: function(vector) {

			var x = vector.x - this.x;
			var y = vector.y - this.y;
			var z = vector.z - this.z;


			return Math.sqrt(x * x + y * y + z * z);

		},

		squaredDistance: function(vector) {

			var x = vector.x - this.x;
			var y = vector.y - this.y;
			var z = vector.z - this.z;


			return (x * x + y * y + z * z);

		},

		length: function() {

			var x = this.x;
			var y = this.y;
			var z = this.z;


			return Math.sqrt(x * x + y * y + z * z);

		},

		squaredLength: function() {

			var x = this.x;
			var y = this.y;
			var z = this.z;


			return (x * x + y * y + z * z);

		},

		invert: function() {

			this.x *= -1;
			this.y *= -1;
			this.z *= -1;

		},

		normalize: function() {

			var x = this.x;
			var y = this.y;
			var z = this.z;


			var length = (x * x + y * y + z * z);
			if (length > 0) {

				length = 1 / Math.sqrt(length);

				this.x *= length;
				this.x *= length;
				this.z *= length;

			}

		},

		scalar: function(vector) {

			return (this.x * vector.x + this.y * vector.y + this.z * vector.z);

		},

		cross: function(vector) {

			var ax = this.x;
			var ay = this.y;
			var az = this.z;

			var bx = vector.x;
			var by = vector.y;
			var bz = vector.z;


			this.x = ay * bz - az * by;
			this.y = az * bx - ax * bz;
			this.z = ax * by - ay * bx;

		},

		interpolate: function(vector, t) {

			var dx = (vector.x - this.x);
			var dy = (vector.y - this.y);
			var dz = (vector.z - this.z);


			this.x += t * dx;
			this.y += t * dy;
			this.z += t * dz;

		},

		interpolateAdd: function(vector, t) {

 			this.x += t * vector.x;
			this.y += t * vector.y;
			this.z += t * vector.z;

		},

		interpolateSet: function(vector, t) {

			this.x = t * vector.x;
			this.y = t * vector.y;
			this.z = t * vector.z;

		},

		applyMatrix: function(matrix) {

			var x = this.x;
			var y = this.y;
			var z = this.z;
			var m = matrix.data;


			this.x = m[0] * x + m[4] * y + m[8]  * z + m[12];
			this.y = m[1] * x + m[5] * y + m[9]  * z + m[13];
			this.z = m[2] * x + m[6] * y + m[10] * z + m[14];

		},

		applyQuaternion: function(quaternion) {

			var vx = this.x;
			var vy = this.y;
			var vz = this.z;

			var q  = quarternion.data;
			var qx = q[0];
			var qy = q[1];
			var qz = q[2];
			var qw = q[3];

			var ix =  qw * vx + qy * vz - qz * vy;
			var iy =  qw * vy + qz * vx - qx * vz;
			var iz =  qw * vz + qx * vy - qy * vx;
			var iw = -qx * vx - qy * vy - qz * vz;


			this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
			this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
			this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

		}

	};


	return Class;

});

