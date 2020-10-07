
lychee.define('lychee.codec.BITON').exports((lychee, global, attachments) => {

	/*
	 * HELPERS
	 */

	const _CHAR_TABLE = new Array(256);
	const _MASK_TABLE = new Array(9);
	const _POW_TABLE  = new Array(9);
	const _RPOW_TABLE = new Array(9);

	(function() {

		for (let c = 0; c < 256; c++) {
			_CHAR_TABLE[c] = String.fromCharCode(c);
		}

		for (let m = 0; m < 9; m++) {
			_POW_TABLE[m]  = Math.pow(2, m) - 1;
			_MASK_TABLE[m] = ~(_POW_TABLE[m] ^ 0xff);
			_RPOW_TABLE[m] = Math.pow(10, m);
		}

	})();


	const _CHARS_ESCAPABLE = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	const _CHARS_META      = {
		'\b': '\\b',
		'\t': '\\t',
		'\n': '\\n',
		'\f': '\\f',
		'\r': '',    // FUCK YOU, Microsoft!
		'"':  '\\"',
		'\\': '\\\\'
	};

	const _format_date = function(n) {
		return n < 10 ? '0' + n : '' + n;
	};

	const _sanitize_string = function(str) {

		let san  = str;
		let keys = Object.keys(_CHARS_META);
		let vals = Object.values(_CHARS_META);

		keys.forEach((key, i) => {
			san = san.replace(key, vals[i]);
		});

		if (_CHARS_ESCAPABLE.test(san)) {
			san = san.replace(_CHARS_ESCAPABLE, chr => '\\u' + (chr.charCodeAt(0).toString(16)).slice(-4));
		}

		return san;

	};

	const _desanitize_string = function(san) {

		let str  = san;
		let keys = Object.keys(_CHARS_META);
		let vals = Object.values(_CHARS_META);

		vals.forEach((val, i) => {

			if (val !== '') {
				str = str.replace(val, keys[i]);
			}

		});

		return str;

	};

	const _resolve_constructor = function(identifier, scope) {

		let pointer = scope;

		let ns = identifier.split('.');
		for (let n = 0, l = ns.length; n < l; n++) {

			let name = ns[n];

			if (pointer[name] !== undefined) {
				pointer = pointer[name];
			} else {
				pointer = null;
				break;
			}

		}


		return pointer;

	};



	/*
	 * STRUCTS
	 */

	const _Stream = function(buffer, mode) {

		this.__buffer    = typeof buffer === 'string' ? buffer : '';
		this.__mode      = typeof mode === 'number'   ? mode   : 0;

		this.__pointer   = 0;
		this.__value     = 0;
		this.__remaining = 8;
		this.__index     = 0;

		if (this.__mode === _Stream.MODE.read) {
			this.__value = this.__buffer.charCodeAt(this.__index);
		}

	};


	_Stream.MODE = {
		read:  0,
		write: 1
	};


	_Stream.prototype = {

		toString: function() {

			if (this.__mode === _Stream.MODE.write) {

				if (this.__value > 0) {
					this.__buffer += _CHAR_TABLE[this.__value];
					this.__value   = 0;
				}


				// 0: Boolean or Null or EOS
				this.write(0, 4);

				// 0: EOS
				this.write(0, 3);

			}

			return this.__buffer;

		},

		pointer: function() {
			return this.__pointer;
		},

		length: function() {
			return this.__buffer.length * 8;
		},

		read: function(bits) {

			let overflow = bits - this.__remaining;
			let captured = this.__remaining < bits ? this.__remaining : bits;
			let shift    = this.__remaining - captured;


			let buffer = (this.__value & _MASK_TABLE[this.__remaining]) >> shift;


			this.__pointer   += captured;
			this.__remaining -= captured;


			if (this.__remaining === 0) {

				this.__value     = this.__buffer.charCodeAt(++this.__index);
				this.__remaining = 8;

				if (overflow > 0) {
					buffer = buffer << overflow | ((this.__value & _MASK_TABLE[this.__remaining]) >> (8 - overflow));
					this.__remaining -= overflow;
				}

			}


			return buffer;

		},

		readRAW: function(bytes) {

			if (this.__remaining !== 8) {

				this.__index++;
				this.__value     = 0;
				this.__remaining = 8;

			}


			let buffer = '';

			if (this.__remaining === 8) {

				buffer       += this.__buffer.substr(this.__index, bytes);
				this.__index += bytes;
				this.__value  = this.__buffer.charCodeAt(this.__index);

			}


			return buffer;

		},

		write: function(buffer, bits) {

			let overflow = bits - this.__remaining;
			let captured = this.__remaining < bits ? this.__remaining : bits;
			let shift    = this.__remaining - captured;


			if (overflow > 0) {
				this.__value += buffer >> overflow << shift;
			} else {
				this.__value += buffer << shift;
			}


			this.__pointer   += captured;
			this.__remaining -= captured;


			if (this.__remaining === 0) {

				this.__buffer    += _CHAR_TABLE[this.__value];
				this.__remaining  = 8;
				this.__value      = 0;

				if (overflow > 0) {
					this.__value     += (buffer & _POW_TABLE[overflow]) << (8 - overflow);
					this.__remaining -= overflow;
				}

			}

		},

		writeRAW: function(buffer) {

			if (this.__remaining !== 8) {

				this.__buffer    += _CHAR_TABLE[this.__value];
				this.__value      = 0;
				this.__remaining  = 8;

			}

			if (this.__remaining === 8) {

				this.__buffer  += buffer;
				this.__pointer += buffer.length * 8;

			}

		}

	};



	/*
	 * ENCODER and DECODER
	 */

	const _encode = function(stream, data) {

		// 0: Boolean, Null (or EOS), Undefined, Infinity, NaN
		if (
			typeof data === 'boolean'
			|| data === null
			|| data === undefined
			|| (
				typeof data === 'number'
				&& (
					data === Infinity
					|| data === -Infinity
					|| isNaN(data) === true
				)
			)
		) {

			stream.write(0, 4);

			if (data === null) {
				stream.write(1, 3);
			} else if (data === undefined) {
				stream.write(2, 3);
			} else if (data === false) {
				stream.write(3, 3);
			} else if (data === true) {
				stream.write(4, 3);
			} else if (data === Infinity) {
				stream.write(5, 3);
			} else if (data === -Infinity) {
				stream.write(6, 3);
			} else if (isNaN(data) === true) {
				stream.write(7, 3);
			}


		// 1: Integer, 2: Float
		} else if (typeof data === 'number') {

			let type = 1;
			if (data < 268435456 && data !== (data | 0)) {
				type = 2;
			}


			stream.write(type, 4);


			// Negative value
			let sign = 0;
			if (data < 0) {
				data = -data;
				sign = 1;
			}


			// Float only: Calculate the integer value and remember the shift
			let shift = 0;

			if (type === 2) {

				let step = 10;
				let m    = data;
				let tmp  = 0;


				// Calculate the exponent and shift
				do {

					m     = data * step;
					step *= 10;
					tmp   = m | 0;
					shift++;

				} while (m - tmp > 1 / step && shift < 8 && m < 214748364);


				step = tmp / 10;

				// Recorrect shift if we are > 0.5
				// and shift is too high
				if (step === (step | 0)) {
					tmp = step;
					shift--;
				}

				data = tmp;

			}



			if (data < 2) {

				stream.write(0, 4);
				stream.write(data, 1);

			} else if (data < 16) {

				stream.write(1, 4);
				stream.write(data, 4);

			} else if (data < 256) {

				stream.write(2, 4);
				stream.write(data, 8);

			} else if (data < 4096) {

				stream.write(3, 4);
				stream.write(data >>  8 & 0xff, 4);
				stream.write(data       & 0xff, 8);

			} else if (data < 65536) {

				stream.write(4, 4);
				stream.write(data >>  8 & 0xff, 8);
				stream.write(data       & 0xff, 8);

			} else if (data < 1048576) {

				stream.write(5, 4);
				stream.write(data >> 16 & 0xff, 4);
				stream.write(data >>  8 & 0xff, 8);
				stream.write(data       & 0xff, 8);

			} else if (data < 16777216) {

				stream.write(6, 4);
				stream.write(data >> 16 & 0xff, 8);
				stream.write(data >>  8 & 0xff, 8);
				stream.write(data       & 0xff, 8);

			} else if (data < 268435456) {

				stream.write(7, 4);
				stream.write(data >> 24 & 0xff, 8);
				stream.write(data >> 16 & 0xff, 8);
				stream.write(data >>  8 & 0xff, 8);
				stream.write(data       & 0xff, 8);

			} else {

				stream.write(8, 4);

				_encode(stream, data.toString());

			}


			stream.write(sign, 1);


			// Float only: Remember the shift for precision
			if (type === 2) {
				stream.write(shift, 4);
			}


		// 3: String
		} else if (typeof data === 'string') {

			data = _sanitize_string(data);


			stream.write(3, 4);


			let l = data.length;

			// Write Size Field
			if (l > 65535) {

				stream.write(31, 5);

				stream.write(l >> 24 & 0xff, 8);
				stream.write(l >> 16 & 0xff, 8);
				stream.write(l >>  8 & 0xff, 8);
				stream.write(l       & 0xff, 8);

			} else if (l > 255) {

				stream.write(30, 5);

				stream.write(l >>  8 & 0xff, 8);
				stream.write(l       & 0xff, 8);

			} else if (l > 28) {

				stream.write(29, 5);

				stream.write(l, 8);

			} else {

				stream.write(l, 5);

			}


			stream.writeRAW(data);

		} else if (data instanceof Date) {

			stream.write(4, 4);

			let str = '';

			str += data.getUTCFullYear()                + '-';
			str += _format_date(data.getUTCMonth() + 1) + '-';
			str += _format_date(data.getUTCDate())      + 'T';
			str += _format_date(data.getUTCHours())     + ':';
			str += _format_date(data.getUTCMinutes())   + ':';
			str += _format_date(data.getUTCSeconds())   + 'Z';

			stream.writeRAW(str);

		// 12: Start of Array
		} else if (data instanceof Array) {

			stream.write(12, 4);

			for (let d = 0, dl = data.length; d < dl; d++) {
				stream.write(0, 4);
				_encode(stream, data[d]);
			}

			// Write EOO marker
			stream.write(15, 4);


		// 13: Start of Object
		} else if (data instanceof Object && typeof data.serialize !== 'function') {

			stream.write(13, 4);

			for (let prop in data) {

				if (data.hasOwnProperty(prop)) {
					stream.write(0, 4);
					_encode(stream, prop);
					_encode(stream, data[prop]);
				}

			}

			// Write EOO marker
			stream.write(15, 4);


		// 14: Custom High-Level Implementation
		} else if (data instanceof Object && typeof data.serialize === 'function') {

			stream.write(14, 4);

			let blob = lychee.serialize(data);

			_encode(stream, blob);

			// Write EOO marker
			stream.write(15, 4);

		}

	};

	const _decode = function(stream) {

		let value  = undefined;
		let tmp    = 0;
		let errors = 0;
		let check  = 0;

		if (stream.pointer() < stream.length()) {

			let type = stream.read(4);


			// 0: Boolean, Null (or EOS), Undefined, Infinity, NaN
			if (type === 0) {

				tmp = stream.read(3);

				if (tmp === 1) {
					value = null;
				} else if (tmp === 2) {
					value = undefined;
				} else if (tmp === 3) {
					value = false;
				} else if (tmp === 4) {
					value = true;
				} else if (tmp === 5) {
					value = Infinity;
				} else if (tmp === 6) {
					value = -Infinity;
				} else if (tmp === 7) {
					value = NaN;
				}


			// 1: Integer, 2: Float
			} else if (type === 1 || type === 2) {

				tmp = stream.read(4);


				if (tmp === 0) {

					value = stream.read(1);

				} else if (tmp === 1) {

					value = stream.read(4);

				} else if (tmp === 2) {

					value = stream.read(8);

				} else if (tmp === 3) {

					value = (stream.read(4) <<  8) + stream.read(8);

				} else if (tmp === 4) {

					value = (stream.read(8) <<  8) + stream.read(8);

				} else if (tmp === 5) {

					value = (stream.read(4) << 16) + (stream.read(8) <<  8) + stream.read(8);

				} else if (tmp === 6) {

					value = (stream.read(8) << 16) + (stream.read(8) <<  8) + stream.read(8);

				} else if (tmp === 7) {

					value = (stream.read(8) << 24) + (stream.read(8) << 16) + (stream.read(8) <<  8) + stream.read(8);

				} else if (tmp === 8) {

					let str = _decode(stream);

					value = parseInt(str, 10);

				}


				// Negative value
				let sign = stream.read(1);
				if (sign === 1) {
					value = -1 * value;
				}


				// Float only: Shift it back by the precision
				if (type === 2) {
					let shift = stream.read(4);
					value /= _RPOW_TABLE[shift];
				}


			// 3: String
			} else if (type === 3) {

				let size = stream.read(5);

				if (size === 31) {

					size = (stream.read(8) << 24) + (stream.read(8) << 16) + (stream.read(8) <<  8) + stream.read(8);

				} else if (size === 30) {

					size = (stream.read(8) <<  8) + stream.read(8);

				} else if (size === 29) {

					size = stream.read(8);

				}


				value = _desanitize_string(stream.readRAW(size));

			// 4: Date
			} else if (type === 4) {

				check = stream.readRAW(20);

				if (check[19] === 'Z') {
					value = new Date(check);
				}


			// 12: Array
			} else if (type === 12) {

				value = [];


				while (errors === 0) {

					check = stream.read(4);

					if (check === 0) {
						value.push(_decode(stream));
					} else if (check === 15) {
						break;
					} else {
						errors++;
					}

				}


			// 13: Object
			} else if (type === 13) {

				value = {};


				while (errors === 0) {

					check = stream.read(4);

					if (check === 0) {
						value[_decode(stream)] = _decode(stream);
					} else if (check === 15) {
						break;
					} else {
						errors++;
					}

				}

			// 14: Custom High-Level Implementation
			} else if (type === 14) {

				let blob = _decode(stream);

				value = lychee.deserialize(blob);
				check = stream.read(4);

				if (check !== 15) {
					value = undefined;
				}

			}

		}


		return value;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'lychee.codec.BITON',
				'blob':      null
			};

		},



		/*
		 * CUSTOM API
		 */

		encode: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				let stream = new _Stream('', _Stream.MODE.write);

				_encode(stream, data);

				return Buffer.from(stream.toString(), 'utf8');

			}


			return null;

		},

		decode: function(data) {

			data = data instanceof Buffer ? data : null;


			if (data !== null) {

				let stream = new _Stream(data.toString('utf8'), _Stream.MODE.read);
				let object = _decode(stream);
				if (object !== undefined) {
					return object;
				}

			}


			return null;

		}

	};


	return Module;

});

