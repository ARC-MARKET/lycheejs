
lychee.define('lychee.crypto.BLAKE2B').exports((lychee, global, attachments) => {

	const _BLAKE2B_IV32 = new Uint32Array([
		0xF3BCC908, 0x6A09E667, 0x84CAA73B, 0xBB67AE85,
		0xFE94F82B, 0x3C6EF372, 0x5F1D36F1, 0xA54FF53A,
		0xADE682D1, 0x510E527F, 0x2B3E6C1F, 0x9B05688C,
		0xFB41BD6B, 0x1F83D9AB, 0x137E2179, 0x5BE0CD19
	]);

	const _SIGMA82 = new Uint8Array([
		0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30,
		28, 20, 8, 16, 18, 30, 26, 12, 2, 24, 0, 4, 22, 14, 10, 6,
		22, 16, 24, 0, 10, 4, 30, 26, 20, 28, 6, 12, 14, 2, 18, 8,
		14, 18, 6, 2, 26, 24, 22, 28, 4, 12, 10, 20, 8, 0, 30, 16,
		18, 0, 10, 14, 4, 8, 20, 30, 28, 2, 22, 24, 12, 16, 6, 26,
		4, 24, 12, 20, 0, 22, 16, 6, 8, 26, 14, 10, 30, 28, 2, 18,
		24, 10, 2, 30, 28, 26, 8, 20, 0, 14, 12, 6, 18, 4, 16, 22,
		26, 22, 14, 28, 24, 2, 6, 18, 10, 0, 30, 8, 16, 12, 4, 20,
		12, 30, 28, 18, 22, 6, 0, 16, 24, 4, 26, 14, 2, 8, 20, 10,
		20, 4, 16, 8, 14, 12, 2, 10, 30, 22, 18, 28, 6, 24, 26, 0,
		0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30,
		28, 20, 8, 16, 18, 30, 26, 12, 2, 24, 0, 4, 22, 14, 10, 6

	]);



	/*
	 * HELPERS
	 */

	const _add_64_aa = function(v, a, b) {

		let o0 = v[a]     + v[b];
		let o1 = v[a + 1] + v[b + 1];
		if (o0 >= 0x100000000) {
			o1++;
		}

		v[a]     = o0;
		v[a + 1] = o1;

	};

	const _add_64_ac = function(v, a, b0, b1) {

		let o0 = v[a] + b0;
		if (b0 < 0) {
			o0 += 0x100000000;
		}

		let o1 = v[a + 1] + b1;
		if (o0 >= 0x100000000) {
			o1++;
		}

		v[a]     = o0;
		v[a + 1] = o1;

	};

	const _read_int32LE = function(arr, a) {
		return (arr[a] ^ (arr[a + 1] << 8) ^ (arr[a + 2] << 16) ^ (arr[a + 3] << 24));
	};

	const _rotate = function(m, v, a, b, c, d, ix, iy) {

		let x0 = m[ix];
		let x1 = m[ix + 1];
		let y0 = m[iy];
		let y1 = m[iy + 1];

		_add_64_aa(v, a, b);
		_add_64_ac(v, a, x0, x1);

		let xor0 = v[d] ^ v[a];
		let xor1 = v[d + 1] ^ v[a + 1];

		v[d]     = xor1;
		v[d + 1] = xor0;

		_add_64_aa(v, c, d);

		xor0 = v[b]     ^ v[c];
		xor1 = v[b + 1] ^ v[c + 1];
		v[b]     = (xor0 >>> 24) ^ (xor1 << 8);
		v[b + 1] = (xor1 >>> 24) ^ (xor0 << 8);

		_add_64_aa(v, a, b);
		_add_64_ac(v, a, y0, y1);

		xor0 = v[d]     ^ v[a];
		xor1 = v[d + 1] ^ v[a + 1];
		v[d]     = (xor0 >>> 16) ^ (xor1 << 16);
		v[d + 1] = (xor1 >>> 16) ^ (xor0 << 16);

		_add_64_aa(v, c, d);

		xor0 = v[b]     ^ v[c];
		xor1 = v[b + 1] ^ v[c + 1];
		v[b]     = (xor1 >>> 31) ^ (xor0 << 1);
		v[b + 1] = (xor0 >>> 31) ^ (xor1 << 1);

	};

	const _compress = function(last) {

		last = last === true;


		let m = this.__m;
		let v = this.__v;

		let hash = this.__hash;
		for (let i = 0; i < 16; i++) {
			v[i]      = hash[i];
			v[i + 16] = _BLAKE2B_IV32[i];
		}


		let t = this.__t;

		v[24] = v[24] ^ t;
		v[25] = v[25] ^ (t / 0x100000000);

		if (last === true) {
			v[28] = ~v[28];
			v[29] = ~v[29];
		}


		let buffer = this.__buffer;
		for (let i = 0; i < 32; i++) {
			m[i] = _read_int32LE(buffer, 4 * i);
		}


		for (let i = 0; i < 12; i++) {
			_rotate(m, v, 0,  8, 16, 24, _SIGMA82[i * 16 +  0], _SIGMA82[i * 16 +  1]);
			_rotate(m, v, 2, 10, 18, 26, _SIGMA82[i * 16 +  2], _SIGMA82[i * 16 +  3]);
			_rotate(m, v, 4, 12, 20, 28, _SIGMA82[i * 16 +  4], _SIGMA82[i * 16 +  5]);
			_rotate(m, v, 6, 14, 22, 30, _SIGMA82[i * 16 +  6], _SIGMA82[i * 16 +  7]);
			_rotate(m, v, 0, 10, 20, 30, _SIGMA82[i * 16 +  8], _SIGMA82[i * 16 +  9]);
			_rotate(m, v, 2, 12, 22, 24, _SIGMA82[i * 16 + 10], _SIGMA82[i * 16 + 11]);
			_rotate(m, v, 4, 14, 16, 26, _SIGMA82[i * 16 + 12], _SIGMA82[i * 16 + 13]);
			_rotate(m, v, 6,  8, 18, 28, _SIGMA82[i * 16 + 14], _SIGMA82[i * 16 + 15]);
		}

		for (let i = 0; i < 16; i++) {
			hash[i] = hash[i] ^ v[i] ^ v[i + 16];
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function() {

		this.__buffer = new Uint8Array(128);
		this.__hash   = new Uint32Array(16);
		this.__c      = 0;
		this.__m      = new Uint32Array(32);
		this.__t      = 0;
		this.__v      = new Uint32Array(32);

		for (let i = 0; i < 16; i++) {
			this.__hash[i] = _BLAKE2B_IV32[i];
		}

		this.__hash[0] ^= 0x01010000 ^ 0 ^ 64;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'lychee.crypto.BLAKE2B',
				'arguments':   []
			};

		},



		/*
		 * CRYPTO API
		 */

		update: function(data) {

			data = data instanceof Buffer ? data : Buffer.from(data, 'utf8');


			let input  = new Uint8Array(data);
			let buffer = this.__buffer;

			for (let d = 0; d < input.length; d++) {

				if (this.__c === 128) {
					this.__t += this.__c;
					_compress.call(this, false);
					this.__c = 0;
				}

				buffer[this.__c++] = input[d];

			}

		},

		digest: function() {

			this.__t += this.__c;


			while (this.__c < 128) {
				this.__buffer[this.__c++] = 0;
			}

			_compress.call(this, true);


			let out = new Uint8Array(64);
			for (let i = 0; i < 64; i++) {
				out[i] = this.__hash[i >> 2] >> (8 * (i & 3));
			}


			let hash = '';

			for (let i = 0; i < 64; i++) {

				let val = out[i];
				if (val < 16) {
					hash += '0';
				}

				hash += (val).toString(16);

			}

			return Buffer.from(hash, 'hex');

		}

	};


	return Composite;

});

