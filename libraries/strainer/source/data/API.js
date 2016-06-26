
lychee.define('strainer.data.API').exports(function(lychee, global, attachments) {

	var _JSON = {
		encode: JSON.stringify,
		decode: JSON.parse
	};



	/*
	 * HELPERS
	 */

	var _WHITESPACE = new Array(513).join(' ');

	var _readable_params = function(params) {

		var opt = -1;
		var str = '';


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

	var _readable_values = function(properties, force) {

		var that = this;


		if (properties.length > 0) {

			return properties.map(function(property) {
				return _readable_value.call(that, property, force);
			});

		}


		return '';

	};

	var _readable_value = function(property, force) {

		force = force === true;


		var val = undefined;


		switch (property.type) {

			case 'Enum':

				if (force === true && property.values[0] !== undefined) {
					val = property.values[0];
				} else {

					var enam = this.enums[property.name.toUpperCase()];
					if (enam !== undefined) {

						var vals = [].slice.call(enam.values, 1);
						var rand = vals[Math.floor(Math.random() * vals.length)] || null;
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

						var number_values = [ 1337, 137, 13.37, 133.7 ];
						var string_values = [ 'foo', 'bar', 'qux', 'doo' ];

						var org = val[key];
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

	var _readable_types = function(raw) {

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

	var _readable_type = function(raw) {

		if (typeof raw === 'string') {
			return raw;
		}


		return 'void';

	};

	var _dynamic_type = function(raw) {

		var typ = undefined;

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

	var _dynamic_value = function(raw) {

		var val = undefined;

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
		}

		return val;

	};

	var _parse_head_identifier = function(code){

		var that = this;
		var i1   = code.indexOf('lychee.define(') + 14;
		var i2   = code.indexOf(')', i1);
		var id   = null;


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

	var _parse_head_tags = function(code) {

		var that = this;
		var i1   = code.indexOf('.tags(') + 6;
		var i2   = code.indexOf(')', i1);


		var tags = {};


		if (i1 > 6 && i2 > i1) {
			code = code.substr(i1, i2 - i1);
		} else {
			code = '';
		}


		if (code !== '') {

			code.split('\n').map(function(line) {

				line = line.replace('{', '');
				line = line.replace('}', '');


				var tmp = line.trim();
				if (tmp.indexOf(':') !== -1) {

					var key = tmp.split(':')[0].trim();
					var val = tmp.split(':')[1].trim();

					if (val.substr(-1) === ',') {
						val = val.substr(0, val.length - 1);
					}


					var k0 = key.substr(0, 1);
					var k1 = key.substr(-1);
					var v0 = val.substr(0, 1);
					var v1 = val.substr(-1);

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

	var _parse_head_requires = function(code) {

		var that = this;
		var i1   = code.indexOf('.requires(') + 10;
		var i2   = code.indexOf(')', i1);


		var requires = [];


		if (i1 > 10 && i2 > i1) {
			code = code.substr(i1, i2 - i1);
		} else {
			code = '';
		}


		code.split('\n').filter(function(line) {

			var tmp = line.trim();
			if (tmp === '[' || tmp === ']') {
				return false;
			} else if (tmp.substr(0, 2) === '//') {
				return false;
			}


			return true;

		}).forEach(function(line) {

			var tmp = line.trim();
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

	var _parse_head_includes = function(code) {

		var that = this;
		var i1   = code.indexOf('.includes(') + 10;
		var i2   = code.indexOf(')', i1);


		var includes = [];


		if (i1 > 10 && i2 > i1) {
			code = code.substr(i1, i2 - i1);
		} else {
			code = '';
		}


		code.split('\n').filter(function(line) {

			var tmp = line.trim();
			if (tmp === '[' || tmp === ']') {
				return false;
			} else if (tmp.substr(0, 2) === '//') {
				return false;
			}


			return true;

		}).forEach(function(line) {

			var tmp = line.trim();
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

	var _parse_body_enums = function(code) {

		var that = this;
		var i1   = code.indexOf('\n\tvar Class = ') + 14;
		var i2   = code.indexOf('\n\t};', i1 + 14)  +  4;
		var i3   = code.indexOf('\n\tClass.prototype = {');

		var enam   = '';
		var values = [];


		if (i1 > 14 && i2 > i1 && i3 > i2) {
			code = code.substr(i2, i3 - i2);
		} else {
			code = '';
		}


		code.split('\n').filter(function(line) {

			if (line.substr(0, 7) === '\tClass.') {
				return true;
			}

			if (line.substr(0, 3).match('\t\t[a-zA-Z]')) {
				return true;
			}


			return false;

		}).forEach(function(line) {

			if (line.substr(0, 7) === '\tClass.') {

				enam   = line.split('=')[0].split('Class.')[1].trim();
				values = [];

			} else if (line.substr(0, 2) === '\t\t' && line.indexOf(':') !== -1) {

				var key, typ, val;

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

	var _parse_body_events = function(code) {

		var that = this;


		code.split('\n').filter(function(line) {
			return line.indexOf('this.trigger(\'') !== -1;
		}).forEach(function(line) {

			var event  = line.split('this.trigger(\'')[1].split('\'')[0];
			var params = [];

			if (line.indexOf('[') !== -1 && line.indexOf(']') !== -1) {

				var params = line.substr(line.indexOf('[') + 1, line.indexOf(']') - line.indexOf('[') - 1).split(',').map(function(value) {

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

	var _parse_body_properties = function(code) {

		var that = this;
		var i1   = code.indexOf('\n\tvar Class = ') + 14;
		var i2   = code.indexOf('\n\t};', i1)       +  3;


		if (i1 > 14 && i2 > i1) {
			code = code.substr(i1, i2 - i1);
		} else {
			code = '';
		}


		code.split('\n').forEach(function(line) {

			if (line.substr(0, 7) === '\t\tthis\.' && line.indexOf('=') !== -1) {

				var i     = line.indexOf('=');
				var key   = line.substr(7, i - 7).trim();
				var value = line.substr(i + 1, line.indexOf(';', i + 1) - i - 1).trim();
				var val   = undefined;
				var typ   = undefined;

				if (key.substr(0, 2) !== '__') {

					var val = _dynamic_value(value);
					var typ = _dynamic_type(value);

					if (val === undefined) {

						if (value === '_font') {
							val = 'Font';
							typ = 'Font';
						}

						if (value === '_texture') {
							val = 'Texture';
							typ = 'Texture';
						}

						if (value.indexOf('typeof') !== -1) {

							typ = line.split('===')[1].split('?')[0].split('\'')[1];
							typ = typ.charAt(0).toUpperCase() + typ.substr(1);
							val = line.split(':')[1].split(';')[0].trim();
							val = _dynamic_value(val);

						} else if (value.substr(0, 6) === 'Class.') {

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

	var _parse_body_methods = function(code) {

		var that = this;
		var i1   = code.indexOf('\n\tClass.prototype = {') + 21;
		var i2   = code.indexOf('\n\t};', i1)              +  4;
		var i3   = code.indexOf('\n\tvar Module = {')      + 16;
		var i4   = code.indexOf('\n\t};', i3)              +  4;

		var method = '';
		var params = [];
		var types  = [];
		var values = [];


		if (i1 > 21 && i2 > i1) {
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

				var value = line.trim().split('return')[1].split(';')[0].trim();
				if (value.substr(0, 5) === 'this.') {

					// TODO: Resolver for properties?

				} else if (value !== '') {
					values.push(_dynamic_value(value));
					types.push(_dynamic_type(value));
				} else {
					values.push(undefined);
					types.push('void');
				}

			} else if (line.substr(0, 3) === '\t\t\t' && line.indexOf('=') !== -1) {

				var key, typ, val;

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

					}


					if (typ !== undefined && val !== undefined) {

						var data = params.find(function(value) {
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

	var _encode = function() {

// TODO: Encoding from object to string

	};

	var _decode = function(stream) {

		stream = stream.trim().substr(0, 13) === 'lychee.define' ? stream : '';


		var object = {
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


		if (stream.indexOf('return Class;') !== -1) {
			object.TYPE = 'Class';
		} else if (stream.indexOf('return Module;') !== -1) {
			object.TYPE = 'Module';
		}


		_parse_head_identifier.call(object.HEAD, stream);
		_parse_head_tags.call(      object.HEAD, stream);
		_parse_head_requires.call(  object.HEAD, stream);
		_parse_head_includes.call(  object.HEAD, stream);
//		_parse_head_attaches.call(  object.HEAD, stream);
//		_parse_head_supports.call(  object.HEAD, stream);
//		_parse_head_exports.call(   object.HEAD, stream);

		_parse_body_enums.call(     object.BODY, stream);
		_parse_body_events.call(    object.BODY, stream);
		_parse_body_properties.call(object.BODY, stream);
		_parse_body_methods.call(   object.BODY, stream);


		return object;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {

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

				var object = _decode(data);
				if (object !== undefined) {
					return object;
				}

			}


			return null;

		}

	};


	return Module;

});

