
lychee.define('lychee.math.Vector3').exports(function(lychee, global, attachments) {



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.x = typeof settings.x === 'number' ? (settings.x | 0) : 0;
		this.y = typeof settings.y === 'number' ? (settings.y | 0) : 0;
		this.z = typeof settings.z === 'number' ? (settings.z | 0) : 0;


		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let settings = {};


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

			return new Composite({
				x: this.x,
				y: this.y,
				z: this.z
			});

		},

		copy: function(vector) {

			vector.set(this.x, this.y, this.z);


			return this;

		},

		set: function(x, y, z) {

			this.x = x;
			this.y = y;
			this.z = z;


			return this;

		},

		add: function(vector) {

			this.x += vector.x;
			this.y += vector.y;
			this.z += vector.z;


			return this;

		},

		sub: function(vector) {

			this.x -= vector.x;
			this.y -= vector.y;
			this.z -= vector.z;


			return this;

		},

		multiply: function(vector) {

			this.x *= vector.x;
			this.y *= vector.y;
			this.z *= vector.z;


			return this;

		},

		divide: function(vector) {

			this.x /= vector.x;
			this.y /= vector.y;
			this.z /= vector.z;


			return this;

		},

		min: function(vector) {

			this.x = Math.min(this.x, vector.x);
			this.y = Math.min(this.y, vector.y);
			this.z = Math.min(this.z, vector.z);


			return this;

		},

		max: function(vector) {

			this.x = Math.max(this.x, vector.x);
			this.y = Math.max(this.y, vector.y);
			this.z = Math.max(this.z, vector.z);


			return this;

		},

		scale: function(scale) {

			this.x *= scale;
			this.y *= scale;
			this.z *= scale;


			return this;

		},

		distance: function(vector) {

			let x = vector.x - this.x;
			let y = vector.y - this.y;
			let z = vector.z - this.z;


			return Math.sqrt(x * x + y * y + z * z);

		},

		squaredDistance: function(vector) {

			let x = vector.x - this.x;
			let y = vector.y - this.y;
			let z = vector.z - this.z;


			return (x * x + y * y + z * z);

		},

		length: function() {

			let x = this.x;
			let y = this.y;
			let z = this.z;


			return Math.sqrt(x * x + y * y + z * z);

		},

		squaredLength: function() {

			let x = this.x;
			let y = this.y;
			let z = this.z;


			return (x * x + y * y + z * z);

		},

		invert: function() {

			this.x *= -1;
			this.y *= -1;
			this.z *= -1;


			return this;

		},

		normalize: function() {

			let x = this.x;
			let y = this.y;
			let z = this.z;


			let length = (x * x + y * y + z * z);
			if (length > 0) {

				length = 1 / Math.sqrt(length);

				this.x *= length;
				this.x *= length;
				this.z *= length;

			}


			return this;

		},

		scalar: function(vector) {

			return (this.x * vector.x + this.y * vector.y + this.z * vector.z);

		},

		cross: function(vector) {

			let ax = this.x;
			let ay = this.y;
			let az = this.z;

			let bx = vector.x;
			let by = vector.y;
			let bz = vector.z;


			this.x = ay * bz - az * by;
			this.y = az * bx - ax * bz;
			this.z = ax * by - ay * bx;


			return this;

		},

		interpolate: function(vector, t) {

			let dx = (vector.x - this.x);
			let dy = (vector.y - this.y);
			let dz = (vector.z - this.z);


			this.x += t * dx;
			this.y += t * dy;
			this.z += t * dz;


			return this;

		},

		interpolateAdd: function(vector, t) {

 			this.x += t * vector.x;
			this.y += t * vector.y;
			this.z += t * vector.z;


			return this;

		},

		interpolateSet: function(vector, t) {

			this.x = t * vector.x;
			this.y = t * vector.y;
			this.z = t * vector.z;


			return this;

		},

		applyMatrix: function(matrix) {

			let x = this.x;
			let y = this.y;
			let z = this.z;
			let m = matrix.data;


			this.x = m[0] * x + m[4] * y + m[8]  * z + m[12];
			this.y = m[1] * x + m[5] * y + m[9]  * z + m[13];
			this.z = m[2] * x + m[6] * y + m[10] * z + m[14];


			return this;

		},

		applyQuaternion: function(quaternion) {

			let vx = this.x;
			let vy = this.y;
			let vz = this.z;

			let q  = quarternion.data;
			let qx = q[0];
			let qy = q[1];
			let qz = q[2];
			let qw = q[3];

			let ix =  qw * vx + qy * vz - qz * vy;
			let iy =  qw * vy + qz * vx - qx * vz;
			let iz =  qw * vz + qx * vy - qy * vx;
			let iw = -qx * vx - qy * vy - qz * vz;


			this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
			this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
			this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;


			return this;

		}

	};


	return Composite;

});

