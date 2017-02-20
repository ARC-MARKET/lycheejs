
lychee.define('strainer.api.Module').requires([
	'lychee.crypto.MURMUR'
]).exports(function(lychee, global, attachments) {

	const _MURMUR = lychee.import('lychee.crypto.MURMUR');
	const _CONFIG = [];



	/*
	 * FEATURE DETECTION
	 */

	(function(buffer) {

		if (buffer instanceof Array) {

			buffer.forEach(function(entry) {
				_CONFIG.push(entry);
			});

		}

	})(attachments["json"].buffer);



	/*
	 * HELPERS
	 */

	const _get_function_body = function(name, stream) {

		let i1   = stream.indexOf('\n\t\t' + name + ': function(');
		let i2   = stream.indexOf(':', i1);
		let i3   = stream.indexOf('\n\t\t}', i1);
		let body = null;

		if (i1 !== -1 && i2 !== -1 && i3 !== -1) {
			body = stream.substr(i2 + 1, i3 - i2 + 3).trim();
		}

		return body;

	};

	const _get_function_hash = function(str) {

		let hash = new _MURMUR();

		hash.update(str);

		return hash.digest().toString('hex');

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
		try {
			val = eval('(' + str + ')');
		} catch (err) {
		}

		return val;

	};

	const _trace_variable = function(name, body) {

		return body.split('\n').filter(function(line) {
			return line.includes(name + ' = ');
		}).map(function(line) {

			let i1 = line.indexOf('=');
			let i2 = line.indexOf(';', i1);
			if (i2 === -1) {
				i2 = line.length;
			}

			return line.substr(i1 + 2, i2 - i1 - 2);

		}).map(function(value) {

			return {
				type:  _detect_type(value),
				value: _detect_value(value)
			};

		}).filter(function(value) {
			return value.type !== 'undefined';
		});

	};

	const _detect_type = function(str) {

		let type = 'undefined';


		if (str === 'undefined') {
			type = 'undefined';
		} else if (str === 'null') {
			type = 'null';
		} else if (str === 'true' || str === 'false') {
			type = 'Boolean';
		} else if (str.includes('===') && !str.includes('?')) {
			type = 'Boolean';
		} else if (str === '[]' || str.startsWith('[')) {
			type = 'Array';
		} else if (str === '{}' || str.startsWith('{')) {
			type = 'Object';
		} else if (str.startsWith('Composite.')) {
			type = 'Enum';
		} else if (str.startsWith('new Composite')) {
			type = 'Composite';
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
		} else if (str.startsWith('\'\' +') || str.startsWith('"" +')) {
			type = 'String';
		} else if (str.includes('toString')) {
			type = 'String';
		} else if (str.startsWith('0b') || str.startsWith('0x') || str.startsWith('0o') || /^[0-9\.]+$/g.test(str)) {
			type = 'Number';
		} else if (str === 'Infinity') {
			type = 'Number';
		} else if (str.startsWith('(') && str.endsWith(')')) {

			if (str.includes(' + ') && (str.includes('\'') || str.includes('"'))) {
				type = 'String';
			} else if (str.includes(' * ') || str.includes(' / ') || str.includes(' + ') || str.includes(' - ')) {
				type = 'Number';
			}

		} else {

			if (str.includes('instanceof') && str.includes('?') && str.includes(':')) {

				let tmp = str.split(/(.*)instanceof\s([A-Za-z_\.]+)([\s]+)(.*)\?/g);
				if (tmp.length > 2) {
					return tmp[2];
				}

			} else if (str.startsWith('typeof') && str.includes('?') && str.includes(':')) {

				let tmp = str.split(/\(?typeof\s([a-z]+)\s===\s("|')(.*)("|')\s\)?\?(.*)/g);
				if (tmp.length > 5) {


					switch (tmp[3]) {
						case 'undefined': type = 'undefined'; break;
						case 'null':      type = 'null';      break;
						case 'boolean':   type = 'Boolean';   break;
						case 'number':    type = 'Number';    break;
						case 'string':    type = 'String';    break;
						case 'function':  type = 'Function';  break;
						case 'object':    type = 'Object';    break;
						default:          type = 'undefined'; break;
					}

				}


				if (type === 'undefined') {

					let tmp1 = str.split(':').pop();
					if (tmp1.endsWith(';')) {
						tmp1 = tmp1.substr(0, tmp1.length - 1);
					}

					return _detect_type(tmp1.trim());

				}

			} else if (str.includes('!== undefined') && str.includes('?') && str.includes(':')) {

				return 'Object';

			} else if (str.startsWith('lychee.interfaceof')) {

				let tmp = str.split(/lychee.interfaceof\(([A-Za-z_\.]+),(.*)\)/g);
				if (tmp.length > 1) {
					return tmp[1];
				}

			} else if (str.startsWith('lychee.enumof')) {

				return 'Enum';

			} else if (str.startsWith('lychee.assignunlink')) {

				return 'Object';

			} else if (str.startsWith('lychee.diff')) {

				return 'Object';

			} else {

				let entry = _CONFIG.find(function(val) {
					return str.startsWith(val.name);
				});

				if (entry !== undefined) {
					return _clone_value(entry.value);
				}

			}

		}


		return type;

	};

	const _detect_value = function(str) {

		let value = undefined;


		if (str === 'undefined') {
			value = undefined;
		} else if (str === 'null') {
			value = null;
		} else if (str === 'true' || str === 'false') {
			value = str === 'true';
		} else if (str.includes('===') && !str.includes('?')) {
			value = true;
		} else if (str === '[]' || str.startsWith('[')) {
			value = _parse_value(str);
		} else if (str === '{}' || str.startsWith('{')) {
			value = _parse_value(str);
		} else if (str.startsWith('Composite.')) {
			value = str;
		} else if (str.startsWith('new Composite')) {
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
		} else if (str.includes('toString')) {
			value = "<string value>";
		} else if (str.startsWith('0b') || str.startsWith('0x') || str.startsWith('0o') || /^[0-9\.]+$/g.test(str)) {
			value = _parse_value(str);
		} else if (str === 'Infinity') {
			value = Infinity;
		} else if (str.startsWith('(') && str.endsWith(')')) {

			if (str.includes(' + ') && (str.includes('\'') || str.includes('"'))) {
				value = "<string value>";
			} else if (str.includes(' * ') || str.includes(' / ') || str.includes(' + ') || str.includes(' - ')) {
				value = 1337;
			}

		} else {

			if (str.includes('instanceof') && str.includes('?') && str.includes(':')) {

				let tmp = str.split(':').pop();
				if (tmp.endsWith(';')) {
					tmp = tmp.substr(0, tmp.length - 1);
				}

				return _detect_value(tmp.trim());

			} else if (str.startsWith('typeof') && str.includes('?') && str.includes(':')) {

				let tmp = str.split(':').pop();
				if (tmp.endsWith(';')) {
					tmp = tmp.substr(0, tmp.length - 1);
				}

				return _detect_value(tmp.trim());

			} else if (str.includes('!== undefined') && str.includes('?') && str.includes(':')) {

				return {};

			} else if (str.startsWith('lychee.interfaceof')) {

				if (str.indexOf(':') !== -1) {

					let tmp = str.split(':').pop();
					if (tmp.endsWith(';')) {
						tmp = tmp.substr(0, tmp.length - 1);
					}

					return _detect_value(tmp.trim());

				} else {

					let tmp = str.substr(19, str.indexOf(',') - 19).trim();
					if (tmp.length > 0) {
						value = tmp;
					}

				}

			} else if (str.startsWith('lychee.enumof')) {

				let tmp = str.split(/lychee\.enumof\(Composite\.([A-Z]+),(.*)\)/g);
				if (tmp.length > 2) {
					return 'Composite.' + tmp[1];
				}

			} else if (str.startsWith('lychee.assignunlink')) {

				return {};

			} else if (str.startsWith('lychee.diff')) {

				return {};

			} else {

				let entry = _CONFIG.find(function(val) {
					return str.startsWith(val.name);
				});

				if (entry !== undefined) {
					return _clone_value(entry.value);
				}

			}

		}


		return value;

	};

	const _parse_methods = function(methods, properties, stream, errors) {

		let i1 = stream.indexOf('\n\tconst Module =');
		let i2 = stream.indexOf('\n\t};', i1);


		if (i1 !== -1 && i2 !== -1) {

			let last_line   = '';
			let last_name   = null;
			let last_method = null;

			stream.substr(i1, i2 - i1 + 4).trim().split('\n').filter(function(line, l, self) {

				let tmp = line.trim();
				if (tmp === '// deserialize: function(blob) {},') {
					return true;
				} else if (tmp === '' || tmp.startsWith('//')) {
					return false;
				} else if (tmp.startsWith('/*') || tmp.startsWith('*/') || tmp.startsWith('*')) {
					return false;
				}

				return true;

			}).slice(1, -1).forEach(function(line, l) {

				if (line.includes('function(')) {

					let tmp1 = line.trim();
					if (tmp1.startsWith('//')) {
						tmp1 = tmp1.substr(2).trim();
					}

					let tmp2 = tmp1.split(/"?'?([A-Za-z]+)"?'?:\sfunction\((.*)\)/g);
					let tmp3 = tmp2.pop();

					if (tmp3 === ' {' || tmp3 === ' {},') {

						let body = _get_function_body(tmp2[1], stream);
						let hash = null;
						if (body !== null) {
							hash = _get_function_hash(body);
						}


						if (tmp2[1] === 'serialize') {

							methods['serialize'] = {
								body:       body,
								hash:       hash,
								parameters: [],
								values:     [{
									type:  'SerializationBlob',
									value: {
										'constructor': null,
										'arguments':   [],
										'blob':        null
									}
								}]
							};

						} else if (tmp2[1] === 'deserialize') {

							methods['deserialize'] = {
								body:       body,
								hash:       hash,
								parameters: [{
									name:  'blob',
									type:  'SerializationBlob',
									value: {}
								}],
								values:     [{
									type:  'undefined',
									value: undefined
								}]
							};

							if (tmp1 === 'deserialize: function(blob) {},') {
								methods['deserialize'].body = 'function(blob) {}';
								methods['deserialize'].hash = _get_function_hash(methods['deserialize'].body);
							}

						} else {

							last_name = tmp2[1];

							// last_method = methods['setWhatever'] = { parameters: [{ name: 'foo', type: 'String', value: null }] }
							last_method = methods[tmp2[1]] = {
								body:       body,
								hash:       hash,
								parameters: [],
								values:     []
							};


							let tmp4 = tmp2[2].trim();
							if (tmp4.length > 0) {

								last_method.parameters = tmp4.split(',').map(function(val) {

									return {
										name:  val.trim(),
										type:  'undefined',
										value: undefined
									};

								});

							}

						}

					}

				} else if (line === '\t\t},' || line === '\t\t}') {

					last_name   = null;
					last_method = null;

				} else if (last_method !== null) {

					let tmp1 = line.trim();
					if (tmp1.startsWith('return') && tmp1.endsWith('{')) {

						let has_object = last_method.values.find(function(val) {
							return val.type === 'Object';
						});

						if (has_object === undefined) {
							last_method.values.push({
								type:  'Object',
								value: {}
							});
						}

					} else if (tmp1.startsWith('return') && tmp1.endsWith(';')) {

						if ((last_line.includes('function(') || last_line.includes('=>')) && last_line.endsWith('{')) {
							return;
						}


						let tmp2 = tmp1.substr(6, tmp1.length - 7).trim();
						if (tmp2.includes('&&') || tmp2.includes('||')) {

							let has_true = last_method.values.find(function(val) {
								return val.value === true;
							});

							if (has_true === undefined) {
								last_method.values.push({
									type:  'Boolean',
									value: true
								});
							}

							let has_false = last_method.values.find(function(val) {
								return val.value === false;
							});

							if (has_false === undefined) {
								last_method.values.push({
									type:  'Boolean',
									value: false
								});
							}

						} else if (tmp2.length > 0) {

							let type  = _detect_type(tmp2);
							let value = _detect_value(tmp2);

							if (type === 'undefined' && value === undefined && tmp2 !== 'undefined') {

								// XXX: Trace variable mutations
								if (/^[A-Za-z0-9]+/g.test(tmp2) === true) {

									let mutation = _trace_variable(tmp2, last_method.body).pop();
									if (mutation !== undefined) {
										type  = mutation.type;
										value = mutation.value;
									}

								}


								if (type === 'undefined') {

									type  = 'undefined';
									value = tmp2;

									errors.push({
										ruleId:     'no-return-value',
										methodName: last_name,
										fileName:   null,
										message:    'Unguessable return "' + last_name + '()" ("' + tmp2 + '").'
									});

								}

							}


							let has_already = last_method.values.find(function(val) {

								if (/Array|Object/g.test(val.type)) {
									return JSON.stringify(val.value) === JSON.stringify(value);
								} else {
									return val.type === type && val.value === value;
								}

							});

							if (has_already === undefined && value !== undefined) {

								last_method.values.push({
									type:  type,
									value: value
								});

							}

						}

					} else {

						Object.values(last_method.parameters).forEach(function(parameter) {

							if (tmp1.startsWith(parameter.name + ' =')) {

								let tmp2  = tmp1.substr(tmp1.indexOf('=') + 1).trim();
								let type  = _detect_type(tmp2);
								let value = _detect_value(tmp2);

								if (type !== 'undefined') {

									if (parameter.type === type) {

										if (parameter.value === undefined) {
											parameter.value = value;
										}

									} else if (parameter.type === 'undefined') {

										parameter.type  = type;
										parameter.value = value;

									}

								}

							} else if (tmp1.includes(parameter.name)) {

								if (tmp1.startsWith('this\.' + parameter.name)) {

									let property = properties[parameter.name] || null;
									if (property !== null) {

										if (parameter.type === 'undefined') {
											parameter.type = property.type;
										}

										if (parameter.value === null) {
											parameter.value = _clone_value(property.value);
										}

									}

								}

							}

						});

					}

				}


				last_line = line;

			});


			for (let mid in methods) {

				let method = methods[mid];
				if (method.values.length === 0) {

					method.values.push({
						type:  'undefined',
						value: undefined
					});

				}

			}

		}

	};




	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'strainer.api.Module',
				'arguments': []
			};

		},

		check: function(asset) {

			let stream = asset.buffer.toString('utf8');
			let errors = [];
			let result = {
				settings:   {},
				properties: {},
				enums:      {},
				events:     {},
				methods:    {}
			};


			_parse_methods(result.methods, result.properties, stream, errors);


			if (result.methods['serialize'] === undefined) {

				errors.push({
					ruleId:     'no-serialize',
					methodName: 'serialize',
					fileName:   null,
					message:    'No serialize() method defined.'
				});

			}

			if (result.methods['deserialize'] === undefined) {

				errors.push({
					ruleId:     'no-deserialize',
					methodName: 'deserialize',
					fileName:   null,
					message:    'No deserialize() method defined.'
				});

			}

			return {
				errors: errors,
				result: result
			};

		}

	};


	return Module;

});

