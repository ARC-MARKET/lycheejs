
lychee.define('lychee.math.Matrix').requires([
	'lychee.math.Vector3'
]).exports((lychee, global, attachments) => {

	const _Vector3 = lychee.import('lychee.math.Vector3');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.data = new Float32Array(16);
		this.set.call(this, Composite.IDENTITY);


		this.setData(states.data);

		states = null;

	};


	Composite.IDENTITY = new Float32Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);


	Composite.PRECISION = 0.000001;


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let states = {};


			if (this.data !== null) states.data = this.data.slice(0);


			return {
				'constructor': 'lychee.math.Matrix',
				'arguments':   [ states ],
				'blob':        null
			};

		},



		/*
		 * CUSTOM API
		 */

		clone: function() {

			return new Composite(this.data.slice(0));

		},

		copy: function(matrix) {

			matrix = matrix instanceof Composite ? matrix : null;


			if (matrix !== null) {

				let d = this.data;

				matrix.set(
				    d[0],  d[1],  d[2],  d[3],
				    d[4],  d[5],  d[6],  d[7],
				    d[8],  d[9],  d[10], d[11],
					d[12], d[13], d[14], d[15]
				);

			}


			return this;

		},

		set: function(a0, a1, a2, a3, b0, b1, b2, b3, c0, c1, c2, c3, d0, d1, d2, d3) {

			a0 = typeof a0 === 'number' ? a0 : 0;
			a1 = typeof a1 === 'number' ? a1 : 0;
			a2 = typeof a2 === 'number' ? a2 : 0;
			a3 = typeof a3 === 'number' ? a3 : 0;
			b0 = typeof b0 === 'number' ? b0 : 0;
			b1 = typeof b1 === 'number' ? b1 : 0;
			b2 = typeof b2 === 'number' ? b2 : 0;
			b3 = typeof b3 === 'number' ? b3 : 0;
			c0 = typeof c0 === 'number' ? c0 : 0;
			c1 = typeof c1 === 'number' ? c1 : 0;
			c2 = typeof c2 === 'number' ? c2 : 0;
			c3 = typeof c3 === 'number' ? c3 : 0;
			d0 = typeof d0 === 'number' ? d0 : 0;
			d1 = typeof d1 === 'number' ? d1 : 0;
			d2 = typeof d2 === 'number' ? d2 : 0;
			d3 = typeof d3 === 'number' ? d3 : 0;


			let d = this.data;


			d[0]  = a0;
			d[1]  = a1;
			d[2]  = a2;
			d[3]  = a3;
			d[4]  = b0;
			d[5]  = b1;
			d[6]  = b2;
			d[7]  = b3;
			d[8]  = c0;
			d[9]  = c1;
			d[10] = c2;
			d[11] = c3;
			d[12] = d0;
			d[13] = d1;
			d[14] = d2;
			d[15] = d3;


			return this;

		},

		transpose: function() {

			let tmp;
			let d = this.data;


			tmp =  d[1];  d[1] =  d[4];  d[4] = tmp;
			tmp =  d[2];  d[2] =  d[8];  d[8] = tmp;
			tmp =  d[6];  d[6] =  d[9];  d[9] = tmp;
			tmp =  d[3];  d[3] = d[12]; d[12] = tmp;
			tmp =  d[7];  d[7] = d[13]; d[13] = tmp;
			tmp = d[11]; d[11] = d[14]; d[14] = tmp;


			return this;

		},

		invert: function(matrix) {

			matrix = matrix instanceof Composite ? matrix : null;


			let d;

			if (matrix !== null) {
				d = matrix.data;
			} else {
				d = this.data;
			}


			let m00 =  d[0], m01 =  d[1], m02 =  d[2], m03 =  d[3];
			let m10 =  d[4], m11 =  d[5], m12 =  d[6], m13 =  d[7];
			let m20 =  d[8], m21 =  d[9], m22 = d[10], m23 = d[11];
			let m30 = d[12], m31 = d[13], m32 = d[14], m33 = d[15];

			let b00 = m00 * m11 - m01 * m10;
			let b01 = m00 * m12 - m02 * m10;
			let b02 = m00 * m13 - m03 * m10;
			let b03 = m01 * m12 - m02 * m11;
			let b04 = m01 * m13 - m03 * m11;
			let b05 = m02 * m13 - m03 * m12;
			let b06 = m20 * m31 - m21 * m30;
			let b07 = m20 * m32 - m22 * m30;
			let b08 = m20 * m33 - m23 * m30;
			let b09 = m21 * m32 - m22 * m31;
			let b10 = m21 * m33 - m23 * m31;
			let b11 = m22 * m33 - m23 * m32;


			let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
			if (det !== 0) {

				let out = this.data;

				det = 1.0 / det;


				out[0]  = (m11 * b11 - m12 * b10 + m13 * b09) * det;
				out[1]  = (m02 * b10 - m01 * b11 - m03 * b09) * det;
				out[2]  = (m31 * b05 - m32 * b04 + m33 * b03) * det;
				out[3]  = (m22 * b04 - m21 * b05 - m23 * b03) * det;
				out[4]  = (m12 * b08 - m10 * b11 - m13 * b07) * det;
				out[5]  = (m00 * b11 - m02 * b08 + m03 * b07) * det;
				out[6]  = (m32 * b02 - m30 * b05 - m33 * b01) * det;
				out[7]  = (m20 * b05 - m22 * b02 + m23 * b01) * det;
				out[8]  = (m10 * b10 - m11 * b08 + m13 * b06) * det;
				out[9]  = (m01 * b08 - m00 * b10 - m03 * b06) * det;
				out[10] = (m30 * b04 - m31 * b02 + m33 * b00) * det;
				out[11] = (m21 * b02 - m20 * b04 - m23 * b00) * det;
				out[12] = (m11 * b07 - m10 * b09 - m12 * b06) * det;
				out[13] = (m00 * b09 - m01 * b07 + m02 * b06) * det;
				out[14] = (m31 * b01 - m30 * b03 - m32 * b00) * det;
				out[15] = (m20 * b03 - m21 * b01 + m22 * b00) * det;

			}


			return this;

		},

		determinant: function() {

			let a00 = this.data[0],  a01 = this.data[1],  a02 = this.data[2],  a03 = this.data[3];
			let a10 = this.data[4],  a11 = this.data[5],  a12 = this.data[6],  a13 = this.data[7];
			let a20 = this.data[8],  a21 = this.data[9],  a22 = this.data[10], a23 = this.data[11];
			let a30 = this.data[12], a31 = this.data[13], a32 = this.data[14], a33 = this.data[15];

			let b00 = a00 * a11 - a01 * a10;
			let b01 = a00 * a12 - a02 * a10;
			let b02 = a00 * a13 - a03 * a10;
			let b03 = a01 * a12 - a02 * a11;
			let b04 = a01 * a13 - a03 * a11;
			let b05 = a02 * a13 - a03 * a12;
			let b06 = a20 * a31 - a21 * a30;
			let b07 = a20 * a32 - a22 * a30;
			let b08 = a20 * a33 - a23 * a30;
			let b09 = a21 * a32 - a22 * a31;
			let b10 = a21 * a33 - a23 * a31;
			let b11 = a22 * a33 - a23 * a32;


			return (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);

		},

		translate: function(vector) {

			vector = vector instanceof _Vector3 ? vector : null;


			if (vector !== null) {

				let x = vector.x;
				let y = vector.y;
				let z = vector.z;
				let d = this.data;


				d[12] =  d[0] * x +  d[4] * y +  d[8] * z + d[12];
				d[13] =  d[1] * x +  d[5] * y +  d[9] * z + d[13];
				d[14] =  d[2] * x +  d[6] * y + d[10] * z + d[14];
				d[15] =  d[3] * x +  d[7] * y + d[11] * z + d[15];

			}


			return this;

		},

		rotateX: function(radian) {

			radian = typeof radian === 'number' ? radian : null;


			if (radian !== null) {

				let d   = this.data;
				let sin = Math.sin(radian);
				let cos = Math.cos(radian);

				let a10 =  d[4];
				let a11 =  d[5];
				let a12 =  d[6];
				let a13 =  d[7];
				let a20 =  d[8];
				let a21 =  d[9];
				let a22 = d[10];
				let a23 = d[11];


				d[4]  = a10 * cos + a20 * sin;
				d[5]  = a11 * cos + a21 * sin;
				d[6]  = a12 * cos + a22 * sin;
				d[7]  = a13 * cos + a23 * sin;
				d[8]  = a20 * cos - a10 * sin;
				d[9]  = a21 * cos - a11 * sin;
				d[10] = a22 * cos - a12 * sin;
				d[11] = a23 * cos - a13 * sin;

			}


			return this;

		},

		rotateY: function(radian) {

			radian = typeof radian === 'number' ? radian : null;


			if (radian !== null) {

				let d   = this.data;
				let sin = Math.sin(radian);
				let cos = Math.cos(radian);

				let a00 =  d[0];
				let a01 =  d[1];
				let a02 =  d[2];
				let a03 =  d[3];
				let a20 =  d[8];
				let a21 =  d[9];
				let a22 = d[10];
				let a23 = d[11];


				d[0]  = a00 * cos - a20 * sin;
				d[1]  = a01 * cos - a21 * sin;
				d[2]  = a02 * cos - a22 * sin;
				d[3]  = a03 * cos - a23 * sin;
				d[8]  = a00 * sin + a20 * cos;
				d[9]  = a01 * sin + a21 * cos;
				d[10] = a02 * sin + a22 * cos;
				d[11] = a03 * sin + a23 * cos;

			}


			return this;

		},

		rotateZ: function(radian) {

			radian = typeof radian === 'number' ? radian : null;


			if (radian !== null) {

				let d   = this.data;
				let sin = Math.sin(radian);
				let cos = Math.cos(radian);

				let a00 = d[0];
				let a01 = d[1];
				let a02 = d[2];
				let a03 = d[3];
				let a10 = d[4];
				let a11 = d[5];
				let a12 = d[6];
				let a13 = d[7];


				d[0] = a00 * cos + a10 * sin;
				d[1] = a01 * cos + a11 * sin;
				d[2] = a02 * cos + a12 * sin;
				d[3] = a03 * cos + a13 * sin;
				d[4] = a10 * cos - a00 * sin;
				d[5] = a11 * cos - a01 * sin;
				d[6] = a12 * cos - a02 * sin;
				d[7] = a13 * cos - a03 * sin;

			}


			return this;

		},

		rotateAxis: function(vector, radian) {

			vector = vector instanceof _Vector3 ? vector : null;
			radian = typeof radian === 'number' ? radian : null;


			if (vector !== null && radian !== null) {

				let x = vector.x;
				let y = vector.y;
				let z = vector.z;

				if (x === 1 && y === 0 && z === 0) {

					this.rotateX(radian);

					return this;

				} else if (x === 0 && y === 1 && z === 0) {

					this.rotateY(radian);

					return this;

				} else if (x === 0 && y === 0 && z === 1) {

					this.rotateZ(radian);

					return this;

				}


				let length = Math.sqrt(x * x + y * y + z * z);
				if (Math.abs(length) < Composite.PRECISION) {
					return this;
				}


				let sin = Math.sin(radian);
				let cos = Math.cos(radian);
				let t   = 1 - cos;


				x *= (1 / length);
				y *= (1 / length);
				z *= (1 / length);


				let d = this.data;

				let a00 = d[0], a01 = d[1], a02 =  d[2], a03 =  d[3];
				let a10 = d[4], a11 = d[5], a12 =  d[6], a13 =  d[7];
				let a20 = d[8], a21 = d[9], a22 = d[10], a23 = d[11];


				// Rotation Matrix
				let r00 = x * x * t + cos;
				let r01 = y * x * t + z * sin;
				let r02 = z * x * t - y * sin;

				let r10 = x * y * t - z * sin;
				let r11 = y * y * t + cos;
				let r12 = z * y * t + x * sin;

				let r20 = x * z * t + y * sin;
				let r21 = y * z * t - x * sin;
				let r22 = z * z * t + cos;


				d[0]  = a00 * r00 + a10 * r01 + a20 * r02;
				d[1]  = a01 * r00 + a11 * r01 + a21 * r02;
				d[2]  = a02 * r00 + a12 * r01 + a22 * r02;
				d[3]  = a03 * r00 + a13 * r01 + a23 * r02;
				d[4]  = a00 * r10 + a10 * r11 + a20 * r12;
				d[5]  = a01 * r10 + a11 * r11 + a21 * r12;
				d[6]  = a02 * r10 + a12 * r11 + a22 * r12;
				d[7]  = a03 * r10 + a13 * r11 + a23 * r12;
				d[8]  = a00 * r20 + a10 * r21 + a20 * r22;
				d[9]  = a01 * r20 + a11 * r21 + a21 * r22;
				d[10] = a02 * r20 + a12 * r21 + a22 * r22;
				d[11] = a03 * r20 + a13 * r21 + a23 * r22;

			}


			return this;

		},

		scale: function(vector) {

			vector = vector instanceof _Vector3 ? vector : null;


			if (vector !== null) {

				let d = this.data;
				let x = vector.x;
				let y = vector.y;
				let z = vector.z;


				d[0] *= x; d[4] *= y;  d[8] *= z;
				d[1] *= x; d[5] *= y;  d[9] *= z;
				d[2] *= x; d[6] *= y; d[10] *= z;
				d[3] *= x; d[7] *= y; d[11] *= z;

			}


			return this;

		},

		frustum: function(left, right, bottom, top, near, far) {

			left   = typeof left === 'number'   ? left   : null;
			right  = typeof right === 'number'  ? right  : null;
			bottom = typeof bottom === 'number' ? bottom : null;
			top    = typeof top === 'number'    ? top    : null;
			near   = typeof near === 'number'   ? near   : null;
			far    = typeof far === 'number'    ? far    : null;


			if (
				left !== null
				&& right !== null
				&& bottom !== null
				&& top !== null
				&& near !== null
				&& far !== null
			) {

				let d  = this.data;
				let rl = 1 / (right - left);
				let tb = 1 / (top - bottom);
				let nf = 1 / (near - far);


				d[0]  = (near * 2) * rl;
				d[1]  = 0;
				d[2]  = 0;
				d[3]  = 0;
				d[4]  = 0;
				d[5]  = (near * 2) * tb;
				d[6]  = 0;
				d[7]  = 0;
				d[8]  = (right + left) * rl;
				d[9]  = (top + bottom) * tb;
				d[10] = (far + near) * nf;
				d[11] = -1;
				d[12] = 0;
				d[13] = 0;
				d[14] = (far * near * 2) * nf;
				d[15] = 0;

			}


			return this;

		},

		perspective: function(fovy, aspect, near, far) {

			fovy   = typeof fovy === 'number'   ? fovy   : null;
			aspect = typeof aspect === 'number' ? aspect : null;
			near   = typeof near === 'number'   ? near   : null;
			far    = typeof far === 'number'    ? far    : null;


			if (
				fovy !== null
				&& aspect !== null
				&& near !== null
				&& far !== null
			) {

				let d  = this.data;
				let f  = 1.0 / Math.tan(fovy / 2);
				let nf = 1 / (near - far);


				d[0]  = f / aspect;
				d[1]  = 0;
				d[2]  = 0;
				d[3]  = 0;
				d[4]  = 0;
				d[5]  = f;
				d[6]  = 0;
				d[7]  = 0;
				d[8]  = 0;
				d[9]  = 0;
				d[10] = (far + near) * nf;
				d[11] = -1;
				d[12] = 0;
				d[13] = 0;
				d[14] = (2 * far * near) * nf;
				d[15] = 0;

			}


			return this;

		},

		ortho: function(left, right, bottom, top, near, far) {

			left   = typeof left === 'number'   ? left   : null;
			right  = typeof right === 'number'  ? right  : null;
			bottom = typeof bottom === 'number' ? bottom : null;
			top    = typeof top === 'number'    ? top    : null;
			near   = typeof near === 'number'   ? near   : null;
			far    = typeof far === 'number'    ? far    : null;


			if (
				left !== null
				&& right !== null
				&& bottom !== null
				&& top !== null
				&& near !== null
				&& far !== null
			) {

				let d  = this.data;
				let lr = 1 / (left - right);
				let bt = 1 / (bottom - top);
				let nf = 1 / (near - far);


				d[0]  = -2 * lr;
				d[1]  = 0;
				d[2]  = 0;
				d[3]  = 0;
				d[4]  = 0;
				d[5]  = -2 * bt;
				d[6]  = 0;
				d[7]  = 0;
				d[8]  = 0;
				d[9]  = 0;
				d[10] = 2 * nf;
				d[11] = 0;
				d[12] = (left + right) * lr;
				d[13] = (top + bottom) * bt;
				d[14] = (far + near) * nf;
				d[15] = 1;

			}


			return this;

		},

		lookAt: function(eye, center, up) {

			eye    = eye instanceof _Vector3    ? eye    : null;
			center = center instanceof _Vector3 ? center : null;
			up     = up instanceof _Vector3     ? up     : null;


			if (eye !== null && center !== null && up !== null) {

				let len;


				let z0 = eye.x - center.x;
				let z1 = eye.y - center.y;
				let z2 = eye.z - center.z;

				if (Math.abs(z0) < Composite.PRECISION && Math.abs(z1) < Composite.PRECISION && Math.abs(z2) < Composite.PRECISION) {
					return this;
				}


				len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
				z0 *= len;
				z1 *= len;
				z2 *= len;


				let x0 = up.y * z2 - up.z * z1;
				let x1 = up.z * z0 - up.x * z2;
				let x2 = up.x * z1 - up.y * z0;

				len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
				if (len === 0) {

					x0 = 0;
					x1 = 0;
					x2 = 0;

				} else {

					len = 1 / len;
					x0 *= len;
					x1 *= len;
					x2 *= len;

				}


				let y0 = z1 * x2 - z2 * x1;
				let y1 = z2 * x0 - z0 * x2;
				let y2 = z0 * x1 - z1 * x0;

				len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
				if (len === 0) {

					y0 = 0;
					y1 = 0;
					y2 = 0;

				} else {

					len = 1 / len;
					y0 *= len;
					y1 *= len;
					y2 *= len;

				}


				let d = this.data;

				d[0]  = x0;
				d[1]  = y0;
				d[2]  = z0;
				d[3]  = 0;
				d[4]  = x1;
				d[5]  = y1;
				d[6]  = z1;
				d[7]  = 0;
				d[8]  = x2;
				d[9]  = y2;
				d[10] = z2;
				d[11] = 0;
				d[12] = -(x0 * eye.x + x1 * eye.y + x2 * eye.z);
				d[13] = -(y0 * eye.x + y1 * eye.y + y2 * eye.z);
				d[14] = -(z0 * eye.x + z1 * eye.y + z2 * eye.z);
				d[15] = 1;

			}


			return this;

		},

		setData: function(data) {

			data = data instanceof Array ? data : null;


			if (data !== null) {

				this.set.call(this, data);

				return true;

			}


			return false;

		}

	};


	return Composite;

});

