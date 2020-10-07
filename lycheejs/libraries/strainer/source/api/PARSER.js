
lychee.define('strainer.api.PARSER').requires([
	'lychee.crypto.MURMUR'
]).exports((lychee, global, attachments) => {

	const _DICTIONARY = attachments['json'].buffer;
	const _FEATURES   = lychee.FEATURES;
	const _MURMUR     = lychee.import('lychee.crypto.MURMUR');
	const _PLATFORMS  = lychee.PLATFORMS;



	/*
	 * HELPERS
	 */

	const _resolve_reference = function(identifier) {

		let pointer = this;

		let ns = identifier.split('.');
		for (let n = 0, l = ns.length; n < l; n++) {

			let name = ns[n];
			if (name.includes('(') && name.includes(')')) {

				let args = null;

				try {

					let str = name.substr(name.indexOf('('));
					str  = str.split('\'').join('"');
					args = JSON.parse('[' + str.substr(1, str.length - 2) + ']');

				} catch (err) {
					args = null;
				}


				name = name.substr(0, name.indexOf('('));


				if (typeof pointer[name] === 'function' && args !== null) {

					try {
						pointer = pointer[name].apply(pointer, args);
					} catch (err) {
						pointer = null;
					}

					if (pointer === null) {
						break;
					}

				} else {

					pointer = null;
					break;

				}

			} else if (pointer[name] !== undefined) {

				pointer = pointer[name];

			} else {

				pointer = null;
				break;

			}

		}

		return pointer;

	};

	const _resolve_variable = function(val) {

		let tmp = val.trim();
		if (tmp.includes(' ')) {
			tmp = tmp.substr(0, tmp.indexOf(' ')).trim();
		}

		if (tmp.includes('.')) {
			tmp = tmp.substr(0, tmp.indexOf('.'));
		}

		if (tmp.includes('[')) {
			tmp = tmp.substr(0, tmp.indexOf('['));
		}

		if (tmp.includes('(')) {
			tmp = tmp.substr(0, tmp.indexOf('('));
		}


		if (tmp.includes(')')) {
			tmp = tmp.substr(0, tmp.indexOf(')'));
		}

		if (tmp.includes(',')) {
			tmp = tmp.substr(0, tmp.indexOf(','));
		}

		if (tmp.includes(';')) {
			tmp = tmp.substr(0, tmp.indexOf(';'));
		}

		return tmp;

	};

	const _resolve_value = function(val) {

		let value = {
			chunk: 'undefined',
			type:  'undefined',
			value: val
		};


		if (val === undefined) {

			value.chunk = 'undefined';
			value.type  = 'undefined';

		} else if (val === null) {

			value.chunk = 'null';
			value.type  = 'null';

		} else if (typeof val === 'boolean') {

			value.chunk = (val).toString();
			value.type  = 'Boolean';

		} else if (typeof val === 'number') {

			value.chunk = (val).toString();
			value.type  = 'Number';

		} else if (typeof val === 'string') {

			value.chunk = val;
			value.type  = 'String';

		} else if (typeof val === 'function') {

			value.chunk = val.toString();
			value.type  = 'Function';

		} else if (val instanceof Array) {

			value.chunk = JSON.stringify(val);
			value.type  = 'Array';

		} else if (val instanceof Object) {

			value.chunk = JSON.stringify(val);
			value.type  = 'Object';

		}


		return value;

	};

	const _get_chunk = function(str1, str2, code) {

		let i1 = code.indexOf(str1);
		let i2 = code.indexOf(str2, i1);

		if (i1 !== -1 && i2 !== -1) {
			return code.substr(i1 + str1.length, i2 - i1 - str1.length + str2.length).trim();
		}

		return 'undefined';

	};

	const _detect_type = function(str) {

		let type = 'undefined';


		if (str === 'undefined') {
			type = 'undefined';
		} else if (str === '-Infinity' || str === 'Infinity') {
			type = 'Number';
		} else if (str === 'null') {
			type = 'null';
		} else if (str === 'true' || str === 'false') {
			type = 'Boolean';
		} else if (str.startsWith('function')) {
			type = 'function';
		} else if (str.startsWith('(function(')) {
			type = 'function';
		} else if (str.includes('===') && !str.includes('?')) {
			type = 'Boolean';
		} else if (str.includes('&&') && !str.includes('?')) {
			type = 'Boolean';
		} else if (str === '[]' || str.startsWith('[') || str.startsWith('Array.from')) {
			type = 'Array';
		} else if (str === '{}' || str.startsWith('{')) {
			type = 'Object';
		} else if (str.startsWith('Buffer.alloc(') || str.startsWith('Buffer.from(')) {
			type = 'Buffer';
		} else if (str.startsWith('Composite.')) {
			type = 'Enum';
		} else if (str.startsWith('new Composite')) {
			type = 'Composite';
		} else if (str.startsWith('new Promise')) {
			type = 'Promise';
		} else if (str.startsWith('new ')) {

			let tmp = str.substr(4);
			let i1  = tmp.indexOf('(');
			if (i1 !== -1) {
				tmp = tmp.substr(0, i1);
			}

			type = tmp;

		} else if (str.startsWith('\'') && str.endsWith('\'')) {
			type = 'String';
		} else if (str.startsWith('"') && str.endsWith('"')) {
			type = 'String';
		} else if (str.startsWith('\'') || str.startsWith('"')) {
			type = 'String';
		} else if (str.includes('toString(') || str.includes('join(')) {
			type = 'String';
		} else if (str.startsWith('/') || str.endsWith('/g')) {
			type = 'RegExp';
		} else if (str.startsWith('0b') || str.startsWith('0x') || str.startsWith('0o') || /^[0-9.]+$/g.test(str) || /^-[0-9.]+$/g.test(str)) {
			type = 'Number';
		} else if (str === 'Infinity') {
			type = 'Number';
		} else if (str.includes(' + ') && (str.includes('\'') || str.includes('"') || str.includes('.substr(') || str.includes('.trim()'))) {
			type = 'String';
		} else if (str.includes(' * ') || str.includes(' / ') || str.includes(' + ') || str.includes(' - ')) {
			type = 'Number';
		} else {

			if (str.includes('instanceof') && str.includes('?') && str.includes(':')) {

				let tmp = str.split(/(.*)instanceof\s([A-Za-z0-9_.]+)([\s]+)\?(.*)/g);
				if (tmp.length > 2) {
					type = tmp[2];
				}

			} else if (str.startsWith('typeof') && str.includes('===') && str.includes('?') && str.includes(':')) {

				let tmp = (str.split('?')[0].split('===')[1] || '').trim();
				if (tmp.startsWith('\'') || tmp.startsWith('"')) {
					tmp = tmp.substr(1, tmp.length - 2);
				}


				switch (tmp) {
					case 'undefined': type = 'undefined'; break;
					case 'null':      type = 'null';      break;
					case 'boolean':   type = 'Boolean';   break;
					case 'number':    type = 'Number';    break;
					case 'string':    type = 'String';    break;
					case 'function':  type = 'Function';  break;
					case 'object':    type = 'Object';    break;
					default:          type = 'undefined'; break;
				}


				if (type === 'undefined') {

					let tmp1 = str.split(':').pop();
					if (tmp1.endsWith(';')) {
						tmp1 = tmp1.substr(0, tmp1.length - 1);
					}

					type = _detect_type(tmp1.trim());

				}

			} else if (str.includes('/g.test(')  && str.includes('?') && str.includes(':')) {

				type = 'String';

			} else if (str.endsWith('| 0') || str.endsWith('| 0;')) {

				type = 'Number';

			} else if (str.includes('!== undefined') && str.includes('?') && str.includes(':')) {

				type = 'Object';

			} else if (str.startsWith('lychee.deserialize') || str.startsWith('_lychee.deserialize')) {

				if (str.includes('lychee.serialize(')) {

					let tmp = str.split(/lychee\.deserialize\(lychee\.serialize\(([A-Za-z0-9_.]+)\)\)/g);
					if (tmp.length > 2) {
						type = 'undefined';
					}

				} else {

					let tmp = str.split(/lychee\.deserialize\(([A-Za-z0-9_.]+)\)/g);
					if (tmp.length > 2) {
						type = 'Object';
					}

				}

			} else if (str.startsWith('lychee.assignsafe') || str.startsWith('_lychee.assignsafe')) {

				type = 'Object';

			} else if (str.startsWith('lychee.assignunlink') || str.startsWith('_lychee.assignunlink')) {

				type = 'Object';

			} else if (str.startsWith('lychee.diff') || str.startsWith('_lychee.diff')) {

				type = 'Object';

			} else if (str.startsWith('lychee.enumof') || str.startsWith('_lychee.enumof')) {

				type = 'Enum';

			} else if (str.startsWith('lychee.import') || str.startsWith('_lychee.import')) {

				let tmp = str.split(/lychee.import\('([A-Za-z0-9_.]+)'\)/g);
				if (tmp.length === 3) {

					let name = tmp[1].split('.');
					let last = name[name.length - 1];
					if (last.charAt(0).toUpperCase() === last.charAt(0)) {

						if (name.length > 1) {
							type = 'lychee.Definition';
						} else {
							type = last;
						}

					} else {
						type = 'lychee.Namespace';
					}

				}

			} else if (str.startsWith('lychee.interfaceof') || str.startsWith('_lychee.interfaceof')) {

				let tmp = str.split(/lychee.interfaceof\(([A-Za-z0-9_.]+),(.*)\)/g);
				if (tmp.length > 1) {
					type = tmp[1];
				}

			} else if (str === 'this') {

				type = 'Object';

			} else if (str.startsWith('this.')) {

				type = 'undefined';

			} else if (str.endsWith(' || null')) {

				let tmp1 = str.substr(0, str.length - 8).trim();

				type = _detect_type(tmp1);


				// XXX: Assume Object || null
				if (type === 'undefined') {
					type = 'Object';
				}

			} else if (str === 'main') {

				type = 'lychee.app.Main';

			}

		}


		return type;

	};

	const _clone_value = function(data) {

		let clone = undefined;

		if (data !== undefined) {

			try {
				data = JSON.parse(JSON.stringify(data));
			} catch (err) {
			}

		}

		return clone;

	};

	const _parse_value = function(str) {

		let val = undefined;
		if (/(this|global)/g.test(str) === false) {

			try {
				val = eval('(' + str + ')');
			} catch (err) {
			}

		}

		return val;

	};

	const _detect_value = function(str) {

		let value = undefined;


		if (str === 'undefined') {
			value = undefined;
		} else if (str === '-Infinity' || str === 'Infinity') {
			value = 'Infinity';
		} else if (str === 'null') {
			value = null;
		} else if (str === 'true' || str === 'false') {
			value = str === 'true';
		} else if (str.includes('===') && !str.includes('?')) {
			value = true;
		} else if (str.includes('&&') && !str.includes('?')) {
			value = true;
		} else if (str === '[]' || str.startsWith('[')) {

			let tmp = _parse_value(str);
			if (tmp === undefined) {
				tmp = [];
			}

			value = tmp;

		} else if (str === '{}' || str.startsWith('{')) {

			let tmp = _parse_value(str);
			if (tmp === undefined) {
				tmp = {};
			}

			value = tmp;

		} else if (str.startsWith('Buffer.alloc(') || str.startsWith('Buffer.from(')) {
			value = str;
		} else if (str.startsWith('Composite.')) {
			value = str;
		} else if (str.startsWith('new Composite')) {
			value = str;
		} else if (str.startsWith('new Promise')) {
			value = str;
		} else if (str.startsWith('new ')) {

			let tmp = str.substr(4);
			let i1  = tmp.indexOf('(');
			let i2  = tmp.indexOf(')', i1);

			if (i1 !== -1 && i2 !== -1) {

				tmp = tmp.substr(i1 + 1, i2 - i1 - 1);

				if (tmp.includes(',') === false) {
					value = _parse_value(tmp);
				}

			} else if (i1 !== -1) {
				value = '<' + tmp.substr(0, i1) + '>';
			}

		} else if (str.startsWith('\'') && str.endsWith('\'')) {
			value = str.substr(1, str.length - 2);
		} else if (str.startsWith('"') && str.endsWith('"')) {
			value = str.substr(1, str.length - 2);
		} else if (str.startsWith('\'') || str.startsWith('"')) {
			value = '<string>';
		} else if (str.includes('toString(') || str.includes('join(')) {
			value = '<string>';
		} else if (str.startsWith('/') || str.endsWith('/g')) {

			let tmp1 = str;
			let tmp2 = str.substr(str.lastIndexOf('/') + 1);

			if (tmp1.startsWith('/')) {
				tmp1 = tmp1.substr(1);
			}

			if (tmp1.endsWith('/g')) {
				tmp1 = tmp1.substr(0, tmp1.length - 2);
			}

			value = {
				'constructor': 'RegExp',
				'arguments':   [ tmp1, tmp2 ]
			};

		} else if (str.startsWith('0b') || str.startsWith('0x') || str.startsWith('0o') || /^[0-9.]+$/g.test(str) || /^-[0-9.]+$/g.test(str)) {
			value = _parse_value(str);
		} else if (str === 'Infinity') {
			value = Infinity;
		} else if (str.includes(' + ') && (str.includes('\'') || str.includes('"') || str.includes('.substr(') || str.includes('.trim()'))) {
			value = '<string>';
		} else if (str.includes(' * ') || str.includes(' / ') || str.includes(' + ') || str.includes(' - ')) {
			value = 1337;
		} else {

			if (str.includes('instanceof') && str.includes('?') && str.includes(':')) {

				let tmp = str.split(':').pop();
				if (tmp.endsWith(';')) {
					tmp = tmp.substr(0, tmp.length - 1);
				}

				value = _detect_value(tmp.trim());

			} else if (str.startsWith('typeof') && str.includes('?') && str.includes(':')) {

				let tmp = str.split(':').pop();
				if (tmp.endsWith(';')) {
					tmp = tmp.substr(0, tmp.length - 1);
				}

				value = _detect_value(tmp.trim());

			} else if (str.includes('/g.test(')  && str.includes('?') && str.includes(':')) {

				let tmp = str.split(':').pop();
				if (tmp.endsWith(';')) {
					tmp = tmp.substr(0, tmp.length - 1);
				}

				value = _detect_value(tmp.trim());

			} else if (str.endsWith('| 0') || str.endsWith('| 0;')) {

				value = 1337;

			} else if (str.includes('!== undefined') && str.includes('?') && str.includes(':')) {

				value = {};

			} else if (str.startsWith('lychee.deserialize') || str.startsWith('_lychee.deserialize')) {

				if (str.includes('lychee.serialize(')) {

					let tmp = str.split(/lychee\.deserialize\(lychee\.serialize\(([A-Za-z0-9_.]+)\)\)/g);
					if (tmp.length > 2) {

						value = {
							'reference': tmp[1],
							'arguments': []
						};

					}

				} else {

					let tmp = str.split(/lychee\.deserialize\(([A-Za-z0-9_.]+)\)/g);
					if (tmp.length > 2) {
						value = {};
					}

				}

			} else if (str.startsWith('lychee.assignsafe') || str.startsWith('_lychee.assignsafe')) {

				value = {};

			} else if (str.startsWith('lychee.assignunlink') || str.startsWith('_lychee.assignunlink')) {

				value = {};

			} else if (str.startsWith('lychee.diff') || str.startsWith('_lychee.diff')) {

				value = {};

			} else if (str.startsWith('lychee.enumof') || str.startsWith('_lychee.enumof')) {

				let tmp = str.split(/lychee\.enumof\(Composite\.([A-Z]+),(.*)\)/g);
				if (tmp.length > 2) {
					value = 'Composite.' + tmp[1];
				}

			} else if (str.startsWith('lychee.import') || str.startsWith('_lychee.import')) {

				let tmp = str.split(/lychee\.import\('([A-Za-z0-9_.]+)'\)/g);
				if (tmp.length > 2) {

					value = {
						'reference': tmp[1],
						'arguments': []
					};

				}

			} else if (str.startsWith('lychee.interfaceof') || str.startsWith('_lychee.interfaceof')) {

				if (str.indexOf(':') !== -1) {

					let tmp = str.split(':').pop();
					if (tmp.endsWith(';')) {
						tmp = tmp.substr(0, tmp.length - 1);
					}

					value = _detect_value(tmp.trim());

				} else {

					let tmp = str.substr(19, str.indexOf(',') - 19).trim();
					if (tmp.length > 0) {
						value = tmp;
					}

				}

			} else if (str === 'this') {

				value = 'this';

			} else if (str.startsWith('this.')) {

				value = {
					'reference': str,
					'arguments': []
				};

			} else if (str.endsWith(' || null')) {

				let tmp1 = str.substr(0, str.length - 8).trim();

				value = _detect_value(tmp1);

				// XXX: Assume Object || null
				if (value === undefined) {
					value = {};
				}

			} else if (str === 'main') {

				value = {
					'constructor': 'lychee.app.Main',
					'arguments': []
				};

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
				'reference': 'strainer.api.PARSER',
				'blob':      null
			};

		},



		/*
		 * CUSTOM API
		 */

		detect: function(str) {

			str = typeof str === 'string' ? str : 'undefined';


			if (str.startsWith('=')) {
				str = str.substr(1).trim();
			}

			if (str.endsWith(';')) {
				str = str.substr(0, str.length - 1);
			}


			let val = {
				chunk: 'undefined',
				type:  'undefined'
			};



			// XXX: This is explicitely to prevent parser
			// from endless looping while parsing itself

			val.chunk = str;
			val.type  = _detect_type(str);

			if (val.type === 'function') {

				val.hash       = Module.hash(str);
				val.memory     = Module.memory(str);
				val.parameters = Module.parameters(str);
				val.values     = Module.values(str);

			} else {

				val.hash  = Module.hash(str);
				val.value = _detect_value(str);

			}


			let dictionary = [];

			if (
				val.chunk !== 'undefined'
				&& val.chunk.includes('.') === false
				&& val.value === undefined
			) {

				dictionary = _DICTIONARY.filter(other => {

					if (val.chunk.startsWith(other.chunk)) {

						if (other.type !== undefined) {

							if (val.type === 'undefined' || val.type === other.type) {
								return true;
							}

						} else if (other.types !== undefined) {

							if (val.type === 'undefined' || other.types.includes(val.type)) {
								return true;
							}

						}

					}

					return false;

				}).sort((a, b) => {
					if (a.chunk.length === b.chunk.length) return -1;
					if (a.chunk.length !== b.chunk.length) return  1;
					return 0;
				});

			} else if (
				val.chunk !== 'undefined'
				&& val.chunk.startsWith('global')
				&& val.value === undefined
			) {

				let reference = val.chunk.split('.').slice(1).join('.');
				let platform  = null;
				let pointer   = null;

				for (let p = 0, pl = _PLATFORMS.length; p < pl; p++) {

					platform = _PLATFORMS[p];

					if (_FEATURES[platform] !== undefined) {

						pointer = _resolve_reference.call(_FEATURES[platform], reference);

						if (pointer !== null) {
							break;
						}

					}

				}


				if (pointer !== null) {

					let resolved = _resolve_value(pointer);
					if (resolved.type !== 'undefined') {

						val.value = resolved.value;
						val.type  = resolved.type;
						val.chunk = resolved.chunk;

					}

				} else {

					console.warn('strainer.api.PARSER: Could not resolve "' + reference + '" via feature detection.');

				}

			} else if (
				val.chunk !== 'undefined'
				&& val.value === undefined
			) {

				dictionary = _DICTIONARY.filter(other => {

					if (val.chunk === other.chunk) {

						if (other.type !== undefined) {

							if (val.type === 'undefined' || val.type === other.type) {
								return true;
							}

						} else if (other.types !== undefined) {

							if (val.type === 'undefined' || other.types.includes(val.type)) {
								return true;
							}

						}

					}

					return false;

				}).sort((a, b) => {
					if (a.chunk.length === b.chunk.length) return -1;
					if (a.chunk.length !== b.chunk.length) return  1;
					return 0;
				});

			}


			let entry = dictionary[0] || null;
			if (entry !== null) {

				if (entry.type !== undefined && entry.value !== undefined) {

					val.type  = entry.type;
					val.value = entry.value;

				} else if (entry.types !== undefined && entry.values !== undefined) {

					val.type  = entry.types[0];
					val.value = entry.values[0];

				}


				if (val.chunk !== entry.chunk) {

					if (lychee.debug === true) {
						console.info('strainer.api.PARSER: Fuzzy guessing for "' + val.chunk + '" with "' + entry.chunk + '".');
					}

				}

			}


			return val;

		},

		enum: function(code) {

			code = typeof code === 'string' ? code : '';


			let enam  = { name: undefined };
			let lines = code.split('\n');
			let first = lines[0].trim();

			if (first.includes('=')) {
				enam.name = first.substr(0, first.indexOf('=')).trim();
			}


			// XXX: Multi-Line Enum
			if (first.endsWith('{')) {

				enam.values = [];
				lines.shift();


				lines.filter(line => {

					if (line.includes(':')) {

						let tmp = line.trim();
						if (tmp.startsWith('//') === false) {
							return true;
						}

					}

					return false;

				}).map(line => {

					let i1 = line.indexOf(':');
					let i2 = line.indexOf(',', i1);

					if (i2 === -1) i2 = line.length;

					let key = line.substr(0, i1).trim();
					let val = line.substr(i1 + 2, i2 - i1 - 2).trim();

					if (key.startsWith('\'')) key = key.substr(1);
					if (key.endsWith('\''))   key = key.substr(0, key.length - 1);


					return {
						name:  key,
						value: Module.detect(val)
					};

				}).forEach(val => {

					if (val.value.type !== 'undefined') {

						enam.values.push(val);

					} else {

						if (lychee.debug === true) {
							console.warn('strainer.api.PARSER: No valid enum value "' + enam.value.chunk + '" for "' + enam.name + '".');
						}

					}

				});


			// XXX: Single-Line Enum
			} else {

				let tmp = lines.join(' ').trim();
				let i1  = tmp.indexOf('=');
				let i2  = tmp.indexOf(';', i1);

				if (i2 === -1) i2 = tmp.length;

				let val = tmp.substr(i1 + 2, i2 - i1 - 2).trim();

				enam.value = Module.detect(val);

			}


			return enam;

		},

		events: function(code) {

			code = typeof code === 'string' ? code : '';


			let events = [];
			let lines  = code.split('\n');
			let first  = lines[0].trim();
			let last   = lines[lines.length - 1].trim();


			if (first.startsWith('function(') && first.endsWith(') {')) {
				lines.shift();
			}

			if (last.endsWith('}')) {
				lines.pop();
			}


			lines.map(line => line.trim()).filter(line => {

				if (
					line.includes('that.trigger(')
					|| line.includes('this.trigger(')
				) {
					return true;
				}

			}).map(line => {

				let chunk = line.trim();

				let i1 = chunk.indexOf('trigger(');
				let i2 = chunk.indexOf(');');

				if (i2 !== -1) {
					chunk = chunk.substr(i1 + 8, i2 - i1 - 8).trim();
				} else {
					chunk = line.substr(i1 + 8) + _get_chunk(line, ');', code);
					chunk = chunk.substr(0, chunk.length - 2).trim();
				}

				if (chunk.includes(',')) {

					let tmp1 = chunk.split(',')[0].trim();
					let tmp2 = chunk.split(',').slice(1).join(',').trim();
					let tmp3 = [];

					if (tmp1.startsWith('\'')) tmp1 = tmp1.substr(1);
					if (tmp1.endsWith('\''))   tmp1 = tmp1.substr(0, tmp1.length - 1);

					if (tmp2.startsWith('[') && tmp2.endsWith(']')) {

						tmp2.substr(1, tmp2.length - 2).split(',').forEach(val => {
							tmp3.push(Module.detect(val.trim()));
						});

					}

					let code = 'function(' + tmp3.map(p => p.chunk).join(', ') + ') {}';
					let hash = Module.hash(code);

					return {
						chunk:      code,
						name:       tmp1,
						type:       'event',
						hash:       hash,
						parameters: tmp3
					};

				} else {

					let tmp1 = chunk;

					if (tmp1.startsWith('\'')) tmp1 = tmp1.substr(1);
					if (tmp1.endsWith('\''))   tmp1 = tmp1.substr(0, tmp1.length - 1);

					let code = 'function() {}';
					let hash = Module.hash(code);

					return {
						chunk:      code,
						name:       tmp1,
						type:       'event',
						hash:       hash,
						parameters: []
					};

				}

			}).forEach(val => {

				if (val.parameters.length > 0) {

					val.parameters.forEach(param => {

						let chunk = param.chunk;
						let type  = param.type;

						if (type === 'undefined' && /^([A-Za-z0-9]+)$/g.test(chunk)) {

							let mutations = Module.mutations(chunk, code);
							if (mutations.length > 0) {

								let val = mutations.find(mutation => mutation.type !== 'undefined');
								if (val !== undefined) {

									param.type  = val.type;
									param.value = val.value;

								}

							} else {

								if (lychee.debug === true) {
									console.warn('strainer.api.PARSER: No traceable mutations for parameter "' + chunk + '".');
								}

							}

						}

					});

				}


				events.push(val);

			});


			return events;

		},

		find: function(key, code) {

			key  = typeof key === 'string'  ? key  : null;
			code = typeof code === 'string' ? code : null;


			if (key !== null && code !== null) {

				let str0 = 'const ' + key;
				let i0   = code.indexOf(str0);
				let i1   = code.indexOf('\n', i0);


				if (i0 === -1) {
					str0 = 'let   ' + key;
					i0   = code.indexOf(str0);
					i1   = code.indexOf('\n', i0);
				}

				if (i0 === -1) {
					str0 = 'let ' + key;
					i0   = code.indexOf(str0);
					i1   = code.indexOf('\n', i0);
				}


				if (i0 !== -1 && i1 !== -1) {

					let tmp1 = code.substr(i0 + str0.length, i1 - str0.length - i0).trim();
					if (
						tmp1.startsWith('=')
						&& tmp1.endsWith(';')
					) {

						return tmp1.substr(1, tmp1.length - 2).trim();

					} else if (
						tmp1.startsWith('=')
						&& tmp1.includes('(function(')
						&& tmp1.endsWith('{')
					) {

						let str2 = '\n\t})';
						let str3 = ');\n';
						let i2   = code.indexOf(str2, i0);
						let i3   = code.indexOf(str3, i2);

						if (i2 !== -1 && i3 !== -1) {

							let tmp2 = code.substr(i0 + str0.length, i3 - str0.length - i0 + str3.length).trim();
							if (tmp2.startsWith('=') && tmp2.endsWith(';')) {
								return tmp2.substr(1, tmp2.length - 2).trim();
							}

						}

					} else if (
						tmp1.startsWith('=')
						&& tmp1.endsWith('{')
					) {

						let str2 = '\n\t};';
						let i2   = code.indexOf(str2, i0);
						if (i2 !== -1) {

							let tmp2 = code.substr(i0 + str0.length, i2 - str0.length - i0 + str2.length).trim();
							if (tmp2.startsWith('=') && tmp2.endsWith(';')) {

								return tmp2.substr(1, tmp2.length - 2).trim();

							}

						}

					}

				}

			}


			return 'undefined';

		},

		hash: function(code) {

			code = typeof code === 'string' ? code : '';


			let hash = new _MURMUR();

			hash.update(code);

			return hash.digest().toString('hex');

		},

		indent: function(code, indent) {

			code   = typeof code === 'string'   ? code   : '';
			indent = typeof indent === 'string' ? indent : '';


			if (indent !== '') {

				let lines = code.split('\n');

				for (let l = 0, ll = lines.length; l < ll; l++) {

					let line = lines[l].trim();
					if (line !== '') {
						line = indent + lines[l];
					}

					lines[l] = line;

				}

				// TODO: Figure out smarter way to do this for all cases
				// this removes too-many indents from first and last line
				// \tfunction(what, ever) { -> function(what, ever) {
				// \t\tstatement;           -> \t\tstatement;
				// \t}                      -> }
				lines[0]                = indent + lines[0].trim();
				lines[lines.length - 1] = indent + lines[lines.length - 1].trim();

				return lines.join('\n');

			}


			return code;

		},

		memory: function(code) {

			code = typeof code === 'string' ? code : '';


			let lines      = code.split('\n');
			let memory     = [];
			let is_comment = false;
			let first      = lines[0].trim();
			let last       = lines[lines.length - 1].trim();


			if (
				(first.startsWith('function(') || first.startsWith('(function('))
				&& first.endsWith(') {')
			) {
				lines.shift();
			}

			if (last.endsWith('}')) {
				lines.pop();
			}


			lines.map(line => line.trim()).filter(line => {

				if (line.startsWith('//')) {
					return false;
				} else if (line.startsWith('/*')) {
					is_comment = true;
					return false;
				} else if (line.endsWith('*/')) {
					is_comment = false;
					return false;
				} else if (is_comment === true) {
					return false;
				}


				let result = false;

				if (line.startsWith('_')) {

					result = true;

				} else if (line.includes('=')) {

					let tmp = line.substr(line.indexOf('=') + 1).trim();
					if (tmp.startsWith('_')) {
						result = true;
					}

				} else if (line.includes(':')) {

					let tmp = line.substr(line.indexOf(':') + 1).trim();
					if (tmp.startsWith('_')) {
						result = true;
					}

				} else if (line.includes('new _')) {

					result = true;

				} else if (line.includes('return _')) {

					result = true;

				} else if (line.includes('(_')) {

					result = true;

				} else if (line.includes(', _')) {

					result = true;

				}

				return result;

			}).map(line => {

				if (line.startsWith('_')) {

					return _resolve_variable(line);

				} else if (line.includes('=')) {

					let tmp = line.substr(line.indexOf('=') + 1).trim();
					if (tmp.startsWith('_')) {
						return _resolve_variable(tmp);
					}

				} else if (line.includes(':')) {

					let tmp = line.substr(line.indexOf(':') + 1).trim();
					if (tmp.startsWith('_')) {
						return _resolve_variable(tmp);
					}

				} else if (line.includes('new _')) {

					let tmp = line.substr(line.indexOf('new ') + 4).trim();
					if (tmp.startsWith('_')) {
						return _resolve_variable(tmp);
					}

				} else if (line.includes('return _')) {

					let tmp = line.substr(line.indexOf('return ') + 7).trim();
					if (tmp.startsWith('_')) {
						return _resolve_variable(tmp);
					}

				} else if (line.includes('(_')) {

					let tmp = line.substr(line.indexOf('(_') + 1).trim();
					if (tmp.startsWith('_')) {
						return _resolve_variable(tmp);
					}

				} else if (line.includes(', _')) {

					let tmp = line.substr(line.indexOf(', _') + 2).trim();
					if (tmp.startsWith('_')) {
						return _resolve_variable(tmp);
					}

				}


				return null;

			}).forEach(variable => {

				if (variable !== null) {

					if (memory.includes(variable) === false) {
						memory.push(variable);
					}
				}

			});


			memory = memory.sort();


			return memory;

		},

		mutations: function(name, code) {

			name = typeof name === 'string' ? name : 'undefined_variable';
			code = typeof code === 'string' ? code : '';


			let mutations = [];
			let lines     = code.split('\n');


			lines.filter(line => {

				if (line.endsWith(';') || line.endsWith('= {')) {

					let i1 = line.indexOf(name);
					let i2 = line.indexOf('=', i1);
					let i3 = line.indexOf('.', i1);
					let i4 = line.indexOf('[', i1);

					if (
						i1 !== -1
						&& i2 !== -1
						&& (i3 === -1 || i3 > i2)
						&& (i4 === -1 || i4 > i2)
					) {
						return true;
					}

				}

				return false;

			}).map(line => {

				let tmp = line.trim();
				if (tmp.endsWith(' = {')) {

					let chunk = _get_chunk(line, '};', code);
					if (chunk !== 'undefined') {
						return tmp + chunk;
					}

				}

				return tmp;

			}).map(line => {

				let i1 = line.indexOf('=');
				let i2 = line.indexOf(';', i1);
				if (i2 === -1) {
					i2 = line.length;
				}

				return line.substr(i1 + 2, i2 - i1 - 2);

			}).map(chunk => {
				return Module.detect(chunk);
			}).filter(val => {

				let chunk = val.chunk;
				let type  = val.type;

				if (type !== 'undefined' || chunk.startsWith('_') || chunk.startsWith('this.')) {
					return true;
				}

				return false;

			}).forEach(val => mutations.push(val));


			return mutations;

		},

		outdent: function(code, outdent) {

			code    = typeof code === 'string'    ? code    : '';
			outdent = typeof outdent === 'string' ? outdent : '';

			if (outdent !== '') {

				let lines = code.split('\n');

				for (let l = 0, ll = lines.length; l < ll; l++) {

					let line = lines[l].trim();
					if (line !== '' && lines[l].startsWith(outdent)) {
						line = lines[l].substr(outdent.length);
					}

					lines[l] = line;

				}

				return lines.join('\n');

			}


			return code;

		},

		parameters: function(code) {

			code = typeof code === 'string' ? code : '';


			let parameters = [];
			let lines      = code.split('\n');
			let first      = lines[0].trim();
			let last       = lines[lines.length - 1].trim();

			if (
				(first.startsWith('function(') || first.startsWith('(function('))
				&& first.endsWith(') {')
			) {

				lines.shift();

				let tmp1 = first.split(/function\((.*)\)/g);
				if (tmp1.length > 1) {

					let tmp2 = tmp1[1].trim();
					if (tmp2.length > 0) {

						tmp2.split(',').forEach(val => {

							parameters.push({
								chunk: null,
								name:  val.trim(),
								type:  'undefined',
								value: undefined
							});

						});

					}

				}

			}

			if (last.endsWith('}')) {
				lines.pop();
			}


			lines.map(line => line.trim()).filter(line => {

				if (
					line === ''
					|| line.startsWith('//')
					|| line.startsWith('/*')
					|| line.startsWith('*/')
					|| line.startsWith('*')
				) {
					return false;
				}

				return true;

			}).forEach(line => {

				parameters.forEach(param => {

					if (line.startsWith(param.name) && line.includes('=')) {

						let tmp = line.substr(line.indexOf('=') + 1).trim();
						let val = Module.detect(tmp);

						if (val.type !== 'undefined') {

							if (param.type === val.type) {

								if (param.value === undefined) {
									param.chunk = val.chunk;
									param.value = val.value;
								}

							} else if (param.type === 'undefined') {

								param.chunk = val.chunk;
								param.type  = val.type;
								param.value = val.value;

							}

						}

					}

				});

			});


			return parameters;

		},

		states: function(code) {

			code = typeof code === 'string' ? code : '';


			let states = {};
			let lines  = code.split('\n');
			let first  = lines[0].trim();
			let last   = lines[lines.length - 1].trim();

			if (first.startsWith('function(') && first.endsWith(') {')) {
				lines.shift();
			}

			if (last.endsWith('}')) {
				lines.pop();
			}


			lines.map(line => line.trim()).filter(line => {

				if (
					line === ''
					|| line.startsWith('//')
					|| line.startsWith('/*')
					|| line.startsWith('*/')
					|| line.startsWith('*')
				) {
					return false;
				}

				return true;

			}).forEach(line => {

				if (line.startsWith('this.set') && line.includes('states.')) {

					let tmp = line.split(/\(states\.([A-Za-z]+)\);/g);
					if (tmp.pop() === '') {
						states[tmp[1]] = tmp[0].split('.').pop();
					}

				}

			});


			return states;

		},

		values: function(code) {

			code = typeof code === 'string' ? code : '';


			let candidates = [];
			let values     = [];
			let lines      = code.split('\n');
			let is_comment = false;
			let nest_level = 0;
			let first      = lines[0].trim();
			let last       = lines[lines.length - 1].trim();

			if (
				(first.startsWith('function(') || first.startsWith('(function('))
				&& first.endsWith(') {')
			) {
				lines.shift();
			}

			if (last.endsWith('}')) {
				lines.pop();
			}


			lines.map(line => line.trim()).filter(line => {

				if (line.startsWith('//')) {
					return false;
				} else if (line.startsWith('/*')) {
					is_comment = true;
					return false;
				} else if (line.endsWith('*/')) {
					is_comment = false;
					return false;
				} else if (is_comment === true) {
					return false;
				}


				let result = false;

				// XXX: Following algorithm crashes itself
				if (
					!line.includes('line.includes(')
					&& !line.includes('line.endsWith(')
				) {

					if (
						(line.includes('(function') && line.endsWith('{'))
						|| (line.includes(', function') && line.endsWith('{'))
						|| line.endsWith('=> ({')
						|| line.endsWith('=> {')
					) {

						if (
							!line.includes('})')
							&& !line.includes('}, function')
							&& line !== '}, {'
						) {

							if (line.startsWith('return ')) {
								result = true;
							}

							nest_level++;

						}

					}


					if (
						line.startsWith('}')
						&& (
							line.includes(').')
							|| line.endsWith(')')
							|| line.endsWith(');')
							|| line.endsWith('}.bind(this));')
							|| line.endsWith(') || null;')
							|| line.endsWith(';')
						)
					) {

						if (
							!line.includes('(function')
							&& !line.includes('({')
							&& !line.endsWith(') {')
						) {

							if (nest_level > 0) {
								nest_level--;
							}

						}

					}

				}


				if (result === false && nest_level === 0 && line.includes('return ')) {
					result = true;
				}


				return result;

			}).map(line => {

				let chunk = line.trim();

				let i1 = chunk.indexOf('return ');
				let i2 = chunk.indexOf(';', i1);
				if (i2 !== -1) {
					return Module.detect(chunk.substr(i1 + 7, i2 - i1 - 7).trim());
				}

				chunk = line.substr(i1 + 7) + ' ' + _get_chunk(line, ';', code);
				chunk = chunk.substr(0, chunk.length - 1);

				return Module.detect(chunk.trim());

			}).forEach(val => {

				let chunk = val.chunk;
				let type  = val.type;
				let value = val.value;

				if (type === 'undefined' && /^([A-Za-z0-9]+)$/g.test(chunk)) {

					let mutations = Module.mutations(chunk, code);
					if (mutations.length > 0) {

						mutations.forEach(mutation => {

							candidates.push({
								chunk: mutation.chunk,
								type:  mutation.type,
								value: mutation.value
							});

						});

					} else {

						if (lychee.debug === true) {
							console.warn('strainer.api.PARSER: No traceable mutations for value "' + chunk + '".');
						}

					}

				} else if (type !== 'undefined' || chunk.startsWith('_') || chunk.startsWith('this.')) {

					candidates.push({
						chunk: chunk,
						type:  type,
						value: value
					});

				} else {

					if (lychee.debug === true) {
						console.warn('strainer.api.PARSER: No traceable values for "' + chunk + '".');
					}

				}

			});


			candidates.forEach(val => {

				let found = values.find(other => {

					let otype = other.type;
					if (otype === val.type) {

						if (otype === 'Array' || otype === 'Object') {
							return lychee.diff(other.value, val.value) === false;
						} else {
							return other.value === val.value;
						}

					}

					return false;

				}) || null;

				if (found === null) {
					values.push(val);
				}

			});


			return values;

		}

	};


	return Module;

});

