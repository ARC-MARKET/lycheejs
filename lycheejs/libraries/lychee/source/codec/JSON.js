
lychee.define('lychee.codec.JSON').exports((lychee, global, attachments) => {

	/*
	 * HELPERS
	 */

	const _CHARS_SEARCH = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	const _CHARS_META   = {
		'\r': '',    // FUCK YOU, Microsoft!
		'\b': '\\b',
		'\t': '\\t',
		'\n': '\\n',
		'\f': '\\f',
		'"':  '\\"',
		'\\': '\\\\'
	};

	const _format_date = function(n) {
		return n < 10 ? '0' + n : '' + n;
	};

	const _desanitize_string = function(san) {

		let str = san;

		// str = str.replace(/\\b/g, '\b');
		// str = str.replace(/\\f/g, '\f');
		str = str.replace(/\\t/g, '\t');
		str = str.replace(/\\n/g, '\n');
		str = str.replace(/\\\\/g, '\\');

		return str;

	};

	const _sanitize_string = function(str) {

		let san = str;

		if (_CHARS_SEARCH.test(san)) {

			san = san.replace(_CHARS_SEARCH, character => {

				let meta = _CHARS_META[character];
				if (meta !== undefined) {
					return meta;
				} else {
					return '\\u' + (character.charCodeAt(0).toString(16)).slice(-4);
				}

			});

		}

		return san;

	};



	/*
	 * STRUCTS
	 */

	const _Stream = function(buffer) {

		this.__buffer = typeof buffer === 'string' ? buffer : '';
		this.__index  = 0;

	};


	_Stream.prototype = {

		toString: function() {
			return this.__buffer;
		},

		pointer: function() {
			return this.__index;
		},

		length: function() {
			return this.__buffer.length;
		},

		read: function(bytes) {

			let buffer = '';

			buffer       += this.__buffer.substr(this.__index, bytes);
			this.__index += bytes;

			return buffer;

		},

		search: function(array) {

			let bytes = Infinity;

			for (let a = 0, al = array.length; a < al; a++) {

				let token = array[a];
				let size  = this.__buffer.indexOf(token, this.__index + 1) - this.__index;
				if (size > -1 && size < bytes) {
					bytes = size;
				}

			}


			if (bytes === Infinity) {
				return 0;
			}


			return bytes;

		},

		seek: function(bytes) {

			if (bytes > 0) {
				return this.__buffer.substr(this.__index, bytes);
			} else {
				return this.__buffer.substr(this.__index + bytes, Math.abs(bytes));
			}

		},

		write: function(buffer) {

			this.__buffer += buffer;
			this.__index  += buffer.length;

		}

	};



	/*
	 * ENCODER and DECODER
	 */

	const _encode = function(stream, data) {

		// Boolean, Null (or EOS), Undefined, Infinity, NaN
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

			if (data === null) {
				stream.write('null');
			} else if (data === undefined) {
				stream.write('undefined');
			} else if (data === false) {
				stream.write('false');
			} else if (data === true) {
				stream.write('true');
			} else if (data === Infinity) {
				stream.write('Infinity');
			} else if (data === -Infinity) {
				stream.write('-Infinity');
			} else if (isNaN(data) === true) {
				stream.write('NaN');
			}


		// 123, 12.3: Integer or Float
		} else if (typeof data === 'number') {

			let type = 1;
			if (data < 268435456 && data !== (data | 0)) {
				type = 2;
			}


			// Negative value
			let sign = 0;
			if (data < 0) {
				data = -data;
				sign = 1;
			}


			if (sign === 1) {
				stream.write('-');
			}


			if (type === 1) {
				stream.write('' + data.toString());
			} else {
				stream.write('' + data.toString());
			}


		// "": String
		} else if (typeof data === 'string') {

			data = _sanitize_string(data);


			stream.write('"');

			stream.write(data);

			stream.write('"');


		// 2021-12-31T11:12:13.123Z
		} else if (data instanceof Date) {

			let str = '';

			str += data.getUTCFullYear()                + '-';
			str += _format_date(data.getUTCMonth() + 1) + '-';
			str += _format_date(data.getUTCDate())      + 'T';
			str += _format_date(data.getUTCHours())     + ':';
			str += _format_date(data.getUTCMinutes())   + ':';
			str += _format_date(data.getUTCSeconds())   + 'Z';

			stream.write(str);

		// []: Array
		} else if (data instanceof Array) {

			stream.write('[');

			for (let d = 0, dl = data.length; d < dl; d++) {

				_encode(stream, data[d]);

				if (d < dl - 1) {
					stream.write(',');
				}

			}

			stream.write(']');


		// {}: Object
		} else if (data instanceof Object && typeof data.serialize !== 'function') {

			stream.write('{');

			let keys = Object.keys(data);

			for (let k = 0, kl = keys.length; k < kl; k++) {

				let key = keys[k];

				_encode(stream, key);
				stream.write(':');

				_encode(stream, data[key]);

				if (k < kl - 1) {
					stream.write(',');
				}

			}

			stream.write('}');


		// Custom High-Level Implementation
		} else if (data instanceof Object && typeof data.serialize === 'function') {

			stream.write('%');

			let blob = lychee.serialize(data);

			_encode(stream, blob);

			stream.write('%');

		}

	};

	const _decode = function(stream) {

		let value  = undefined;
		let seek   = '';
		let size   = 0;
		let errors = 0;
		let check  = null;


		if (stream.pointer() < stream.length()) {

			seek = stream.seek(1);


			// Boolean, Null (or EOS), Undefined, Infinity, NaN
			if (stream.seek(4) === 'null') {
				stream.read(4);
				value = null;
			} else if (stream.seek(9) === 'undefined') {
				stream.read(9);
				value = undefined;
			} else if (stream.seek(5) === 'false') {
				stream.read(5);
				value = false;
			} else if (stream.seek(4) === 'true') {
				stream.read(4);
				value = true;
			} else if (stream.seek(8) === 'Infinity') {
				stream.read(8);
				value = Infinity;
			} else if (stream.seek(9) === '-Infinity') {
				stream.read(9);
				value = -Infinity;
			} else if (stream.seek(3) === 'NaN') {
				stream.read(3);
				value = NaN;

			// 2021-12-31T11:12:13.123Z -> length is 24
			// 2021-12-31T11:12:13Z     -> length is 20
			} else if (stream.seek(20)[19] === 'Z' || stream.seek(24)[23] === 'Z') {

				size  = stream.search([ 'Z' ]);
				check = stream.seek(size + 1);

				if (/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})?(Z|\.([0-9]{3})Z)$/g.test(check) === true) {
					stream.read(size + 1);
					value = new Date(check);
				}

			// 123, 12.3: Number
			} else if (seek === '-' || isNaN(parseInt(seek, 10)) === false) {

				size = stream.search([ ',', ']', '}' ]);

				if (size > 0) {

					let tmp = stream.read(size);
					if (tmp.indexOf('.') !== -1) {
						value = parseFloat(tmp, 10);
					} else {
						value = parseInt(tmp, 10);
					}

				}

			// "": String
			} else if (seek === '"') {

				stream.read(1);

				size = stream.search([ '"' ]);

				if (size > 0) {
					value = stream.read(size);
				} else {
					value = '';
				}


				check = stream.read(1);


				let unichar = stream.seek(-2);

				while (check === '"' && unichar.charAt(0) === '\\') {

					if (value.charAt(value.length - 1) === '\\') {
						value = value.substr(0, value.length - 1) + check;
					}

					size    = stream.search([ '"' ]);
					value  += stream.read(size);
					check   = stream.read(1);
					unichar = stream.seek(-2);

				}

				value = _desanitize_string(value);

			// []: Array
			} else if (seek === '[') {

				value = [];


				size  = stream.search([ ']' ]);
				check = stream.read(1).trim() + stream.seek(size).trim();

				if (check !== '[]') {

					while (errors === 0) {

						value.push(_decode(stream));

						check = stream.seek(1);

						if (check === ',') {
							stream.read(1);
						} else if (check === ']') {
							break;
						} else {
							errors++;
						}

					}

					stream.read(1);

				} else {

					stream.read(size);

				}


			// {}: Object
			} else if (seek === '{') {

				value = {};


				stream.read(1);

				while (errors === 0) {

					if (stream.seek(1) === '}') {
						break;
					}


					let object_key = _decode(stream);
					check = stream.seek(1);

					if (check === '}') {
						break;
					} else if (check === ':') {
						stream.read(1);
					} else if (check !== ':') {
						errors++;
					}

					let object_value = _decode(stream);
					check = stream.seek(1);


					value[object_key] = object_value;


					if (check === '}') {
						break;
					} else if (check === ',') {
						stream.read(1);
					} else {
						errors++;
					}

				}

				stream.read(1);

			// %%: Custom High-Level Implementation
			} else if (seek === '%') {

				stream.read(1);

				let blob = _decode(stream);

				value = lychee.deserialize(blob);
				check = stream.read(1);

				if (check !== '%') {
					value = undefined;
				}

			} else {

				// Invalid seek, assume it's a space character

				stream.read(1);
				return _decode(stream);

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
				'reference': 'lychee.codec.JSON',
				'blob':      null
			};

		},



		/*
		 * CUSTOM API
		 */

		encode: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				let stream = new _Stream('');

				_encode(stream, data);

				return Buffer.from(stream.toString(), 'utf8');

			}


			return null;

		},

		decode: function(data) {

			data = data instanceof Buffer ? data : null;


			if (data !== null) {

				let stream = new _Stream(data.toString('utf8'));
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

