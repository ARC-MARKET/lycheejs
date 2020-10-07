
lychee.define('lychee.codec.DIXY').exports((lychee, global, attachments) => {

	/*
	 * HELPERS
	 */

	const _WHITESPACE   = ' ' + new Array(256).fill(' ').join(' ');
	const _CHARS_SEARCH = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	const _CHARS_META   = {
		'\r': '',    // FUCK YOU, Microsoft!
		'\b': '\\b',
		'\t': '\\t',
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

		write: function(buffer) {

			this.__buffer += buffer;
			this.__index  += buffer.length;

		}

	};



	/*
	 * ENCODER and DECODER
	 */

	const _encode = function(stream, data, indent, offset) {

		indent = typeof indent === 'string' ? indent : '';
		offset = typeof offset === 'number' ? offset : 0;


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

			if (data.includes('\n')) {

				let lines = data.split('\n');
				let first = _sanitize_string(lines[0]);

				stream.write(first + '\n');

				for (let l = 1, ll = lines.length; l < ll; l++) {

					let line = _sanitize_string(lines[l]);

					stream.write(indent.substr(0, indent.length - 1));

					if (offset > 0) {
						stream.write(_WHITESPACE.substr(0, offset));
					}

					stream.write(line);

					if (l < ll - 1) {
						stream.write('\n');
					}

				}

			} else {

				data = _sanitize_string(data);

				stream.write(data);

			}

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

		// <index>:<value> Array
		} else if (data instanceof Array) {

			for (let d = 0, dl = data.length; d < dl; d++) {

				let key = d;
				let val = data[d];

				stream.write(indent + key + ': ');

				if (val instanceof Array || (val instanceof Object && !(val instanceof Date))) {
					stream.write('\n');
				}

				_encode(stream, val, indent + '\t', key.length + 2);

				if (d < dl - 1) {
					stream.write('\n');
				}

			}

		// <key>:<value> Object
		} else if (data instanceof Object && typeof data.serialize !== 'function') {

			let keys = Object.keys(data);

			for (let k = 0, kl = keys.length; k < kl; k++) {

				let key = keys[k];
				let val = data[key];

				stream.write(indent + key + ': ');

				if (val instanceof Array || (val instanceof Object && !(val instanceof Date))) {
					stream.write('\n');
				}

				_encode(stream, val, indent + '\t', key.length + 2);

				if (k < kl - 1) {
					stream.write('\n');
				}

			}

		// Custom High-Level Implementation
		} else if (data instanceof Object && typeof data.serialize === 'function') {

			// TODO: Figure out a deserialize/serialize way
			// which does not require a nested for loop

		}

	};

	const _decode_indent = function(line) {

		let indent = 0;

		for (let l = 0, ll = line.length; l < ll; l++) {

			let chunk = line[l];
			if (chunk === '\t') {
				indent++;
			} else {
				break;
			}

		}

		return indent;

	};

	const _EOL = { unique: '<EOL DUMMY>' };
	const _decode_value = function(chunk) {

		let seek = chunk.substr(0, 1);

		if (chunk === '') {
			return _EOL;

		} else if (chunk === 'null') {

			return null;

		} else if (chunk === 'undefined') {

			return undefined;

		} else if (chunk === 'false') {

			return false;

		} else if (chunk === 'true') {

			return true;

		} else if (chunk === 'Infinity') {

			return Infinity;

		} else if (chunk === '-Infinity') {

			return -Infinity;

		} else if (chunk === 'NaN') {

			return NaN;

		} else if (/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})?(Z|\.([0-9]{3})Z)$/g.test(chunk) === true) {

			return new Date(chunk);

		} else if (seek === '-' || isNaN(parseInt(seek, 10)) === false) {

			if (chunk.indexOf('.') !== -1) {

				let tmp = parseFloat(chunk, 10);
				if (isNaN(tmp) === false && (tmp).toString() === chunk) {
					return tmp;
				}

			} else {

				let tmp = parseInt(chunk, 10);
				if (isNaN(tmp) === false && (tmp).toString() === chunk) {
					return tmp;
				}

			}

		}

		return _desanitize_string(chunk);

	};

	const _decode_line = function(line) {

		let chunk = line.trim();
		let dot   = chunk.indexOf(':');

		// Array or Object key: value
		if (dot !== -1) {

			let key = chunk.substr(0, dot);
			let val = chunk.substr(dot + 1).trim();

			if (/^([0-9]+)$/g.test(key)) {

				let tmp = parseInt(key, 10);
				if (isNaN(tmp) === false && (tmp).toString() === key) {
					key = tmp;
				}

			}

			return {
				indent: _decode_indent(line),
				key:    key,
				val:    _decode_value(val)
			};

		// Multiline String
		} else if (chunk.length > 0) {

			return {
				indent: _decode_indent(line),
				key:    null,
				val:    _desanitize_string(chunk)
			};

		}


		return {
			indent: _decode_indent(line),
			key:    null,
			val:    null
		};

	};

	const _decode = function(stream) {

		let lines = stream.toString().split('\n');
		if (lines.length > 0) {

			let root  = {};
			let check = lines[0].split(':')[0].trim();
			if (/^([0-9]+)$/g.test(check)) {
				root = [];
			}


			let parents       = {};
			let pointer       = root;
			let last_indent   = 0;
			let multiline_key = null;

			for (let l = 0, ll = lines.length; l < ll; l++) {

				let line = lines[l];
				let data = _decode_line(line);

				if (data.indent < last_indent) {
					pointer = parents[data.indent];
					last_indent = data.indent;
				} else if (data.indent > last_indent) {
					last_indent = data.indent;
				}


				if (data.key !== null) {

					if (data.val === _EOL) {

						let next = _decode_line(lines[l + 1] || '');

						if (typeof next.key === 'number') {
							pointer[data.key]    = [];
							parents[data.indent] = pointer;
							pointer              = pointer[data.key];
						} else if (typeof next.key === 'string') {
							pointer[data.key]    = {};
							parents[data.indent] = pointer;
							pointer              = pointer[data.key];
						}

					} else if (typeof data.key === 'number') {

						multiline_key = pointer.length;
						pointer.push(data.val);

					} else if (typeof data.key === 'string') {

						multiline_key = data.key;
						pointer[data.key] = data.val;

					}

				} else if (typeof data.val === 'string') {

					if (multiline_key !== null) {
						pointer[multiline_key] += '\n' + data.val;
					}

				}

			}

			return root;

		}


		return undefined;

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
				'reference': 'lychee.codec.DIXY',
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

				_encode(stream, data, '');

				stream.write('\n');

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

