
lychee.define('lychee.math.Vector3').exports((lychee, global, attachments) => {



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.x = typeof states.x === 'number' ? (states.x | 0) : 0;
		this.y = typeof states.y === 'number' ? (states.y | 0) : 0;
		this.z = typeof states.z === 'number' ? (states.z | 0) : 0;


		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let states = {};


			if (this.x !== 0) states.x = this.x;
			if (this.y !== 0) states.y = this.y;
			if (this.z !== 0) states.z = this.z;


			return {
				'constructor': 'lychee.math.Vector3',
				'arguments':   [ states ],
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

			vector = vector instanceof Composite ? vector : null;


			if (vector !== null) {

				vector.set(this.x, this.y, this.z);

			}


			return this;

		},

		set: function(x, y, z) {

			x = typeof x === 'number' ? x : 0;
			y = typeof y === 'number' ? y : 0;
			z = typeof z === 'number' ? z : 0;


			this.x = x;
			this.y = y;
			this.z = z;


			return this;

		},

		add: function(vector) {

			vector = vector instanceof Composite ? vector : null;


			if (vector !== null) {

				this.x += vector.x;
				this.y += vector.y;
				this.z += vector.z;

			}


			return this;

		},

		sub: function(vector) {

			vector = vector instanceof Composite ? vector : null;


			if (vector !== null) {

				this.x -= vector.x;
				this.y -= vector.y;
				this.z -= vector.z;

			}


			return this;

		},

		multiply: function(vector) {

			vector = vector instanceof Composite ? vector : null;


			if (vector !== null) {

				this.x *= vector.x;
				this.y *= vector.y;
				this.z *= vector.z;

			}


			return this;

		},

		divide: function(vector) {

			vector = vector instanceof Composite ? vector : null;


			if (vector !== null) {

				this.x /= vector.x;
				this.y /= vector.y;
				this.z /= vector.z;

			}


			return this;

		},

		min: function(vector) {

			vector = vector instanceof Composite ? vector : null;


			if (vector !== null) {

				this.x = Math.min(this.x, vector.x);
				this.y = Math.min(this.y, vector.y);
				this.z = Math.min(this.z, vector.z);

			}


			return this;

		},

		max: function(vector) {

			vector = vector instanceof Composite ? vector : null;


			if (vector !== null) {

				this.x = Math.max(this.x, vector.x);
				this.y = Math.max(this.y, vector.y);
				this.z = Math.max(this.z, vector.z);

			}


			return this;

		},

		scale: function(scale) {

			scale = typeof scale === 'number' ? scale : null;


			if (scale !== null) {

				this.x *= scale;
				this.y *= scale;
				this.z *= scale;

			}


			return this;

		},

		distance: function(vector) {

			vector = vector instanceof Composite ? vector : null;


			if (vector !== null) {

				let x = vector.x - this.x;
				let y = vector.y - this.y;
				let z = vector.z - this.z;


				return Math.sqrt(x * x + y * y + z * z);

			}


			return 0;

		},

		squaredDistance: function(vector) {

			vector = vector instanceof Composite ? vector : null;


			if (vector !== null) {

				let x = vector.x - this.x;
				let y = vector.y - this.y;
				let z = vector.z - this.z;


				return (x * x + y * y + z * z);

			}


			return 0;

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

			vector = vector instanceof Composite ? vector : null;


			if (vector !== null) {
				return (this.x * vector.x + this.y * vector.y + this.z * vector.z);
			}


			return 0;

		},

		cross: function(vector) {

			vector = vector instanceof Composite ? vector : null;


			if (vector !== null) {

				let ax = this.x;
				let ay = this.y;
				let az = this.z;

				let bx = vector.x;
				let by = vector.y;
				let bz = vector.z;


				this.x = ay * bz - az * by;
				this.y = az * bx - ax * bz;
				this.z = ax * by - ay * bx;

			}


			return this;

		},

		interpolate: function(vector, t) {

			vector = vector instanceof Composite ? vector : null;
			t      = typeof t === 'number'       ? t      : null;


			if (vector !== null && t !== null) {

				let dx = (vector.x - this.x);
				let dy = (vector.y - this.y);
				let dz = (vector.z - this.z);


				this.x += t * dx;
				this.y += t * dy;
				this.z += t * dz;

			}


			return this;

		},

		interpolateAdd: function(vector, t) {

			vector = vector instanceof Composite ? vector : null;
			t      = typeof t === 'number'       ? t      : null;


			if (vector !== null && t !== null) {

				this.x += t * vector.x;
				this.y += t * vector.y;
				this.z += t * vector.z;

			}


			return this;

		},

		interpolateSet: function(vector, t) {

			vector = vector instanceof Composite ? vector : null;
			t      = typeof t === 'number'       ? t      : null;


			if (vector !== null && t !== null) {

				this.x = t * vector.x;
				this.y = t * vector.y;
				this.z = t * vector.z;

			}


			return this;

		},

		applyMatrix: function(matrix) {

			matrix = matrix instanceof lychee.math.Matrix ? matrix : null;


			if (matrix !== null) {

				let x = this.x;
				let y = this.y;
				let z = this.z;
				let m = matrix.data;


				this.x = m[0] * x + m[4] * y + m[8]  * z + m[12];
				this.y = m[1] * x + m[5] * y + m[9]  * z + m[13];
				this.z = m[2] * x + m[6] * y + m[10] * z + m[14];

			}


			return this;

		},

		applyQuaternion: function(quaternion) {

			quaternion = quaternion instanceof lychee.math.Quaternion ? quaternion : null;


			if (quaternion !== null) {

				let vx = this.x;
				let vy = this.y;
				let vz = this.z;

				let q  = quaternion.data;
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

			}


			return this;

		}

	};


	return Composite;

});

