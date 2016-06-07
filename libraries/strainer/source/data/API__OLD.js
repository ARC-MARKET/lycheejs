
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

					val = lychee.extend({}, property.values[0]);

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

	var _parse_enums = function(code) {

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

	var _parse_events = function(code) {

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

	var _parse_properties = function(code) {

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

	var _parse_methods = function(code) {

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

						} else {

							if (lychee.debug === true) {
								console.error('parse method param', method, key, line);
							}

						}

					}

				});


				if (typ !== undefined && val !== undefined) {

					var param = params.find(function(value) {
						return value.name === key;
					}) || null;

					if (param !== null) {

						param.type = typ;

						if (param.values.indexOf(val) === -1) {
							param.values.push(val);
						}

					}

				}

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
	 * IMPLEMENTATION
	 */

	var Class = function(identifier, code) {

		identifier = typeof identifier === 'string'                ? identifier : '';
		code       = code.trim().substr(0, 13) === 'lychee.define' ? code       : '';


		this.identifier = identifier;

		this.enums      = {};
		this.events     = {};
		this.properties = {};
		this.methods    = {};


		_parse_enums.call(this,      code);
		_parse_events.call(this,     code);
		_parse_properties.call(this, code);
		_parse_methods.call(this,    code);

	};


	Class.prototype = {

		toJSON: function() {

		},

		toMD: function() {

			var identifier = this.identifier;
			var that       = this;
			var markdown   = [];
			var data       = {
				introduction: '',
				enums:        {},
				events:       {},
				properties:   {},
				methods:      {}
			};


			(function() {

				var code     = '={constructor}\n';
				var settings = Object.values(that.properties).filter(function(property) {
					return property.setting === true;
				});


				if (settings.length > 0) {

					code += '\n';
					code += '```javascript-constructor\n';
					code += 'new ' + identifier + '(settings);\n';
					code += '```\n';
					code += '\n';

					code += 'This implementation returns an instance of `' + identifier + '`.\n';
					code += 'The `settings` object consists of the following properties:\n';
					code += '\n';

					code += '\n' + settings.map(function(property) {

						var chunk  = '- `(' + property.type + ') ' + property.name + '`';
						var method = 'set' + property.name.charAt(0).toUpperCase() + property.name.substr(1);

						if (property.method === true) {
							chunk += ' which will be passed to [' + method + '](#methods-' + method + ')';
						}

						return chunk + '.';

					}).join('\n') + '\n';


					var example_settings = settings.map(function(property) {

						return {
							name:  property.name,
							value: _readable_value.call(that, property, true)
						};

					});

					var pretty_length = Math.max.apply(null, example_settings.map(function(property) {
						return property.name.length;
					}));


					code += '\n';
					code += '```javascript\n';
					code += 'var settings = {\n';
					code += example_settings.map(function(setting) {
						var ws = _WHITESPACE.slice(0, pretty_length - setting.name.length);
						return '\t' + setting.name + ': ' + ws + setting.value;
					}).join(',\n') + '\n';
					code += '};\n';
					code += 'var instance = new ' + identifier + '(settings);\n';
					code += '```\n';
					code += '\n';

				} else {

					code += '```javascript-constructor\n';
					code += '' + identifier + ';\n';
					code += '```\n';
					code += '\n';

					code += 'This implementation is a Module and has no constructor.\n';
					code += '\n';

					code += '\n';
					code += '```javascript\n';
					code += '' + identifier + '; // ' + identifier + ' reference\n';
					code += '```\n';
					code += '\n';

				}


				code += '\n';
				code += '#### Implementation Notes\n';
				code += '\n';
				code += 'TODO: IMPLEMENTATION NOTES\n';


				data.introduction = code;

			})();

			Object.values(this.enums).forEach(function(enam) {

				var code = '={enums-' + enam.name + '}\n';

				code += '\n';
				code += '```javascript-enum\n';
				code += '(Enum) ' + identifier + '.' + enam.name + ';\n';
				code += '```\n';
				code += '\n';

				code += 'The `(Enum) ' + enam.name + '` enum consists of the following properties:\n';
				code += '\n';

				code += '\n' + enam.values.map(function(value) {
					return '- `(' + value.type + ') ' + value.name + '` reflects (TODO: DESCRIPTION).';
				}).join('\n') + '\n';


				code += '\n';
				code += 'If the instance is set to (TODO: DESCRIPTION).\n';


				data.enums[enam.name] = code;

			});

			Object.values(this.events).forEach(function(event) {

				var params = _readable_params(event.params) || 'void';
				var code   = '={events-' + event.name + '}\n';

				code += '\n';
				code += '```javascript-event\n';
				code += 'new ' + identifier + '().bind(\'' + event.name + '\', function(' + params + ') {}, scope);\n';
				code += '```\n';
				code += '\n';

				code += 'The `' + event.name + '` event is triggered on (TODO: CALLS).\n';
				code += '\n';

				code += '\n' + event.params.map(function(param) {
					return '- `(' + param.type + ') ' + param.name + '` is the (TODO: DESCRIPTION).';
				}).join('\n') + '\n';


				code += '\n';
				code += 'If the instance is set to (TODO: DESCRIPTION).\n';

				code += '\n';
				code += '```javascript\n';
				code += 'var instance = new ' + identifier + '();\n';
				code += '\n';
				code += 'instance.bind(function(' + params + ') {\n';
				code += '\tconsole.log(' + params + ');\n';
				code += '}, this);\n';
				code += '```\n';


				data.events[event.name] = code;

			});

			Object.values(this.properties).forEach(function(property) {

				var enam   = that.enums[property.name.toUpperCase()] || null;
				var event  = that.events[property.name] || null;
				var method = that.methods['set' + property.name.charAt(0).toUpperCase() + property.name.substr(1)] || null;
				var type   = _readable_type(property.type) || 'void';
				var code   = '={properties-' + property.name + '}\n';


				code += '\n';
				code += '```javascript-property\n';
				code += '(' + type + ') new ' + identifier + '().' + property.name + ';\n';
				code += '```\n';
				code += '\n';

				code += 'The `(' + property.type + ') ' + property.name + '` property is (TODO: DESCRIPTION).\n';
				code += '\n';


				if (enam !== null) {
					code += 'It is part of the [' + enam.name + '](#enums-' + enam.name + ') enum.\n';
					code += '\n';
				}

				if (event !== null) {
					code += 'It influences the [' + event.name + '](#events-' + event.name + ') event.\n';
					code += '\n';
				}


				var default_value = _readable_value.call(that, property, true);
				var example_value = _readable_value.call(that, property, false);


				if (property.setting === true && property.method === true) {

					code += 'It is set via `settings.' + property.name + '` in the [constructor](#constructor) or via [' + method.name + '](#methods-' + method.name + ').\n';
					code += '\n';

					code += '```javascript\n';
					code += 'var instance = new ' + identifier + '({\n';
					code += '\t' + property.name + ': ' + default_value + '\n';
					code += '});\n';
					code += '\n';
					code += 'instance.' + property.name + '; // ' + default_value + '\n';
					code += 'instance.' + method.name + '(' + example_value + '); // true\n';
					code += 'instance.' + property.name + '; // ' + example_value + '\n';
					code += '```\n';

				} else if (property.setting === true) {

					code += 'It is set via `settings.' + property.name + '` in the [constructor](#constructor).\n';
					code += '\n';

					code += '```javascript\n';
					code += 'var instance = new ' + identifier + '({\n';
					code += '\t' + property.name + ': ' + default_value + '\n';
					code += '});\n';
					code += '\n';
					code += 'instance.' + property.name + '; // ' + default_value + '\n';
					code += 'instance.' + property.name + ' = ' + example_value + ';\n';
					code += 'instance.' + property.name + '; // ' + example_value + '\n';
					code += '```\n';

				} else if (property.method === true) {

					code += 'It is set via via [' + method.name + '()](#methods-' + method.name + ').\n';
					code += '\n';

					code += '```javascript\n';
					code += 'var instance = new ' + identifier + '();\n';
					code += '\n';
					code += 'instance.' + property.name + '; // ' + default_value + '\n';
					code += 'instance.' + method.name + '(' + example_value + '); // true\n';
					code += 'instance.' + property.name + '; // ' + example_value + '\n';
					code += '```\n';

				} else {

					code += '```javascript\n';
					code += 'var instance = new ' + identifier + '();\n';
					code += '\n';
					code += '// TODO: DEMO CODE\n';
					code += '```\n';

				}


				data.properties[property.name] = code;

			});

			Object.values(this.methods).forEach(function(method) {

				var params = _readable_params(method.params) || 'void';
				var types  = _readable_types(method.types)   || 'void';
				var code   = '={methods-' + method.name + '}\n';


				code += '\n';
				code += '```javascript-method\n';
				code += '(' + types + ') ' + identifier + '.prototype.' + method.name + '(' + params + ');\n';
				code += '```\n';
				code += '\n';


				var params_list = method.params.map(function(param) {

					var chunk = '- `(' + param.type + ') ' + param.name + '`';

					if (param.type !== undefined) {

						if (param.type.match(/Array|Object/)) {
							chunk += ' is an `' + param.type + ' instance`.';
						} else if (param.type.match(/(lychee\.*)/)) {
							chunk += ' is an `[' + param.type + '](' + param.type + ')` instance.';
						} else if (param.type === 'Boolean') {
							chunk += ' is a flag. If set to `true`, the method will (TODO: DESCRIPTION).';
						} else if (param.type === 'Enum') {
							chunk += ' is an `Enum value` of the `[' + param.name.toUpperCase() + '](#enums-' + param.name.toUpperCase() + ')` enum.';
						} else if (param.type === 'Number') {
							chunk += ' is a number.';
						} else if (param.type === 'String') {
							chunk += ' is a string.';
						}

					}

					if (param.values.length > 0) {
						chunk += ' It is defaulted with `' + param.values[0] + '`.';
					}

					return chunk;

				});


				if (params_list.length !== 0) {
					code += params_list.join('\n') + '\n';
				} else {
					code += '- This method has no arguments\n';
				}


				code += '\n';

				if (types === 'void') {

					code += 'This method returns nothing.\n';
					code += '\n';

				} else if (types === 'Boolean') {

					code += 'This method returns `true` on success and `false` on failure.\n';
					code += '\n';

				} else if (types.indexOf('||') !== -1) {

					var tmp = types.split('||').map(function(val) { return val.trim(); });
					code += 'This method returns `' + tmp[0] +'` on success and `' + tmp[1] + '` on failure.\n';
					code += '\n';

				} else if (method.name.match(/serialize|deserialize/g)) {

					code += 'This method is not intended for direct usage.\n';
					code += 'You can serialize an instance using the [lychee.serialize](lychee#methods-serialize) method.\n';
					code += '\n';

				} else {

					code += 'This method returns `TODO` on success and `TODO` on failure.\n';
					code += '\n';

					if (lychee.debug === true) {
						console.error('describe method', method);
					}

				}


				var example_params = _JSON.decode(_JSON.encode(method.params));

				if (method.name.substr(0, 3) === 'set') {

					example_params.forEach(function(param) {

						if (param.type === 'Object') {

							var property = that.properties[param.name] || null;
							if (property !== null) {
								param.values = property.values;
							}

						}

					});

				}

				var example_values = _readable_values.call(that, example_params, false);


				code += '```javascript\n';
				code += 'var instance = new ' + identifier + '();\n';
				code += '\n';
				code += 'instance.' + method.name + '(' + example_values + '); // true\n';
				code += '```\n';


				data.methods[method.name] = code;

			});


			markdown.push(data.introduction);

			markdown.push.apply(markdown, Object.keys(this.enums).sort().map(function(id) {
				return data.enums[id] || '';
			}));

			markdown.push.apply(markdown, Object.keys(this.events).sort().map(function(id) {
				return data.events[id] || '';
			}));

			markdown.push.apply(markdown, Object.keys(this.properties).sort().map(function(id) {
				return data.properties[id] || '';
			}));

			markdown.push.apply(markdown, [ 'deserialize', 'serialize', 'update', 'render' ].map(function(id) {
				return data.methods[id] || '';
			}));

			markdown.push.apply(markdown, Object.keys(this.methods).filter(function(id) {
				return id.match(/deserialize|serialize|update|render/g) ? false : true;
			}).sort().map(function(id) {
				return data.methods[id] || '';
			}));


			return markdown.filter(function(val) {
				return val !== '';
			}).join('\n\n\n\n');

		}

	};


	return Class;

});

