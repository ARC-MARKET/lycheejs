
lychee.define('lychee.codec.BENCODE').exports((lychee, global, attachments) => {

	/*
	 * HELPERS
	 */

	const _CHARS_DANGEROUS = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
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

		let san = str;


		if (_CHARS_ESCAPABLE.test(san)) {

			san = san.replace(_CHARS_ESCAPABLE, character => {

				let val = _CHARS_META[character];
				if (typeof val === 'string') {
					return val;
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

		read: function(bytes) {

			let buffer = '';

			buffer       += this.__buffer.substr(this.__index, bytes);
			this.__index += bytes;

			return buffer;

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

		// Boolean, Null, Undefined, Infinity, NaN
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
				stream.write('pne');
			} else if (data === undefined) {
				stream.write('pue');
			} else if (data === false) {
				stream.write('pfe');
			} else if (data === true) {
				stream.write('pte');
			} else if (data === Infinity) {
				stream.write('p+e');
			} else if (data === -Infinity) {
				stream.write('p-e');
			} else if (isNaN(data) === true) {
				stream.write('p_e');
			}


		// i123e : Integer
		// f12.3e : Float
		} else if (typeof data === 'number') {

			let type = 'i';
			if (data < 268435456 && data !== (data | 0)) {
				type = 'f';
			}

			let sign = 0;
			if (data < 0) {
				data = -data;
				sign = 1;
			}


			stream.write(type);

			if (sign === 1) {
				stream.write('-');
			}

			stream.write(data.toString());

			stream.write('e');


		// <length>:<contents> : String
		} else if (typeof data === 'string') {

			data = _sanitize_string(data);


			stream.write(data.length + ':' + data);


		// t<contents>e : Date
		} else if (data instanceof Date) {

			stream.write('t');

			let str = '';

			str += data.getUTCFullYear()                + '-';
			str += _format_date(data.getUTCMonth() + 1) + '-';
			str += _format_date(data.getUTCDate())      + 'T';
			str += _format_date(data.getUTCHours())     + ':';
			str += _format_date(data.getUTCMinutes())   + ':';
			str += _format_date(data.getUTCSeconds())   + 'Z';

			stream.write(str);

			stream.write('e');


		// l<contents>e : Array
		} else if (data instanceof Array) {

			stream.write('l');

			for (let d = 0, dl = data.length; d < dl; d++) {
				_encode(stream, data[d]);
			}

			stream.write('e');

		// d<contents>e : Object
		} else if (data instanceof Object && typeof data.serialize !== 'function') {

			stream.write('d');

			let keys = Object.keys(data).sort((a, b) => {
				if (a > b) return  1;
				if (a < b) return -1;
				return 0;
			});

			for (let k = 0, kl = keys.length; k < kl; k++) {

				let key = keys[k];

				_encode(stream, key);
				_encode(stream, data[key]);

			}

			stream.write('e');


		// s<contents>e : Custom High-Level Implementation
		} else if (data instanceof Object && typeof data.serialize === 'function') {

			stream.write('s');

			let blob = lychee.serialize(data);

			_encode(stream, blob);

			stream.write('e');

		}

	};

	const _is_decodeable_value = function(str) {

		let head = str.charAt(0);
		if (/([piftlds]+)/g.test(head) === true) {
			return true;
		} else if (isNaN(parseInt(head, 10)) === false) {
			return true;
		}

		return false;

	};

	const _decode = function(stream) {

		let value  = undefined;
		let size   = 0;
		let tmp    = 0;
		let errors = 0;
		let check  = null;


		if (stream.pointer() < stream.length()) {

			let seek = stream.seek(1);


			// Boolean, Null, Undefined, Infinity, NaN
			if (seek === 'p') {

				check = stream.seek(3);

				if (check === 'pne') {
					stream.read(3);
					value = null;
				} else if (check === 'pue') {
					stream.read(3);
					value = undefined;
				} else if (check === 'pfe') {
					stream.read(3);
					value = false;
				} else if (check === 'pte') {
					stream.read(3);
					value = true;
				} else if (check === 'p+e') {
					stream.read(3);
					value = +Infinity;
				} else if (check === 'p-e') {
					stream.read(3);
					value = -Infinity;
				} else if (check === 'p_e') {
					stream.read(3);
					value = NaN;
				}


			// i123e : Integer
			} else if (seek === 'i') {

				stream.read(1);

				size = stream.search([ 'e' ]);

				if (size > 0) {

					tmp   = stream.read(size);
					value = parseInt(tmp, 10);
					check = stream.read(1);

				}

			// f12.3e : Float
			} else if (seek === 'f') {

				stream.read(1);

				size = stream.search([ 'e' ]);

				if (size > 0) {

					tmp   = stream.read(size);
					value = parseFloat(tmp, 10);
					check = stream.read(1);

				}

			// <length>:<contents> : String
			} else if (isNaN(parseInt(seek, 10)) === false) {

				size = stream.search([ ':' ]);

				if (size > 0) {

					size  = parseInt(stream.read(size), 10);
					check = stream.read(1);

					if (isNaN(size) === false && check === ':') {
						value = stream.read(size);
					}

				}

			// t<contents>e : Date
			} else if (seek === 't') {

				stream.read(1);

				size = stream.search([ 'e' ]);

				if (size > 0) {

					tmp   = stream.read(size);
					value = new Date(tmp);
					check = stream.read(1);

				}

			// l<contents>e : Array
			} else if (seek === 'l') {

				value = [];


				stream.read(1);

				while (errors === 0) {

					value.push(_decode(stream));

					check = stream.seek(1);

					if (check === 'e') {
						break;
					} else if (_is_decodeable_value(check) === false) {
						errors++;
					}

				}

				stream.read(1);


			// d<contents>e : Object
			} else if (seek === 'd') {

				value = {};


				stream.read(1);

				while (errors === 0) {

					let object_key   = _decode(stream);
					let object_value = _decode(stream);

					check = stream.seek(1);

					value[object_key] = object_value;

					if (check === 'e') {
						break;
					} else if (isNaN(parseInt(check, 10))) {
						errors++;
					}

				}

				stream.read(1);


			// s<contents>e : Custom High-Level Implementation
			} else if (seek === 's') {

				stream.read(1);

				let blob = _decode(stream);

				value = lychee.deserialize(blob);
				check = stream.read(1);

				if (check !== 'e') {
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
				'reference': 'lychee.codec.BENCODE',
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

