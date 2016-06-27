
lychee.define('lychee.crypto.SHA1').exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _read_int32BE = function(buffer, offset) {
		return (buffer[offset] << 24) | (buffer[offset + 1] << 16) | (buffer[offset + 2] << 8) | (buffer[offset + 3]);
	};

	var _write_int32BE = function(buffer, value, offset) {

		value  = +value;
		offset = offset | 0;


		if (value < 0) {
			value = 0xffffffff + value + 1;
		}

		for (var b = 0, bl = Math.min(buffer.length - offset, 4); b < bl; b++) {
			buffer[offset + b] = (value >>> (3 - b) * 8) & 0xff;
		}


		return offset + 4;

	};

	var _write_zero = function(buffer, start, end) {

		start = typeof start === 'number' ? (start | 0) : 0;
		end   = typeof end === 'number'   ? (end   | 0) : buffer.length;


		if (start === end) return;


		end = Math.min(end, buffer.length);


		var diff = end - start;
		for (var b = 0; b < diff; b++) {
			buffer[b + start] = 0;
		}

	};

	var _calculate_w = function(w, i) {
		return _rotate(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
	};

	var _rotate = function(number, count) {
		return (number << count) | (number >>> (32 - count));
	};

	var _update_chunk = function(buffer) {

		var a = this.__a;
		var b = this.__b;
		var c = this.__c;
		var d = this.__d;
		var e = this.__e;
		var w = this.__w;


		var j = 0;
		var tmp1, tmp2;

		while (j < 16) {

			tmp1 = _read_int32BE(buffer, j * 4);
			tmp2 = _rotate(a, 5) + ((b & c) | ((~b) & d)) + e + tmp1 + 1518500249;
			w[j] = tmp1;

			e = d;
			d = c;
			c = _rotate(b, 30);
			b = a;
			a = tmp2;
			j++;

		}

		while (j < 20) {

			tmp1 = _calculate_w(w, j);
			tmp2 = _rotate(a, 5) + ((b & c) | ((~b) & d)) + e + tmp1 + 1518500249;
			w[j] = tmp1;

			e = d;
			d = c;
			c = _rotate(b, 30);
			b = a;
			a = tmp2;
			j++;

		}

		while (j < 40) {

			tmp1 = _calculate_w(w, j);
			tmp2 = _rotate(a, 5) + (b ^ c ^ d) + e + tmp1 + 1859775393;
			w[j] = tmp1;

			e = d;
			d = c;
			c = _rotate(b, 30);
			b = a;
			a = tmp2;
			j++;

		}

		while (j < 60) {

			tmp1 = _calculate_w(w, j);
			tmp2 = _rotate(a, 5) + ((b & c) | (b & d) | (c & d)) + e + tmp1 - 1894007588;
			w[j] = tmp1;

			e = d;
			d = c;
			c = _rotate(b, 30);
			b = a;
			a = tmp2;
			j++;

		}

		while (j < 80) {

			tmp1 = _calculate_w(w, j);
			tmp2 = _rotate(a, 5) + (b ^ c ^ d) + e + tmp1 - 899497514;
			w[j] = tmp1;

			e = d;
			d = c;
			c = _rotate(b, 30);
			b = a;
			a = tmp2;
			j++;

		}


		this.__a = (a + this.__a) | 0;
		this.__b = (b + this.__b) | 0;
		this.__c = (c + this.__c) | 0;
		this.__d = (d + this.__d) | 0;
		this.__e = (e + this.__e) | 0;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function() {

		this.__a = 0x67452301 | 0;
		this.__b = 0xefcdab89 | 0;
		this.__c = 0x98badcfe | 0;
		this.__d = 0x10325476 | 0;
		this.__e = 0xc3d2e1f0 | 0;
		this.__w = new Array(80);

		this.__buffer  = new Buffer(64);
		this.__length  = 0;
		this.__pointer = 0;

	};


	Class.prototype = {

		update: function(data) {

			data = data instanceof Buffer ? data : new Buffer(data, 'utf8');


			var buffer  = this.__buffer;
			var length  = this.__length + data.length;
			var pointer = this.__pointer;


			var p = 0;

			while (pointer < length) {

				var size = (Math.min(data.length, p + 64 - (pointer % 64)) - p);

				for (var s = 0; s < size; s++) {
					buffer[(pointer % 64) + s] = data[s + p];
				}

				pointer += size;
				p       += size;

				if (pointer % 64 === 0) {
					_update_chunk.call(this, buffer);
				}

			}


			this.__length  = length;
			this.__pointer = p;

		},

		digest: function() {

			var buffer = this.__buffer;
			var length = this.__length;


			buffer[length % 64] = 0x80;
			// _write_zero(buffer, length % 64 + 1);
			buffer.fill(0, length % 64 + 1);

			if ((length * 8) % (64 * 8) >= (56 * 8)) {
				_update_chunk.call(this, buffer);
				// _write_zero(buffer);
				buffer.fill(0);
			}


			_write_int32BE(buffer, length * 8, 64 - 4);
			_update_chunk.call(this, buffer);


			var hash = new Buffer(20);

			_write_int32BE(hash, this.__a | 0,  0);
			_write_int32BE(hash, this.__b | 0,  4);
			_write_int32BE(hash, this.__c | 0,  8);
			_write_int32BE(hash, this.__d | 0, 12);
			_write_int32BE(hash, this.__e | 0, 16);

			return hash;

		}

	};


	return Class;

});

