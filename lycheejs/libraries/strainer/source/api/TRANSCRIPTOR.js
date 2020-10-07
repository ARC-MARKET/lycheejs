
lychee.define('strainer.api.TRANSCRIPTOR').exports((lychee, global, attachments) => {

	const _FEATURES  = lychee.FEATURES;
	const _PLATFORMS = lychee.PLATFORMS;



	/*
	 * HELPERS
	 */



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
				'reference': 'strainer.api.TRANSCRIPTOR',
				'blob':      null
			};

		},



		/*
		 * CUSTOM API
		 */

		transcribe: function(name, value, assign) {

			name   = typeof name === 'string' ? name  : null;
			value  = value instanceof Object  ? value : null;
			assign = assign === true;


			if (name !== null && value !== null) {

				let code = [];
				let type = value.type || '';

				if (type === 'function') {

					let chunk = value.chunk || null;
					if (chunk !== null) {
						code.push((assign === false ? 'const ' : '') + name + ' = ' + value.chunk + ';');
					} else {

						let parameters = value.parameters || [];
						if (parameters.length > 0) {
							code.push((assign === false ? 'const ' : '') + name + ' = function(' + parameters.map(p => p.name).join(', ') + ') {');
							code.push('};');
						} else {
							code.push((assign === false ? 'const ' : '') + name + ' = function() {');
							code.push('};');
						}

					}

				} else if (type === 'lychee.Definition') {
					code.push((assign === false ? 'const ' : '') + name + ' = lychee.import(\'' + value.value.reference + '\');');
				} else if (type === 'lychee.Namespace') {
					code.push((assign === false ? 'const ' : '') + name + ' = lychee.import(\'' + value.value.reference + '\');');
				} else if (/^(null|undefined)$/g.test(type)) {
					code.push((assign === false ? 'let ' : '') + name + ' = ' + value.chunk + ';');
				} else if (/^(Array|String)$/g.test(type)) {
					code.push((assign === false ? 'const ' : '') + name + ' = ' + value.chunk + ';');
				} else if (type === 'Number' && value.value === 0) {
					code.push((assign === false ? 'let ' : '') + name + ' = ' + value.chunk + ';');
				} else if (type === 'Number') {
					code.push((assign === false ? 'const ' : '') + name + ' = ' + value.chunk + ';');
				} else if (type === 'RegExp') {
					code.push((assign === false ? 'const ' : '') + name + ' = ' + value.chunk + ';');
				} else if (/^(Buffer|Config|Font|Music|Sound|Texture)$/g.test(type)) {
					code.push((assign === false ? 'const ' : '') + name + ' = ' + value.chunk + ';');
				} else if (type === 'Object') {
					code.push((assign === false ? 'const ' : '') + name + ' = ' + value.chunk + ';');
				} else if (type.startsWith('_')) {
					code.push((assign === false ? 'const ' : '') + name + ' = ' + value.chunk + ';');
				} else if (value instanceof Object) {

					code.push((assign === false ? 'const ' : '') + name + ' = ' + '{');

					for (let v in value) {

						let entry = value[v];
						if (entry.type === 'function') {
							code.push('\t\t' + v + ': ' + entry.chunk + ',');
						} else if (entry.type === 'lychee.Definition') {
							code.push('\t\t' + v + ': ' + entry.value.reference + ',');
						} else if (entry.type === 'lychee.Namespace') {
							code.push('\t\t' + v + ': ' + entry.value.reference + ',');
						}

						code.push('');

					}


					let last = code[code.length - 2] || '';
					if (last.endsWith(',')) {
						code[code.length - 2] = last.substr(0, last.length - 1);
					}

					code.push('};');

				}


				return code.join('\n');

			} else if (value !== null) {

				let code = [];
				let type = value.type || '';

				if (type === 'function') {

					let chunk = value.chunk || null;
					if (chunk !== null) {
						code.push(value.chunk);
					} else {

						let parameters = value.parameters || [];
						if (parameters.length > 0) {
							code.push('function(' + parameters.map(p => p.name).join(', ') + ') {');
							code.push('}');
						} else {
							code.push('function() {');
							code.push('}');
						}

					}

				} else if (type === 'lychee.Definition') {
					code.push('lychee.import(\'' + value.value.reference + '\')');
				} else if (type === 'lychee.Namespace') {
					code.push('lychee.import(\'' + value.value.reference + '\')');
				} else if (/^(null|undefined)$/g.test(type)) {
					code.push(value.chunk);
				} else if (/^(Array|Number|String)$/g.test(type)) {
					code.push(value.chunk);
				} else if (type === 'RegExp') {
					code.push(value.chunk);
				} else if (type === 'Object') {
					code.push(value.chunk);
				} else if (/^(Buffer|Config|Font|Music|Sound|Texture)$/g.test(type)) {
					code.push(value.chunk);
				} else if (type.startsWith('_')) {
					code.push(value.chunk);
				} else if (value instanceof Object) {

					code.push('{');

					for (let v in value) {

						let entry = value[v];
						if (entry.type === 'function') {
							code.push('\t\t' + v + ': ' + entry.chunk + ',');
						} else if (entry.type === 'lychee.Definition') {
							code.push('\t\t' + v + ': ' + entry.value.reference + ',');
						} else if (entry.type === 'lychee.Namespace') {
							code.push('\t\t' + v + ': ' + entry.value.reference + ',');
						}

						code.push('');

					}


					let last = code[code.length - 2] || '';
					if (last.endsWith(',')) {
						code[code.length - 2] = last.substr(0, last.length - 1);
					}

					code.push('}');

				}


				return code.join('\n');

			}


			return null;

		}

	};


	return Module;

});

