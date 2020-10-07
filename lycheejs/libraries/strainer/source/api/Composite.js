
lychee.define('strainer.api.Composite').requires([
	'strainer.api.PARSER',
	'strainer.api.TRANSCRIPTOR'
]).exports((lychee, global, attachments) => {

	const _PARSER       = lychee.import('strainer.api.PARSER');
	const _TRANSCRIPTOR = lychee.import('strainer.api.TRANSCRIPTOR');



	/*
	 * CACHES
	 */

	const _SERIALIZE = {
		chunk:      'function() { return {}; }',
		type:       'function',
		hash:       _PARSER.hash('function() { return {}; }'),
		memory:     [],
		parameters: [],
		values:     [{
			type: 'SerializationBlob',
			value: {
				'constructor': null,
				'arguments':   [],
				'blob':        null
			}
		}]
	};

	const _DESERIALIZE = {
		chunk:      'function(blob) {}',
		type:       'function',
		hash:       _PARSER.hash('function(blob) {}'),
		memory:     [],
		parameters: [{
			name:  'blob',
			type:  'SerializationBlob',
			value: {}
		}],
		values: [{
			type:  'undefined',
			value: undefined
		}]
	};



	/*
	 * HELPERS
	 */

	const _get_serialize = function(identifier, include) {

		let code = [];
		let data = lychee.assignunlink({}, _SERIALIZE);

		code.push('function() {');
		code.push('');
		code.push('\tlet data = ' + include + '.prototype.serialize.call(this);');
		code.push('\tdata[\'constructor\'] = \'' + identifier + '\';');
		code.push('');
		code.push('');
		code.push('\tlet states = data[\'arguments\'][0];');
		code.push('\tlet blob   = (data[\'blob\'] || {});');
		code.push('');
		code.push('');
		code.push('\tdata[\'arguments\'][0] = states;');
		code.push('\tdata[\'blob\']         = Object.keys(blob).length > 0 ? blob : null;');
		code.push('');
		code.push('');
		code.push('\treturn data;');
		code.push('');
		code.push('}');

		data.chunk = code.join('\n');
		data.hash  = _PARSER.hash(data.chunk);

		return data;

	};

	const _validate_asset = function(asset) {

		if (asset instanceof Object && typeof asset.serialize === 'function') {
			return true;
		}

		return false;

	};

	const _find_reference = function(chunk, stream, fuzzy) {

		fuzzy = fuzzy === true;


		let ref = {
			chunk:  '',
			line:   0,
			column: 0
		};

		let lines = stream.split('\n');
		let line  = lines.findIndex(other => {

			if (fuzzy === true) {
				return other.includes(chunk.trim());
			} else {
				return other.trim() === chunk.trim();
			}

		});

		if (line !== -1) {

			ref.chunk = lines[line];
			ref.line  = line + 1;

			let column = lines[line].indexOf(chunk);
			if (column !== -1) {
				ref.column = column + 1;
			}

		}

		return ref;

	};

	const _find_enum = function(key, stream) {

		let str1 = '\n\tComposite.' + key + ' = ';
		let str2 = ';';

		let i0 = stream.indexOf('\n\tconst Composite =');
		let i1 = stream.indexOf(str1, i0);
		let i2 = stream.indexOf(str2, i1);

		if (i1 !== -1 && i2 !== -1) {
			return key + ' = ' + stream.substr(i1 + str1.length, i2 - i1 - str1.length + str2.length);
		}

		return 'undefined';

	};

	const _find_statement = function(line, stream) {

		let i1 = stream.indexOf(line);
		let i2 = stream.indexOf(';', i1);

		if (i1 !== -1 && i2 !== -1) {
			return (line + stream.substr(i1 + line.length, i2 - i1 - line.length + 1)).trim();
		}

		return 'undefined';

	};

	const _find_method = function(key, stream) {

		let str1 = '\n\t\t' + key + ': function';
		let str2 = '\n\t\t}';

		let i0 = stream.indexOf('\n\tComposite.prototype = {');
		let i1 = stream.indexOf(str1, i0);
		let i2 = stream.indexOf(str2, i1);

		if (i1 !== -1 && i2 !== -1) {

			let body = '\t\tfunction' + stream.substr(i1 + str1.length, i2 - i1 - str1.length + str2.length).trim();
			if (body !== '\t\tfunction') {
				return _PARSER.outdent(body, '\t\t');
			}

		}

		return 'undefined';

	};

	const _parse_memory = function(memory, stream, errors) {

		let i1 = stream.indexOf('.exports((lychee, global, attachments) => {\n');
		let d1 = 42;
		let i2 = stream.indexOf('\n\tconst Composite =');

		if (i1 === -1) {
			i1 = stream.indexOf('(function(global) {');
			d1 = 19;
		}

		if (i1 !== -1 && i2 !== -1) {

			let body = stream.substr(i1 + d1, i2 - i1 - d1);
			if (body.length > 0) {

				body.split('\n')
					.filter(line => {
						return line.startsWith('\tconst ') || line.startsWith('\tlet ');
					})
					.map(line => line.trim())
					.forEach(line => {

						let tmp = '';
						if (line.startsWith('const ')) {
							tmp = line.substr(6).trim();
						} else if (line.startsWith('let ')) {
							tmp = line.substr(4).trim();
						}


						let i1 = tmp.indexOf('=');
						if (i1 !== -1) {

							let key   = tmp.substr(0, i1).trim();
							let chunk = tmp.substr(i1 + 1).trim();

							if (key !== '' && chunk !== '') {

								if (chunk.endsWith(';')) {

									chunk = chunk.substr(0, chunk.length - 1);
									memory[key] = _PARSER.detect(chunk);

								} else {

									chunk = _PARSER.find(key, body);
									memory[key] = _PARSER.detect(chunk);

								}

							}

						}

					});

			}

		}

	};

	const _parse_constructor = function(constructor, stream) {

		let i1 = stream.indexOf('\n\tconst Composite =');
		let i2 = stream.indexOf('\n\t};', i1);

		if (i1 !== -1 && i2 !== -1) {

			let chunk = stream.substr(i1 + 20, i2 - i1 - 17).trim();
			if (chunk.length > 0) {

				constructor.chunk      = _PARSER.outdent('\t' + chunk.trim(), '\t');
				constructor.type       = 'function';
				constructor.hash       = _PARSER.hash(chunk);
				constructor.memory     = _PARSER.memory(chunk);
				constructor.parameters = _PARSER.parameters(chunk);

			}

		}

	};

	const _parse_states = function(states, stream) {

		let buffer = stream.split('\n');
		let check1 = buffer.findIndex((line, l) => line.startsWith('\tconst Composite = '));
		let check2 = buffer.findIndex((line, l) => (line === '\t};' && l > check1));

		if (check1 !== -1 && check2 !== -1) {

			let chunk = buffer.slice(check1, check2).join('\n').trim().substr(18);
			if (chunk.length > 0) {

				let object = _PARSER.states(chunk);
				if (Object.keys(object).length > 0) {

					for (let o in object) {
						states[o] = object[o];
					}

				}

			}

		}

	};

	const _parse_properties = function(properties, stream) {

		let buffer = stream.split('\n');
		let check1 = buffer.findIndex((line, l) => line.startsWith('\tconst Composite = '));
		let check2 = buffer.findIndex((line, l) => (line === '\t};' && l > check1));

		if (check1 !== -1 && check2 !== -1) {

			let body = buffer.slice(check1, check2).join('\n').trim().substr(18);
			if (body.length > 0) {

				body.split('\n').forEach(line => {

					let chunk = line.trim();
					if (chunk.startsWith('this.') && chunk.includes(' = ')) {

						if (chunk.endsWith('[') || chunk.endsWith('{')) {

							let statement = _find_statement(line, body);
							if (statement !== 'undefined') {
								chunk = statement;
							}

						}


						let tmp = chunk.split(/this\.([A-Za-z_]+)([\s]+)=([\s]+)([^\0]*);/g).filter(ch => ch.trim() !== '');
						if (tmp.length === 2) {

							let name = tmp[0];
							let prop = _PARSER.detect(tmp[1]);
							if (prop.type === 'undefined' && /^([A-Za-z0-9]+)$/g.test(prop.chunk)) {

								let mutations = _PARSER.mutations(prop.chunk, body);
								if (mutations.length > 0) {

									let val = mutations.find(mutation => mutation.type !== 'undefined');
									if (val !== undefined) {
										prop.type  = val.type;
										prop.value = val.value;
									}

								}

							}

							if (
								properties[name] === undefined
								|| (
									prop.type !== 'undefined'
									&& (
										properties[name].value.type === 'undefined'
										|| properties[name].value.type === 'null'
									)
								)
							) {

								properties[name] = {
									chunk: chunk,
									type:  prop.type,
									hash:  _PARSER.hash(chunk),
									value: prop
								};

							}

						}

					}

				});

			}

		}

	};

	const _parse_enums = function(enums, stream) {

		let i1 = stream.indexOf('\n\t};', stream.indexOf('\n\tconst Composite =')) + 4;
		let i2 = stream.indexOf('\n\tComposite.prototype =', i1);

		if (i1 !== -1 && i2 !== -1) {

			stream.substr(i1, i2 - i1).trim().split('\n').filter(line => {

				let tmp = line.trim();
				if (tmp.startsWith('Composite.') && tmp.includes('=')) {
					return true;
				}

				return false;

			}).forEach(chunk => {

				let enam = null;

				if (chunk.includes('//')) {
					chunk = chunk.split('//')[0];
				}


				if (chunk.endsWith(';')) {

					enam = _PARSER.enum(chunk.trim());

				} else {

					let name = chunk.split('=')[0].trim().split('.')[1];
					let body = _find_enum(name, stream);

					if (body !== 'undefined') {
						enam = _PARSER.enum(body);
					}

				}


				if (enam !== null && enam.name !== undefined) {

					if (enam.values !== undefined) {

						enums[enam.name] = {
							values: enam.values
						};

					} else if (enam.value !== undefined) {

						enums[enam.name] = {
							value: enam.value
						};

					}

				}

			});

		}

	};

	const _add_event = function(events, event, method) {

		method = typeof method === 'string' ? method : null;


		let cache = events[event.name];
		if (cache === undefined) {

			cache = events[event.name] = {
				chunk:      event.chunk,
				name:       event.name,
				type:       event.type,
				hash:       event.hash,
				methods:    [],
				parameters: event.parameters
			};

			if (method !== null) {
				cache.methods.push(method);
			}

		} else {

			if (method !== null) {

				if (cache.methods.includes(method) === false) {
					cache.methods.push(method);
				}

			}


			let c_params = cache.parameters;
			let e_params = event.parameters;

			if (c_params.length !== e_params.length) {

				if (c_params.length > e_params.length) {

					c_params.forEach((param, c) => {

						let other = e_params[c];
						if (other !== undefined) {

							if (param.type === 'undefined' && other.type !== 'undefined') {
								param.chunk = other.chunk;
								param.type  = other.type;
								param.value = other.value;
							}

						}

					});

				} else {

					e_params.forEach((param, e) => {

						let other = c_params[e];
						if (other !== undefined) {

							if (param.type === 'undefined' && other.type !== 'undefined') {
								param.chunk = other.chunk;
								param.type  = other.type;
								param.value = other.value;
							}

						} else if (other === undefined) {
							c_params[e] = param;
						}

					});

				}

			}

		}
	};

	const _parse_events = function(constructor, methods, events, stream, errors) {

		let construct = constructor.chunk || null;
		if (construct !== null) {

			let ewents = _PARSER.events(construct);
			if (ewents.length > 0) {
				ewents.forEach(event => _add_event(events, event));
			}

		}

		for (let mid in methods) {

			let method = methods[mid];
			let chunk  = method.chunk;
			let ewents = _PARSER.events(chunk);
			if (ewents.length > 0) {
				ewents.forEach(event => _add_event(events, event, mid));
			}

		}

	};

	const _parse_methods = function(methods, stream, errors) {

		let buffer = stream.split('\n');
		let check1 = buffer.findIndex((line, l) => (line === '\tComposite.prototype = {'));
		let check2 = buffer.findIndex((line, l) => (line === '\t};' && l > check1));

		if (check1 !== -1 && check2 !== -1) {

			buffer.slice(check1 + 1, check2).filter(line => {

				if (line.startsWith('\t\t')) {

					let tmp = line.substr(2);
					if (/^([A-Za-z0-9]+):\sfunction/g.test(tmp)) {
						return true;
					} else if (tmp.startsWith('// deserialize: function(blob) {}')) {
						methods['deserialize'] = Object.assign({}, _DESERIALIZE);
					} else if (tmp.startsWith('// serialize: function() {}')) {
						methods['serialize'] = Object.assign({}, _SERIALIZE);
					}

				}

				return false;

			}).forEach(chunk => {

				let name = chunk.split(':')[0].trim();
				let body = _find_method(name, stream);
				if (body !== 'undefined') {
					methods[name] = _PARSER.detect(body);
				}

			});


			let deserialize = methods['deserialize'];
			if (deserialize !== undefined) {
				if (deserialize.memory.length === 0)     deserialize.memory     = lychee.assignunlink([], _DESERIALIZE.memory);
				if (deserialize.parameters.length === 0) deserialize.parameters = lychee.assignunlink([], _DESERIALIZE.parameters);
				if (deserialize.values.length === 0)     deserialize.values     = lychee.assignunlink([], _DESERIALIZE.values);
			}

			let serialize = methods['serialize'];
			if (serialize !== undefined) {
				if (serialize.memory.length === 0)     serialize.memory     = lychee.assignunlink([], _SERIALIZE.memory);
				if (serialize.parameters.length === 0) serialize.parameters = lychee.assignunlink([], _SERIALIZE.parameters);
				if (serialize.values.length === 0)     serialize.values     = lychee.assignunlink([], _SERIALIZE.values);
			}


			for (let mid in methods) {

				let method = methods[mid];
				let params = method.parameters;
				let ref    = _find_reference(mid + ': ' + method.chunk.split('\n')[0], stream, true);
				let values = method.values;

				if (params.length > 0) {

					let found = params.filter(p => p.type === 'undefined' && p.value === undefined).map(p => p.name);
					if (found.length > 0) {

						if (/^(control|render|update|deserialize|serialize)$/g.test(mid) === false) {

							let key = found[0];
							let col = ref.chunk.indexOf(key);
							if (col !== -1) {
								col = col + 1;
							} else {
								col = ref.column;
							}

							errors.push({
								url:       null,
								rule:      'no-parameter-value',
								reference: mid,
								message:   'Invalid parameter values for "' + found.join('", "') + '" for method "' + mid + '()".',
								line:      ref.line,
								column:    col
							});

						}

					}

				}

				if (values.length === 0) {

					if (/^(render|update)$/g.test(mid) === false) {

						errors.push({
							url:       null,
							rule:      'no-return-value',
							reference: mid,
							message:   'Invalid return value for method "' + mid + '()".',
							line:      ref.line,
							column:    ref.column
						});

					}


					method.values.push({
						type:  'undefined',
						value: undefined
					});

				} else if (values.length > 0) {

					if (/^(serialize|deserialize)$/g.test(mid) === false) {

						values.forEach(val => {

							if (val.type === 'undefined' && val.value === undefined) {

								let message = 'Unguessable return value for method "' + mid + '()".';
								let chunk   = (val.chunk || '').trim();

								if (chunk !== '') {
									message = 'Unguessable return value "' + chunk + '" for method "' + mid + '()".';
								}

								errors.push({
									url:       null,
									rule:      'unguessable-return-value',
									reference: mid,
									message:   message,
									line:      ref.line,
									column:    ref.column
								});

							}

						});

					}

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
				'reference': 'strainer.api.Composite',
				'arguments': []
			};

		},

		check: function(asset, header) {

			asset  = _validate_asset(asset) === true ? asset  : null;
			header = header instanceof Object        ? header : {};


			let errors = [];
			let memory = {};
			let result = {
				constructor: {
					chunk:      null,
					type:       null,
					hash:       null,
					parameters: []
				},
				states:      {},
				properties:  {},
				enums:       {},
				events:      {},
				methods:     {}
			};


			if (asset !== null) {

				let stream = asset.buffer.toString('utf8');

				_parse_memory(memory, stream, errors);
				_parse_constructor(result.constructor, stream, errors);
				_parse_states(result.states, stream, errors);
				_parse_properties(result.properties, stream, errors);
				_parse_enums(result.enums, stream, errors);
				_parse_methods(result.methods, stream, errors);
				_parse_events(result.constructor, result.methods, result.events, stream, errors);


				if (result.constructor.parameters.length === 1) {

					let check = result.constructor.parameters[0];
					if (check.name === 'data' || check.name === 'states') {

						check.type = 'Object';

					} else if (/^(main|server)$/g.test(check.name) === false) {

						let chunk = result.constructor.chunk.split('\n')[0];
						let ref   = _find_reference('\n\tconst Composite = ' + chunk, stream);

						errors.push({
							url:       null,
							rule:      'no-composite',
							reference: 'constructor',
							message:   'Composite has no "states" object.',
							line:      ref.line,
							column:    ref.column
						});

					}

				} else if (result.constructor.parameters.length > 1) {

					let chunk = result.constructor.chunk.split('\n')[0];
					let ref   = _find_reference('\n\tconst Composite = ' + chunk, stream);

					errors.push({
						url:       null,
						rule:      'no-composite',
						reference: 'constructor',
						message:   'Composite has too many arguments.',
						line:      ref.line,
						column:    ref.column
					});

				} else {

					let ref = _find_reference('\n\tconst Composite = function(', stream, true);
					if (ref.chunk === '') {

						ref = _find_reference('Composite =', stream, true);

						errors.push({
							url:       null,
							rule:      'no-composite',
							reference: 'constructor',
							message:   'Composite is not constant (missing "const" declaration).',
							line:      ref.line,
							column:    ref.column
						});

					}

				}


				let chunk = result.constructor.chunk || null;
				if (chunk !== null) {

					let check = result.constructor.parameters[0] || null;
					if (check !== null && check.name === 'data') {

						let ref1 = _find_reference('\n\t\tlet states = ',  chunk, true);
						let ref2 = _find_reference('\n\t\tstates = null;', chunk);

						if (ref1.line !== 0 && ref2.line === 0) {

							let ref = _find_reference('\n\t\tlet states = ', stream, true);

							errors.push({
								url:       null,
								rule:      'no-garbage',
								reference: 'constructor',
								message:   'Composite produces garbage (missing "states = null" statement).',
								line:      ref.line,
								column:    ref.column
							});

						} else if (ref1.line === 0) {

							let ref = _find_reference('\n\tconst Composite = function(', stream, true);

							errors.push({
								url:       null,
								rule:      'no-states',
								reference: 'constructor',
								message:   'Composite ignores states (missing "let states = Object.assign({}, data)" statement).',
								line:      ref.line,
								column:    ref.column
							});

						}

					}


					for (let name in memory) {

						let entry = memory[name];
						if (entry.type === 'lychee.Definition') {

							let id  = entry.value.reference;
							let ref = _find_reference('\n\t\t' + name + '.call(this', chunk, true);

							if (header.includes.includes(id) === false && ref.line !== 0) {

								errors.push({
									url:       null,
									rule:      'no-includes',
									reference: name,
									message:   'Invalid Definition (missing includes() entry for "' + id + '").',
									line:      0,
									column:    0
								});

							} else if (header.includes.includes(id) === true && ref.line === 0) {

								errors.push({
									url:       null,
									rule:      'no-constructor-call',
									reference: name,
									message:   'Invalid Definition (missing constructor call for "' + id + '").',
									line:      0,
									column:    0
								});

							} else if (header.includes.includes(id) === false && header.requires.includes(id) === false) {

								errors.push({
									url:       null,
									rule:      'no-requires',
									reference: name,
									message:   'Invalid Definition (missing requires() entry for "' + id + '").',
									line:      0,
									column:    0
								});

							}

						}

					}

				}


				for (let p in result.properties) {

					let property = result.properties[p];
					if (property.value.type === 'undefined') {

						let method = result.methods['set' + p.charAt(0).toUpperCase() + p.substr(1)] || null;
						if (method !== null) {

							let found = method.parameters.find(val => p === val.name);
							if (found !== undefined && found.type !== 'undefined') {
								property.value.type = found.type;
							}

						}

					}

					if (property.value.type === 'undefined' && property.value.value === undefined) {

						let ref = _find_reference(property.chunk, stream);

						errors.push({
							url:       null,
							rule:      'unguessable-property-value',
							reference: p,
							message:   'Unguessable property "' + p + '".',
							line:      ref.line,
							column:    ref.column
						});

					}

				}


				if (
					result.methods['deserialize'] === undefined
					|| result.methods['serialize'] === undefined
				) {

					let ref = _find_reference('\n\tComposite.prototype =', stream, true);

					if (result.methods['deserialize'] === undefined) {

						errors.push({
							url:       null,
							rule:      'no-deserialize',
							reference: 'deserialize',
							message:   'No "deserialize()" method.',
							line:      ref.line,
							column:    ref.column
						});

					}

					if (result.methods['serialize'] === undefined) {

						errors.push({
							url:       null,
							rule:      'no-serialize',
							reference: 'serialize',
							message:    'No "serialize()" method.',
							line:       ref.line,
							column:     ref.column
						});

					}

				}

			}


			return {
				errors: errors,
				memory: memory,
				result: result
			};

		},

		transcribe: function(asset) {

			asset = _validate_asset(asset) === true ? asset : null;


			if (asset !== null) {

				let code = [];


				let api = asset.buffer;
				if (api instanceof Object) {

					let header = api.header || {};
					let memory = api.memory || {};
					let result = api.result || {};


					if (memory instanceof Object) {

						for (let m in memory) {

							let chunk = _TRANSCRIPTOR.transcribe(m, memory[m]);
							if (chunk !== null) {
								code.push('\t' + chunk);
							}

						}

					}

					let construct = Object.hasOwnProperty.call(result, 'constructor') ? result.constructor : null;
					if (construct !== null) {

						let chunk = _TRANSCRIPTOR.transcribe('Composite', construct);
						if (chunk !== null) {
							code.push('');
							code.push('');
							code.push(_PARSER.indent(chunk, '\t'));
						}

					} else {

						construct = {
							chunk:      null,
							hash:       null,
							type:       'function',
							parameters: [{
								chunk: null,
								name: 'data',
								type: 'Object'
							}]
						};

						let chunk = _TRANSCRIPTOR.transcribe('Composite', construct);
						if (chunk !== null) {
							code.push('');
							code.push('');
							code.push(_PARSER.indent(chunk, '\t'));
						}

					}


					let methods = result.methods || {};

					let check_serialize = methods.serialize || null;
					if (check_serialize === null) {

						let includes  = header.includes || [];
						let variables = Object.keys(memory).filter(variable => {

							let data = memory[variable] || null;
							if (data !== null) {

								if (data.type === 'lychee.Definition') {
									return includes.includes(data.value.reference);
								}

							}

							return false;

						});

						methods.serialize = _get_serialize(header.identifier, variables[0]);

					}

					let mids = Object.keys(methods);
					if (mids.length > 0) {

						code.push('');
						code.push('');
						code.push('\tComposite.prototype = {');

						let last = mids[mids.length - 1];

						for (let mid in methods) {

							let chunk = _TRANSCRIPTOR.transcribe(null, methods[mid]);
							if (chunk !== null) {
								code.push('');
								code.push('\t\t' + mid + ': ' + _PARSER.indent(chunk, '\t\t').trim() + ((mid === last) ? '' : ','));
							}

						}

						code.push('');
						code.push('\t};');

					}


					code.push('');
					code.push('');
					code.push('\treturn Composite;');

				}


				if (code.length > 0) {
					return code.join('\n');
				}

			}


			return null;

		}

	};


	return Module;

});

