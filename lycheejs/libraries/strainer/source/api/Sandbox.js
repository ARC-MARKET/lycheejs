
lychee.define('strainer.api.Sandbox').requires([
	'strainer.api.PARSER',
	'strainer.api.TRANSCRIPTOR'
]).exports((lychee, global, attachments) => {

	const _PARSER       = lychee.import('strainer.api.PARSER');
	const _TRANSCRIPTOR = lychee.import('strainer.api.TRANSCRIPTOR');



	/*
	 * HELPERS
	 */

	const _validate_asset = function(asset) {

		if (asset instanceof Object && typeof asset.serialize === 'function') {
			return true;
		}

		return false;

	};

	const _find_blocks = function(prefix, stream) {

		let buffer   = stream.split('\n');
		let is_block = false;
		let blocks   = [];
		let chunk    = [];
		let chunks   = [];

		buffer.forEach(line => {

			if (line.startsWith(prefix)) {
				chunk.push(line);
				is_block = true;
			} else if (is_block === true && line.startsWith('\t});')) {
				chunk.push(line);
				chunks.push(chunk.join('\n'));
				chunk = [];
				is_block = false;
			} else if (is_block === true) {
				chunk.push(line);
			}

		});

		chunks.forEach(chunk => {

			let id = null;

			if (chunk.startsWith(prefix)) {

				let i0 = chunk.indexOf('\'');
				let i1 = chunk.indexOf('\'', i0 + 1);
				let i2 = chunk.indexOf('"');
				let i3 = chunk.indexOf('"', i2 + 1);
				let i4 = chunk.indexOf('function(assert, expect) {');

				if (i0 !== -1 && i1 !== -1 && i0 < i4 && i1 < i4) {

					let tmp = chunk.substr(i0 + 1, i1 - i0 - 1).trim();
					if (tmp.length > 0) {
						id = tmp;
					}

				} else if (i2 !== -1 && i3 !== -1 && i2 < i4 && i3 < i4) {

					let tmp = chunk.substr(i2 + 1, i3 - i2 - 1).trim();
					if (tmp.length > 0) {
						id = tmp;
					}

				}

				chunk = chunk.substr(i4);

			}

			if (chunk.endsWith('\t});')) {
				chunk = chunk.substr(0, chunk.length - 2);
			}

			blocks.push({
				id:    id,
				chunk: chunk.trim()
			});

		});

		return blocks;

	};

	const _parse_memory = function(memory, stream, errors) {

		let i1 = stream.indexOf('.exports((lychee, sandbox) => {');
		let d1 = 31;
		let i2 = stream.indexOf('\n\tsandbox.');

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

	const _parse_states = function(states, stream, errors) {

		let buffer   = stream.split('\n');
		let is_state = false;
		let chunk    = [];
		let chunks   = [];

		buffer.forEach(line => {

			if (line.startsWith('\tsandbox.setStates(')) {
				chunk.push(line);
				is_state = true;
			} else if (is_state === true && line.startsWith('\t});')) {
				chunk.push(line);
				chunks.push(chunk.join('\n'));
				chunk = [];
				is_state = false;
			} else if (is_state === true) {
				chunk.push(line);
			}

		});

		chunks.forEach(chunk => {

			if (chunk.startsWith('\tsandbox.setStates(')) {
				chunk = chunk.substr(19);
			}

			if (chunk.endsWith('\t});')) {
				chunk = chunk.substr(0, chunk.length - 2);
			}


			let object = _PARSER.detect(chunk);
			if (object.type === 'Object') {

				states.chunk = object.chunk;
				states.type  = object.type;
				states.hash  = object.hash;
				states.value = object.value;

			}

		});

	};

	const _parse_properties = function(properties, stream, errors) {

		let blocks = _find_blocks('\tsandbox.setProperty(', stream);
		if (blocks.length > 0) {

			blocks.forEach(block => {
				block.chunk = _PARSER.outdent('\t' + block.chunk.trim(), '\t');
				properties[block.id] = _PARSER.detect(block.chunk);
			});

		}

	};

	const _parse_enums = function(enums, stream, errors) {

		let blocks = _find_blocks('\tsandbox.setEnum(', stream);
		if (blocks.length > 0) {

			blocks.forEach(block => {
				block.chunk = _PARSER.outdent('\t' + block.chunk.trim(), '\t');
				enums[block.id] = _PARSER.detect(block.chunk);
			});

		}

	};

	const _parse_events = function(events, stream, errors) {

		let blocks = _find_blocks('\tsandbox.setEvent(', stream);
		if (blocks.length > 0) {

			blocks.forEach(block => {
				block.chunk = _PARSER.outdent('\t' + block.chunk.trim(), '\t');
				events[block.id] = _PARSER.detect(block.chunk);
			});

		}

	};

	const _parse_methods = function(methods, stream, errors) {

		let blocks = _find_blocks('\tsandbox.setMethod(', stream);
		if (blocks.length > 0) {

			blocks.forEach(block => {
				block.chunk = _PARSER.outdent('\t' + block.chunk.trim(), '\t');
				methods[block.id] = _PARSER.detect(block.chunk);
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
				'reference': 'strainer.api.Sandbox',
				'arguments': []
			};

		},

		check: function(asset, header) {

			asset  = _validate_asset(asset) === true ? asset  : null;
			header = header instanceof Object        ? header : {};


			let errors = [];
			let memory = {};
			let result = {
				states:     {},
				properties: {},
				enums:      {},
				events:     {},
				methods:    {}
			};


			if (asset !== null) {

				let stream = asset.buffer.toString('utf8');

				_parse_memory(memory, stream, errors);
				_parse_states(result.states, stream, errors);
				_parse_properties(result.properties, stream, errors);
				_parse_enums(result.enums, stream, errors);
				_parse_events(result.events, stream, errors);
				_parse_methods(result.methods, stream, errors);

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


					let states = result.states || null;
					if (states !== null) {

						let chunk = _TRANSCRIPTOR.transcribe(null, states);
						if (chunk !== null) {
							code.push('');
							code.push('');
							code.push('\tsandbox.setStates(' + chunk + ');');
						}

					}

					let properties = result.properties || null;
					if (properties !== null && Object.keys(properties).length > 0) {

						for (let pid in properties) {

							let chunk = _TRANSCRIPTOR.transcribe(null, properties[pid]);
							if (chunk !== null) {
								code.push('');
								code.push('\tsandbox.setProperty(\'' + pid + '\', ' + _PARSER.indent(chunk, '\t').trim() + ');');
							}

						}

					}

					let enums = result.enums || null;
					if (enums !== null && Object.keys(enums).length > 0) {

						for (let eid in enums) {

							let chunk = _TRANSCRIPTOR.transcribe(null, enums[eid]);
							if (chunk !== null) {
								code.push('');
								code.push('\tsandbox.setEnum(\'' + eid + '\', ' + _PARSER.indent(chunk, '\t').trim() + ');');
							}

						}

					}

					let events = result.events || null;
					if (events !== null && Object.keys(events).length > 0) {

						for (let eid in events) {

							let chunk = _TRANSCRIPTOR.transcribe(null, events[eid]);
							if (chunk !== null) {
								code.push('');
								code.push('\tsandbox.setEvent(\'' + eid + '\', ' + _PARSER.indent(chunk, '\t').trim() + ');');
							}

						}

					}

					let methods = result.methods || null;
					if (methods !== null && Object.keys(methods).length > 0) {

						for (let mid in methods) {

							let chunk = _TRANSCRIPTOR.transcribe(null, methods[mid]);
							if (chunk !== null) {
								code.push('');
								code.push('\tsandbox.setMethod(\'' + mid + '\', ' + _PARSER.indent(chunk, '\t').trim() + ');');
							}

						}

					}


					code.push('');

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

