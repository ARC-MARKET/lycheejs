
lychee.define('strainer.api.Module').requires([
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

	const _get_serialize = function(identifier) {

		let code = [];
		let data = lychee.assignunlink({}, _SERIALIZE);

		code.push('function() {');
		code.push('');
		code.push('\treturn {');
		code.push('\t\t\'reference\': \'' + identifier + '\',');
		code.push('\t\t\'blob\':      null');
		code.push('\t};');
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

	const _find_method = function(key, stream) {

		let str1 = '\n\t\t' + key + ': function';
		let str2 = '\n\t\t}';

		let i0 = stream.indexOf('\n\tconst Module = {');
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

	const _find_property = function(key, stream) {

		let str1 = '\n\t\t' + key + ': {';
		let str2 = '\n\t\t}';

		let i0 = stream.indexOf('\n\tconst Module = {');
		let i1 = stream.indexOf(str1, i0);
		let i2 = stream.indexOf(str2, i1);

		if (i1 !== -1 && i2 !== -1) {
			return stream.substr(i1 + str1.length - 1, i2 - i1 - str1.length + str2.length + 1).trim();
		}

		return 'undefined';

	};

	const _parse_memory = function(memory, stream, errors) {

		let i1 = stream.indexOf('.exports((lychee, global, attachments) => {\n');
		let d1 = 42;
		let i2 = stream.indexOf('\n\tconst Module =');

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

	const _parse_methods = function(methods, stream, errors) {

		let buffer = stream.split('\n');
		let check1 = buffer.findIndex((line, l) => (line === '\tconst Module = {'));
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
				if (deserialize.parameters.length === 0) deserialize.parameters = lychee.assignunlink([], _DESERIALIZE.parameters);
				if (deserialize.values.length === 0)     deserialize.values     = lychee.assignunlink([], _DESERIALIZE.values);
			}

			let serialize = methods['serialize'];
			if (serialize !== undefined) {
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

					errors.push({
						url:       null,
						rule:      'no-return-value',
						reference: mid,
						message:   'Invalid return value for method "' + mid + '()".',
						line:      ref.line,
						column:    ref.column
					});


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

	const _parse_properties = function(properties, stream, errors) {

		let buffer = stream.split('\n');
		let check1 = buffer.findIndex((line, l) => (line === '\tconst Module = {'));
		let check2 = buffer.findIndex((line, l) => (line === '\t};' && l > check1));

		if (check1 !== -1 && check2 !== -1) {

			buffer.slice(check1 + 1, check2).filter(line => {

				if (line.startsWith('\t\t')) {

					let tmp = line.substr(2);
					if (/^([A-Za-z0-9]+):\sfunction/g.test(tmp)) {
						return false;
					} else if (/^([A-Za-z0-9]+):\s/g.test(tmp)) {
						return true;
					}

				}


				return false;

			}).forEach(chunk => {

				if (chunk.endsWith(',')) {

					chunk = chunk.substr(0, chunk.length - 1);


					let tmp = chunk.split(':');
					if (tmp.length === 2) {

						let name = tmp[0].trim();
						let prop = _PARSER.detect(tmp[1].trim());

						if (
							properties[name] === undefined
							|| (
								properties[name].value.type === 'undefined'
								&& prop.type !== 'undefined'
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

				} else if (chunk.endsWith('{')) {

					let tmp = chunk.split(':');
					if (tmp.length === 2) {

						let name = tmp[0].trim();
						let body = _find_property(name, stream);
						let prop = _PARSER.detect(body);

						if (
							properties[name] === undefined
							|| (
								properties[name].value.type === 'undefined'
								&& prop.type !== 'undefined'
							)
						) {

							properties[name] = {
								chunk: body,
								type:  prop.type,
								hash:  _PARSER.hash(body),
								value: prop
							};

						}

					}

				}

			});

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

		check: function(asset, header) {

			asset  = _validate_asset(asset) === true ? asset  : null;
			header = header instanceof Object        ? header : {};


			let errors = [];
			let memory = {};
			let result = {
				constructor: {},
				states:      {},
				properties:  {},
				enums:       {},
				events:      {},
				methods:     {}
			};

			if (asset !== null) {

				let stream = asset.buffer.toString('utf8');

				_parse_memory(memory, stream, errors);
				_parse_methods(result.methods, stream, errors);
				_parse_properties(result.properties, stream, errors);


				let ref = _find_reference('\n\tconst Module = {', stream, true);
				if (ref.chunk === '') {

					ref = _find_reference('Module =', stream, true);

					errors.push({
						url:       null,
						rule:      'no-module',
						reference: 'constructor',
						message:   'Module is not constant (missing "const" declaration).',
						line:      ref.line,
						column:    ref.column
					});

				}


				for (let name in memory) {

					let entry = memory[name];
					if (entry.type === 'lychee.Definition') {

						let id = entry.value.reference;
						if (header.requires.includes(id) === false) {

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


				if (
					result.methods['deserialize'] === undefined
					|| result.methods['serialize'] === undefined
				) {

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
							message:   'No "serialize()" method.',
							line:      ref.line,
							column:    ref.column
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


					let methods = result.methods || {};

					let check_serialize = methods.serialize || null;
					if (check_serialize === null) {
						methods.serialize = _get_serialize(header.identifier);
					}

					let mids = Object.keys(methods);
					if (mids.length > 0) {

						let chunk = _TRANSCRIPTOR.transcribe('Module', {});
						if (chunk !== null) {

							let tmp = chunk.split('\n');
							code.push('\t' + tmp[0]);

							let last = mids[mids.length - 1];

							for (let mid in methods) {

								let chunk = _TRANSCRIPTOR.transcribe(null, methods[mid]);
								if (chunk !== null) {
									code.push('');
									code.push('\t\t' + mid + ': ' + _PARSER.indent(chunk, '\t\t').trim() + ((mid === last) ? '' : ','));
								}

							}

							code.push('');
							code.push.apply(code, tmp.slice(1).map(t => '\t' + t));

						}

					}


					code.push('');
					code.push('');
					code.push('\treturn Module;');

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

