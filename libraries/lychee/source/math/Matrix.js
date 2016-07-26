
lychee.define('lychee.math.Matrix').exports(function(lychee, global, attachments) {

	var _Array = typeof Float32Array !== 'undefined' ? Float32Array : Array;



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		this.data = new _Array(16);


		if (data instanceof Array) {

			this.set.call(this, data);

		} else {

			this.set.call(this, Composite.IDENTITY);

		}

	};


	Composite.IDENTITY = new _Array([
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

			var data = this.data.slice(0);


			return {
				'constructor': 'lychee.math.Matrix',
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

		copy: function(matrix) {

			var d = this.data;


			matrix.set(
			    d[0],  d[1],  d[2],  d[3],
			    d[4],  d[5],  d[6],  d[7],
			    d[8],  d[9],  d[10], d[11],
				d[12], d[13], d[14], d[15]
			);


			return this;

		},

		set: function(a0, a1, a2, a3, b0, b1, b2, b3, c0, c1, c2, c3, d0, d1, d2, d3) {

			var d = this.data;


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

			var tmp;
			var d = this.data;


			tmp =  d[1];  d[1] =  d[4];  d[4] = tmp;
			tmp =  d[2];  d[2] =  d[8];  d[8] = tmp;
			tmp =  d[6];  d[6] =  d[9];  d[9] = tmp;
			tmp =  d[3];  d[3] = d[12]; d[12] = tmp;
			tmp =  d[7];  d[7] = d[13]; d[13] = tmp;
			tmp = d[11]; d[11] = d[14]; d[14] = tmp;


			return this;

		},

		invert: function(matrix) {

			var d;

			// Invert this matrix
			if (matrix === undefined) {
				d = this.data;

			// Invert other matrix, but target is this matrix
			} else {
				d = matrix.data;
			}


			var m00 =  d[0], m01 =  d[1], m02 =  d[2], m03 =  d[3];
			var m10 =  d[4], m11 =  d[5], m12 =  d[6], m13 =  d[7];
			var m20 =  d[8], m21 =  d[9], m22 = d[10], m23 = d[11];
			var m30 = d[12], m31 = d[13], m32 = d[14], m33 = d[15];

			var b00 = m00 * m11 - m01 * m10;
			var b01 = m00 * m12 - m02 * m10;
			var b02 = m00 * m13 - m03 * m10;
			var b03 = m01 * m12 - m02 * m11;
			var b04 = m01 * m13 - m03 * m11;
			var b05 = m02 * m13 - m03 * m12;
			var b06 = m20 * m31 - m21 * m30;
			var b07 = m20 * m32 - m22 * m30;
			var b08 = m20 * m33 - m23 * m30;
			var b09 = m21 * m32 - m22 * m31;
			var b10 = m21 * m33 - m23 * m31;
			var b11 = m22 * m33 - m23 * m32;


			var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
			if (det !== 0) {

				var out = this.data;

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

			var a00 = this.data[0],  a01 = this.data[1],  a02 = this.data[2],  a03 = this.data[3];
			var a10 = this.data[4],  a11 = this.data[5],  a12 = this.data[6],  a13 = this.data[7];
			var a20 = this.data[8],  a21 = this.data[9],  a22 = this.data[10], a23 = this.data[11];
			var a30 = this.data[12], a31 = this.data[13], a32 = this.data[14], a33 = this.data[15];

			var b00 = a00 * a11 - a01 * a10;
			var b01 = a00 * a12 - a02 * a10;
			var b02 = a00 * a13 - a03 * a10;
			var b03 = a01 * a12 - a02 * a11;
			var b04 = a01 * a13 - a03 * a11;
			var b05 = a02 * a13 - a03 * a12;
			var b06 = a20 * a31 - a21 * a30;
			var b07 = a20 * a32 - a22 * a30;
			var b08 = a20 * a33 - a23 * a30;
			var b09 = a21 * a32 - a22 * a31;
			var b10 = a21 * a33 - a23 * a31;
			var b11 = a22 * a33 - a23 * a32;


			return (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);

		},

		translate: function(vector) {

			var x = vector.x;
			var y = vector.y;
			var z = vector.z;
			var d = this.data;


			d[12] =  d[0] * x +  d[4] * y +  d[8] * z + d[12];
			d[13] =  d[1] * x +  d[5] * y +  d[9] * z + d[13];
			d[14] =  d[2] * x +  d[6] * y + d[10] * z + d[14];
			d[15] =  d[3] * x +  d[7] * y + d[11] * z + d[15];


			return this;

		},

		rotateX: function(radian) {

			var d   = this.data;
			var sin = Math.sin(radian);
			var cos = Math.cos(radian);

			var a10 =  d[4];
			var a11 =  d[5];
			var a12 =  d[6];
			var a13 =  d[7];
			var a20 =  d[8];
			var a21 =  d[9];
			var a22 = d[10];
			var a23 = d[11];


			 d[4] = a10 * cos + a20 * sin;
			 d[5] = a11 * cos + a21 * sin;
			 d[6] = a12 * cos + a22 * sin;
			 d[7] = a13 * cos + a23 * sin;
			 d[8] = a20 * cos - a10 * sin;
			 d[9] = a21 * cos - a11 * sin;
			d[10] = a22 * cos - a12 * sin;
			d[11] = a23 * cos - a13 * sin;


			return this;

		},

		rotateY: function(radian) {

			var d   = this.data;
			var sin = Math.sin(radian);
			var cos = Math.cos(radian);

			var a00 =  d[0];
			var a01 =  d[1];
			var a02 =  d[2];
			var a03 =  d[3];
			var a20 =  d[8];
			var a21 =  d[9];
			var a22 = d[10];
			var a23 = d[11];


			 d[0] = a00 * cos - a20 * sin;
			 d[1] = a01 * cos - a21 * sin;
			 d[2] = a02 * cos - a22 * sin;
			 d[3] = a03 * cos - a23 * sin;
			 d[8] = a00 * sin + a20 * cos;
			 d[9] = a01 * sin + a21 * cos;
			d[10] = a02 * sin + a22 * cos;
			d[11] = a03 * sin + a23 * cos;


			return this;

		},

		rotateZ: function(radian) {

			var d   = this.data;
			var sin = Math.sin(radian);
			var cos = Math.cos(radian);

			var a00 = d[0];
			var a01 = d[1];
			var a02 = d[2];
			var a03 = d[3];
			var a10 = d[4];
			var a11 = d[5];
			var a12 = d[6];
			var a13 = d[7];


			d[0] = a00 * cos + a10 * sin;
			d[1] = a01 * cos + a11 * sin;
			d[2] = a02 * cos + a12 * sin;
			d[3] = a03 * cos + a13 * sin;
			d[4] = a10 * cos - a00 * sin;
			d[5] = a11 * cos - a01 * sin;
			d[6] = a12 * cos - a02 * sin;
			d[7] = a13 * cos - a03 * sin;


			return this;

		},

		rotateAxis: function(vector, radian) {

			var x = vector.x;
			var y = vector.y;
			var z = vector.z;

			if (x === 1 && y === 0 && z === 0) {

				return this.rotateX(radian);

			} else if (x === 0 && y === 1 && z === 0) {

				return this.rotateY(radian);

			} else if (x === 0 && y === 0 && z === 1) {

				return this.rotateZ(radian);
			}


			var length = Math.sqrt(x * x + y * y + z * z);
			if (Math.abs(length) < Composite.PRECISION) {
				return;
			}


			var sin = Math.sin(radian);
			var cos = Math.cos(radian);
			var t   = 1 - cos;


			x *= (1 / length);
			y *= (1 / length);
			z *= (1 / length);


			var d = this.data;

			var a00 = d[0], a01 = d[1], a02 =  d[2], a03 =  d[3];
			var a10 = d[4], a11 = d[5], a12 =  d[6], a13 =  d[7];
			var a20 = d[8], a21 = d[9], a22 = d[10], a23 = d[11];


			// Rotation Matrix
			var r00 = x * x * t + c;
			var r01 = y * x * t + z * s;
			var r02 = z * x * t - y * s;

			var r10 = x * y * t - z * s;
			var r11 = y * y * t + c;
			var r12 = z * y * t + x * s;

			var r20 = x * z * t + y * s;
			var r21 = y * z * t - x * s;
			var r22 = z * z * t + c;


			 d[0] = a00 * r00 + a10 * r01 + a20 * r02;
			 d[1] = a01 * r00 + a11 * r01 + a21 * r02;
			 d[2] = a02 * r00 + a12 * r01 + a22 * r02;
			 d[3] = a03 * r00 + a13 * r01 + a23 * r02;
			 d[4] = a00 * r10 + a10 * r11 + a20 * r12;
			 d[5] = a01 * r10 + a11 * r11 + a21 * r12;
			 d[6] = a02 * r10 + a12 * r11 + a22 * r12;
			 d[7] = a03 * r10 + a13 * r11 + a23 * r12;
			 d[8] = a00 * r20 + a10 * r21 + a20 * r22;
			 d[9] = a01 * r20 + a11 * r21 + a21 * r22;
			d[10] = a02 * r20 + a12 * r21 + a22 * r22;
			d[11] = a03 * r20 + a13 * r21 + a23 * r22;


			return this;

		},

		scale: function(vector) {

			var d = this.data;
			var x = vector.x;
			var y = vector.y;
			var z = vector.z;


			d[0] *= x; d[4] *= y;  d[8] *= z;
			d[1] *= x; d[5] *= y;  d[9] *= z;
			d[2] *= x; d[6] *= y; d[10] *= z;
			d[3] *= x; d[7] *= y; d[11] *= z;


			return this;

		},

		frustum: function(left, right, bottom, top, near, far) {

			var d  = this.data;
			var rl = 1 / (right - left);
			var tb = 1 / (top - bottom);
			var nf = 1 / (near - far);


			 d[0] = (near * 2) * rl;
			 d[1] = 0;
			 d[2] = 0;
			 d[3] = 0;
			 d[4] = 0;
			 d[5] = (near * 2) * tb;
			 d[6] = 0;
			 d[7] = 0;
			 d[8] = (right + left) * rl;
			 d[9] = (top + bottom) * tb;
			d[10] = (far + near) * nf;
			d[11] = -1;
			d[12] = 0;
			d[13] = 0;
			d[14] = (far * near * 2) * nf;
			d[15] = 0;


			return this;

		},

		perspective: function(fovy, aspect, near, far) {

			var d  = this.data;
			var f  = 1.0 / Math.tan(fovy / 2);
			var nf = 1 / (near - far);


			 d[0] = f / aspect;
			 d[1] = 0;
			 d[2] = 0;
			 d[3] = 0;
			 d[4] = 0;
			 d[5] = f;
			 d[6] = 0;
			 d[7] = 0;
			 d[8] = 0;
			 d[9] = 0;
			d[10] = (far + near) * nf;
			d[11] = -1;
			d[12] = 0;
			d[13] = 0;
			d[14] = (2 * far * near) * nf;
			d[15] = 0;


			return this;

		},

		ortho: function(left, right, bottom, top, near, far) {

			var d  = this.data;
			var lr = 1 / (left - right);
			var bt = 1 / (bottom - top);
			var nf = 1 / (near - far);


			 d[0] = -2 * lr;
			 d[1] = 0;
			 d[2] = 0;
			 d[3] = 0;
			 d[4] = 0;
			 d[5] = -2 * bt;
			 d[6] = 0;
			 d[7] = 0;
			 d[8] = 0;
			 d[9] = 0;
			d[10] = 2 * nf;
			d[11] = 0;
			d[12] = (left + right) * lr;
			d[13] = (top + bottom) * bt;
			d[14] = (far + near) * nf;
			d[15] = 1;


			return this;

		},

		lookAt: function(eyex, eyey, eyez, centerx, centery, centerz, upx, upy, upz) {

			var len;


			var z0 = eyex - centerx;
			var z1 = eyey - centery;
			var z2 = eyez - centerz;

			if (Math.abs(z0) < Composite.PRECISION && Math.abs(z1) < Composite.PRECISION && Math.abs(z2) < Composite.PRECISION) {
				return;
			}


			len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
			z0 *= len;
			z1 *= len;
			z2 *= len;


			var x0 = upy * z2 - upz * z1;
			var x1 = upz * z0 - upx * z2;
			var x2 = upx * z1 - upy * z0;

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


			var y0 = z1 * x2 - z2 * x1;
			var y1 = z2 * x0 - z0 * x2;
			var y2 = z0 * x1 - z1 * x0;

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


			var d = this.data;

			 d[0] = x0;
			 d[1] = y0;
			 d[2] = z0;
			 d[3] = 0;
			 d[4] = x1;
			 d[5] = y1;
			 d[6] = z1;
			 d[7] = 0;
			 d[8] = x2;
			 d[9] = y2;
			d[10] = z2;
			d[11] = 0;
			d[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
			d[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
			d[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
			d[15] = 1;


			return this;

		}

	};


	return Composite;

});

