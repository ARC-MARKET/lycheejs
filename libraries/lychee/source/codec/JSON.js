
lychee.define('lychee.codec.JSON').exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	const _CHARS_DANGEROUS = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	const _CHARS_ESCAPABLE = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	const _CHARS_META      = {
		'\b': '\\b',
		'\t': '\\t',
		'\n': '\\n',
		'\f': '\\f',
		'\r': '',    // FUCK YOU, Microsoft!
		'"':  '\\"',
		'\\': '\\\\'
	};

	const _sanitize_string = function(str) {

		let san = str;


		if (_CHARS_ESCAPABLE.test(san)) {

			san = san.replace(_CHARS_ESCAPABLE, function(char) {

				let val = _CHARS_META[char];
				if (typeof val === 'string') {
					return val;
				} else {
					return '\\u' + (char.charCodeAt(0).toString(16)).slice(-4);
				}

			});

		}

		return san;

	};



	const _Stream = function(buffer, mode) {

		this.__buffer = typeof buffer === 'string'        ? buffer : '';
		this.__mode   = lychee.enumof(_Stream.MODE, mode) ? mode   : 0;

		this.__index  = 0;

	};


	_Stream.MODE = {
		read:  0,
		write: 1
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
			return this.__buffer.substr(this.__index, bytes);
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

		// null,false,true: Boolean or Null or EOS
		if (typeof data === 'boolean' || data === null) {

			if (data === null) {
				stream.write('null');
			} else if (data === false) {
				stream.write('false');
			} else if (data === true) {
				stream.write('true');
			}


		// 123,12.3: Integer or Float
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
		let tmp    = 0;
		let errors = 0;
		let check  = null;


		if (stream.pointer() < stream.length()) {

			seek = stream.seek(1);


			// null,false,true: Boolean or Null or EOS
			if (seek === 'n' || seek === 'f' || seek === 't') {

				if (stream.seek(4) === 'null') {
					stream.read(4);
					value = null;
				} else if (stream.seek(5) === 'false') {
					stream.read(5);
					value = false;
				} else if (stream.seek(4) === 'true') {
					stream.read(4);
					value = true;
				}


			// 123: Number
			} else if (seek === '-' || !isNaN(parseInt(seek, 10))) {

				size = stream.search([ ',', ']', '}' ]);

				if (size > 0) {

					tmp = stream.read(size);

					if (tmp.indexOf('.') !== -1) {
						value = parseFloat(tmp, 10);
					} else {
						value = parseInt(tmp, 10);
					}

				}

			// "": String
			} else if (seek === '"') {

				stream.read(1);

				size = stream.search([ '\\', '"' ]);

				if (size > 0) {
					value = stream.read(size);
				} else {
					value = '';
				}


				check = stream.read(1);


				while (check === '\\') {

					value[value.length - 1] = check;

					let special = stream.seek(1);
					if (special === 'b') {

						stream.read(1);
						value += '\b';

					} else if (special === 't') {

						stream.read(1);
						value += '\t';

					} else if (special === 'n') {

						stream.read(1);
						value += '\n';

					} else if (special === 'f') {

						stream.read(1);
						value += '\f';

					} else if (special === '"') {

						stream.read(1);
						value += '"';

					} else if (special === '\\') {

						stream.read(1);
						value += '\\';

					}


					size   = stream.search([ '\\', '"' ]);
					value += stream.read(size);
					check  = stream.read(1);

				}


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

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'lychee.codec.JSON',
				'blob':      null
			};

		},

		encode: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				let stream = new _Stream('', _Stream.MODE.write);

				_encode(stream, data);

				return new Buffer(stream.toString(), 'utf8');

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

