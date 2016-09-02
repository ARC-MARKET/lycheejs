
lychee.define('strainer.data.API').exports(function(lychee, global, attachments) {

	const _JSON = {
		encode: JSON.stringify,
		decode: JSON.parse
	};



	/*
	 * HELPERS
	 */

	const _WHITESPACE = new Array(513).join(' ');

	const _readable_params = function(params) {

		let opt = -1;
		let str = '';


		params.forEach(function(param, i) {

			if (param.values.length > 1) {

				if (opt !== -1) {
					opt  = i;
					str += '[';
				}

			}

			str += (i !== 0) ? (', ' + param.name) : ('' + param.name);

		});

		if (opt !== -1) {
			str += ']';
		}


		return str;

	};

	const _readable_values = function(properties, force) {

		let that = this;


		if (properties.length > 0) {

			return properties.map(function(property) {
				return _readable_value.call(that, property, force);
			});

		}


		return '';

	};

	const _readable_value = function(property, force) {

		force = force === true;


		let val = undefined;


		switch (property.type) {

			case 'Enum':

				if (force === true && property.values[0] !== undefined) {
					val = property.values[0];
				} else {

					let enam = this.enums[property.name.toUpperCase()];
					if (enam !== undefined) {

						let vals = [].slice.call(enam.values, 1);
						let rand = vals[Math.floor(Math.random() * vals.length)] || null;
						if (rand !== null) {
							val = this.identifier + '.' + property.name.toUpperCase() + '.' + rand.name;
						}

					}

				}

			break;

			case 'Number':

				if (force === true && property.values[0] !== undefined) {
					val = property.values[0];
				} else {

					if (force === true) {
						val = 137;
					} else {
						val = 1337;
					}

				}

			break;

			case 'Object':

				if (force === true && property.values[0] !== undefined) {
					val = property.values[0];
				} else {

					val = Object.assign({}, property.values[0]);

					Object.keys(val).forEach(function(key, k) {

						let number_values = [ 1337, 137, 13.37, 133.7 ];
						let string_values = [ 'foo', 'bar', 'qux', 'doo' ];

						let org = val[key];
						if (typeof org === 'number') {
							val[key] = number_values[k];
						} else if (typeof org === 'string') {
							val[key] = string_values[k];
						}

					});


				}

				val = _JSON.encode(val);

			break;

			case 'String':

				if (force === true && property.values[0] !== undefined) {
					val = property.values[0];
				} else {

					if (force === true) {
						val = '\"foo\"';
					} else {
						val = '\"bar\"';
					}

				}

			break;

		}


		if (val === undefined) {

			switch (property.name) {

				case 'renderer': val = 'new lychee.Renderer()';       break;
				case 'offsetX':  val = 137;                           break;
				case 'offsetY':  val = 371;                           break;
				case 'clock':    val = 1000;                          break;
				case 'delta':    val = 32;                            break;
				case 'entity':   val = 'new ' + property.type + '()'; break;

			}

		}


		return val;

	};

	const _readable_types = function(raw) {

		if (raw instanceof Array) {

			raw = raw.unique().filter(function(val) {
				return val !== undefined;
			});

			if (raw.length > 0) {
				return raw.join(' || ');
			} else {
				return 'void';
			}

		}


		return 'void';

	};

	const _readable_type = function(raw) {

		if (typeof raw === 'string') {
			return raw;
		}


		return 'void';

	};

	const _dynamic_type = function(raw) {

		let typ = undefined;

		if (raw === 'null') {
			typ = 'null';
		} else if (raw === 'true' || raw === 'false' || raw.match(/found/)) {
			typ = 'Boolean';
		} else if (raw.match(/filtered/) || raw.substr(0, 1) === '[') {
			typ = 'Array';
		} else if (raw.match(/data/) || raw.substr(0, 1) === '{') {
			typ = 'Object';
		} else if (raw.match(/Math|([0-9]+)/)) {
			typ = 'Number';
		} else if (raw.match(/toString/) || raw.substr(0, 1) === '"' || raw.substr(0, 1) === '\'') {
			typ = 'String';
		} else if (raw.match(/object/)) {
			typ = 'Object';
		} else if (raw.match(/result|valid/)) {
			typ = 'Boolean';
		}

		return typ ;

	};

	const _dynamic_value = function(raw) {

		let val = undefined;

		if (raw === 'null') {
			val = null;
		} else if (raw === 'true') {
			val = true;
		} else if (raw === 'false') {
			val = false;
		} else if (raw === '0') {
			val = 0;
		} else if (parseInt(raw, 10).toString() === raw) {
			val = parseInt(raw, 10);
		} else if (parseFloat(raw, 10) == raw) {
			val = parseFloat(raw, 10);
		} else if (raw.substr(0, 2) === '\'#') {
			val = raw.substr(1, raw.indexOf('\'', 1) - 1);
		} else if (raw.substr(0, 1) === '[') {

			try {
				val = eval('(' + raw + ')');
			} catch(e) {
			}

		} else if (raw.substr(0, 1) === '{') {

			try {
				val = eval('(' + raw + ')');
			} catch(e) {
			}

		} else if (raw.substr(0, 1) === '\'') {
			val = raw.substr(1, raw.indexOf('\'', 1) - 1);
		} else if (raw.substr(0, 3) === 'new') {

			let construct = raw.substr(0, raw.indexOf('(')).split(' ')[1].trim();
			if (/Buffer|Font|Music|Sound|Texture|Stuff|/g.test(construct)) {
				val = construct;
			}

		}

		return val;

	};

	const _parse_head_identifier = function(code){

		let that = this;
		let i1   = code.indexOf('lychee.define(') + 14;
		let i2   = code.indexOf(')', i1);
		let id   = null;


		if (i1 > 14 && i2 > i1) {

			id = code.substr(i1, i2 - i1);

			if (id.charAt(0) === '\'') {
				id = id.substr(1, id.length - 2);
			} else if (id.charAt(0) === '"') {
				id = id.substr(1, id.length - 2);
			} else {
				id = null;
			}

		}


		if (id !== null) {
			that.identifier = id;
		}

	};

	const _parse_head_attaches = function(code) {

		let that = this;
		let i1   = code.indexOf('.attaches(') + 10;
		let i2   = code.indexOf(')', i1);


		let attaches = {};


		if (Object.keys(attaches).length > 0) {
			that.attaches = attaches;
		}

	};

	const _parse_head_tags = function(code) {

		let that = this;
		let i1   = code.indexOf('.tags(') + 6;
		let i2   = code.indexOf(')', i1);


		let tags = {};


		if (i1 > 6 && i2 > i1) {
			code = code.substr(i1, i2 - i1);
		} else {
			code = '';
		}


		if (code !== '') {

			code.split('\n').map(function(line) {

				line = line.replace('{', '');
				line = line.replace('}', '');


				let tmp = line.trim();
				if (tmp.indexOf(':') !== -1) {

					let key = tmp.split(':')[0].trim();
					let val = tmp.split(':')[1].trim();

					if (val.substr(-1) === ',') {
						val = val.substr(0, val.length - 1);
					}


					let k0 = key.substr(0, 1);
					let k1 = key.substr(-1);
					let v0 = val.substr(0, 1);
					let v1 = val.substr(-1);

					if (k0 === '\'' && k1 === '\'') {
						key = key.substr(1, key.length - 2);
					} else if (k0 === '"' && k1 === '"') {
						key = key.substr(1, key.length - 2);
					}

					if (v0 === '\'' && v1 === '\'') {
						val = val.substr(1, val.length - 2);
					} else if (v0 === '"' && v1 === '"') {
						val = val.substr(1, val.length - 2);
					}


					return {
						key: key,
						val: val
					};

				} else {

					return null;

				}

			}).filter(function(obj) {
				return obj !== null;
			}).forEach(function(obj) {

				tags[obj.key] = obj.val;

			});

		}


		if (Object.keys(tags).length > 0) {
			that.tags = tags;
		}

	};

	const _parse_head_requires = function(code) {

		let that = this;
		let i1   = code.indexOf('.requires(') + 10;
		let i2   = code.indexOf(')', i1);


		let requires = [];


		if (i1 > 10 && i2 > i1) {
			code = code.substr(i1, i2 - i1);
		} else {
			code = '';
		}


		code.split('\n').filter(function(line) {

			let tmp = line.trim();
			if (tmp === '[' || tmp === ']') {
				return false;
			} else if (tmp.substr(0, 2) === '//') {
				return false;
			}


			return true;

		}).forEach(function(line) {

			let tmp = line.trim();
			if (tmp.substr(tmp.length - 1, 1) === ',') {
				tmp = tmp.substr(0, tmp.length - 1);
			}

			if (tmp.charAt(0) === '\'') {
				tmp = tmp.substr(1, tmp.length - 2);
			} else if (tmp.charAt(0) === '"') {
				tmp = tmp.substr(1, tmp.length - 2);
			}


			if (tmp !== '' && requires.indexOf(tmp) === -1) {
				requires.push(tmp);
			}

		});


		that.requires = requires;

	};

	const _parse_head_includes = function(code) {

		let that = this;
		let i1   = code.indexOf('.includes(') + 10;
		let i2   = code.indexOf(')', i1);


		let includes = [];


		if (i1 > 10 && i2 > i1) {
			code = code.substr(i1, i2 - i1);
		} else {
			code = '';
		}


		code.split('\n').filter(function(line) {

			let tmp = line.trim();
			if (tmp === '[' || tmp === ']') {
				return false;
			} else if (tmp.substr(0, 2) === '//') {
				return false;
			}


			return true;

		}).forEach(function(line) {

			let tmp = line.trim();
			if (tmp.substr(tmp.length - 1, 1) === ',') {
				tmp = tmp.substr(0, tmp.length - 1);
			}

			if (tmp.charAt(0) === '\'') {
				tmp = tmp.substr(1, tmp.length - 2);
			} else if (tmp.charAt(0) === '"') {
				tmp = tmp.substr(1, tmp.length - 2);
			}


			if (tmp !== '' && includes.indexOf(tmp) === -1) {
				includes.push(tmp);
			}

		});


		that.includes = includes;

	};

	const _parse_body_enums = function(code) {

		let that = this;
		let i1   = code.indexOf('\n\tlet Composite = ') + 18;
		let i2   = code.indexOf('\n\t};', i1 + 14) + 4;
		let i3   = code.indexOf('\n\tComposite.prototype = {');

		let enam   = '';
		let values = [];


		if (i1 > 18 && i2 > i1 && i3 > i2) {
			code = code.substr(i2, i3 - i2);
		} else {
			code = '';
		}


		code.split('\n').filter(function(line) {

			if (line.substr(0, 11) === '\tComposite.') {
				return true;
			}

			if (line.substr(0, 3).match('\t\t[a-zA-Z]')) {
				return true;
			}


			return false;

		}).forEach(function(line) {

			if (line.substr(0, 11) === '\tComposite.') {

				enam   = line.split('=')[0].split('Composite.')[1].trim();
				values = [];

			} else if (line.substr(0, 2) === '\t\t' && line.indexOf(':') !== -1) {

				let key, typ, val;

				key = line.substr(0, line.indexOf(':')).trim();
				val = line.split(':')[1].trim();

				if (val.substr(-1) === ',') {
					val = val.substr(0, val.length - 1);
				}

				typ = _dynamic_type(val);
				val = _dynamic_value(val);


				values.push({
					name:  key,
					type:  typ,
					value: val
				});

			}


			if (that.enums[enam] === undefined) {

				that.enums[enam] = {
					name:   enam,
					values: values
				};

			}

		});

	};

	const _parse_body_events = function(code) {

		let that = this;


		code.split('\n').filter(function(line) {
			return line.indexOf('this.trigger(\'') !== -1;
		}).forEach(function(line) {

			let event  = line.split('this.trigger(\'')[1].split('\'')[0];
			let params = [];

			if (line.indexOf('[') !== -1 && line.indexOf(']') !== -1) {

				let params = line.substr(line.indexOf('[') + 1, line.indexOf(']') - line.indexOf('[') - 1).split(',').map(function(value) {

					return {
						name:   value.trim(),
						type:   undefined,
						values: []
					};

				}).filter(function(param) {
					return param.name !== '';
				});

			}


			if (that.events[event] === undefined) {

				that.events[event] = {
					name:   event,
					params: params,
					value:  undefined
				};

			}

		});

	};

	const _parse_body_properties = function(code) {

		let that = this;
		let i1   = code.indexOf('\n\tlet Composite = ') + 18;
		let i2   = code.indexOf('\n\t};', i1) + 3;


		if (i1 > 18 && i2 > i1) {
			code = code.substr(i1, i2 - i1);
		} else {
			code = '';
		}


		code.split('\n').forEach(function(line) {

			if (line.substr(0, 7) === '\t\tthis\.' && line.indexOf('=') !== -1) {

				let i     = line.indexOf('=');
				let key   = line.substr(7, i - 7).trim();
				let value = line.substr(i + 1, line.indexOf(';', i + 1) - i - 1).trim();
				let val   = undefined;
				let typ   = undefined;

				if (key.substr(0, 2) !== '__') {

					let val = _dynamic_value(value);
					let typ = _dynamic_type(value);

					if (val === undefined) {

						if (value === '_font') {
							val = 'Font';
							typ = 'Font';
						}

						if (value === '_TEXTURE') {
							val = 'Texture';
							typ = 'Texture';
						}

						if (value.indexOf('typeof') !== -1) {

							typ = line.split('===')[1].split('?')[0].split('\'')[1];
							typ = typ.charAt(0).toUpperCase() + typ.substr(1);
							val = line.split(':')[1].split(';')[0].trim();
							val = _dynamic_value(val);

						} else if (value.substr(0, 10) === 'Composite.') {

							typ = 'Enum';
							val = value;

						}

					}


					that.properties[key] = {
						name:    key,
						type:    typ,
						setting: code.indexOf('settings.' + key) !== -1,
						method:  code.indexOf('this.set'  + key.charAt(0).toUpperCase() + key.substr(1)) !== -1,
						values:  [ val ]
					};

				}

			}

		});

	};

	const _parse_body_methods = function(code) {

		let that = this;
		let i1   = code.indexOf('\n\tComposite.prototype = {') + 25;
		let i2   = code.indexOf('\n\t};', i1) + 4;
		let i3   = code.indexOf('\n\tlet Module = {') + 16;
		let i4   = code.indexOf('\n\t};', i3) + 4;

		let method = '';
		let params = [];
		let types  = [];
		let values = [];


		if (i1 > 25 && i2 > i1) {
			code = code.substr(i1, i2 - i1);
		} else if (i3 > 16 && i4 > i3) {
			code = code.substr(i3, i4 - i3);
		}


		code.split('\n').filter(function(line) {

			if (line.substr(0, 3).match('\t\t[A-Za-z0-9]') && line.indexOf(': function') !== -1) {
				return true;
			}

			if (line.substr(0, 4).match('\t\t\t[a-z]')) {

				if (line.substr(0, 5) !== '\t\t\tif') {

					if (line.indexOf('===') !== -1 || line.indexOf('?') !== -1) {
						return true;
					}

				}

			}

			if (line.substr(0, 3).match('\t\t\t') && line.indexOf('return') !== -1) {
				return true;
			}


			return false;

		}).forEach(function(line) {

			if (line.substr(0, 2) === '\t\t' && line.indexOf(': function') !== -1) {

				method = line.split(':')[0].trim();
				params = line.substr(line.indexOf('(') + 1, line.indexOf(')') - line.indexOf('(') - 1).split(',').map(function(value) {

					return {
						name:   value.trim(),
						type:   undefined,
						values: []
					};

				}).filter(function(value) {
					return value.name !== '';
				});
				types  = [];
				values = [];

			} else if (line.substr(0, 3) === '\t\t\t' && line.indexOf('return') !== -1) {

				let value = line.trim().split('return')[1].split(';')[0].trim();
				if (value.substr(0, 5) === 'this.') {

					// TODO: Resolver for properties?

					console.info(method, value);

				} else if (value.substr(0, 1) === '_') {

					values.push(true);
					values.push(false);
					types.push('Boolean');

				} else if (value !== '') {

					values.push(_dynamic_value(value));
					types.push(_dynamic_type(value));

				} else {
					values.push(undefined);
					types.push('void');
				}

			} else if (line.substr(0, 3) === '\t\t\t' && line.indexOf('=') !== -1) {

				let key, typ, val;

				params.forEach(function(param) {

					if (line.substr(0, 3 + param.name.length) === '\t\t\t' + param.name) {

						key = line.substr(0, line.indexOf('=')).trim();
						val = undefined;
						typ = undefined;


						if (line.indexOf('typeof') !== -1) {

							typ = line.split('===')[1].split('?')[0].split('\'')[1];
							typ = typ.charAt(0).toUpperCase() + typ.substr(1);
							val = line.split(':')[1].split(';')[0].trim();
							val = _dynamic_value(val);

						} else if (line.indexOf('instanceof') !== -1) {

							typ = line.split('instanceof')[1].split('?')[0].trim();
							val = line.split(':')[1].split(';')[0].trim();
							val = _dynamic_value(val);

						} else if (line.indexOf('lychee.enumof\(') !== -1) {

							typ = 'Enum';
							val = _dynamic_value(line.split(':')[1].split(';')[0].trim());

						} else if (line.indexOf('lychee.interfaceof\(') !== -1) {

							typ = line.split('lychee.interfaceof\(')[1].split(',')[0].trim();
							val = _dynamic_value(line.split(':')[1].split(';')[0].trim());

						} else if (line.indexOf('=== true;') !== -1) {

							typ = 'Boolean';
							val = false;

						} else if (line.indexOf('=== false;') !== -1) {

							typ = 'Boolean';
							val = false;

						} else if (line.indexOf('!== undefined') !== -1) {

							typ = 'Object';
							val = line.split(':')[1].split(';')[0].trim();

						}


						if (typ === undefined && val === undefined) {
							console.warn(method, param.name, line);
						}

					}


					if (typ !== undefined && val !== undefined) {

						let data = params.find(function(value) {
							return value.name === key;
						}) || null;

						if (data !== null) {

							data.type = typ;

							if (data.values.indexOf(val) === -1) {
								data.values.push(val);
							}

						}

					}

				});

			}


			if (that.methods[method] === undefined) {

				that.methods[method] = {
					name:   method,
					params: params,
					types:  types,
					values: values
				};

			}

		});

	};



	/*
	 * ENCODER AND DECODER
	 */

	const _encode = function() {

// TODO: Encoding from object to string

	};

	const _decode = function(stream) {

		stream = stream.trim().substr(0, 13) === 'lychee.define' ? stream : '';


		let object = {
			TYPE: null,
			HEAD: {
				identifier: null,
				tags:       {},
				requires:   [],
				includes:   [],
				attaches:   [],
				supports:   [],
				exports:    null
			},
			BODY: {
				enums:      {},
				events:     {},
				properties: {},
				methods:    {}
			}
		};


		if (stream.indexOf('return Composite;') !== -1) {
			object.TYPE = 'Composite';
		} else if (stream.indexOf('return Module;') !== -1) {
			object.TYPE = 'Module';
		}


		if (stream.length > 0) {

			_parse_head_identifier.call(object.HEAD, stream);
			_parse_head_tags.call(      object.HEAD, stream);
			_parse_head_requires.call(  object.HEAD, stream);
			_parse_head_includes.call(  object.HEAD, stream);
			_parse_head_attaches.call(  object.HEAD, stream);

// TODO: Parser for supports/exports
//			_parse_head_supports.call(  object.HEAD, stream);
//			_parse_head_exports.call(   object.HEAD, stream);

			_parse_body_enums.call(     object.BODY, stream);
			_parse_body_events.call(    object.BODY, stream);
			_parse_body_properties.call(object.BODY, stream);
			_parse_body_methods.call(   object.BODY, stream);

		}


		return object;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Module = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'strainer.data.API',
				'blob':      null
			};

		},

		encode: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				// TODO: This is object to string
				// return stream.toString();

			}


			return null;

		},

		decode: function(data) {

			data = typeof data === 'string' ? data : null;


			if (data !== null) {

				let object = _decode(data);
				if (object !== undefined) {
					return object;
				}

			}


			return null;

		}

	};


	return Module;

});

