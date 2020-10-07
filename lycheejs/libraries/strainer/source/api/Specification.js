
lychee.define('strainer.api.Specification').requires([
	'strainer.api.PARSER'
]).exports((lychee, global, attachments) => {

	const _PARSER = lychee.import('strainer.api.PARSER');



	/*
	 * HELPERS
	 */

	const _create_error = function(rule, message) {

		return {
			url:       null,
			rule:      rule,
			reference: null,
			message:   message,
			line:      0,
			column:    0

		};

	};

	const _validate_asset = function(asset) {

		if (asset instanceof Object && typeof asset.serialize === 'function') {
			return true;
		}

		return false;

	};

	const _parse_value = function(str) {

		let val = undefined;
		if (/^(this|global)$/g.test(str) === false) {

			try {
				val = eval('(' + str + ')');
			} catch (err) {
			}

		}

		return val;

	};

	const _parse_identifier = function(result, stream, errors) {

		let i1  = stream.indexOf('lychee');
		let i2  = stream.indexOf('\n', i1);
		let tmp = stream.substr(0, i2).trim();

		if (tmp.startsWith('lychee.specify(')) {

			let tmp1 = tmp.split(/lychee\.specify\("?'?([A-Za-z.-]+)"?'?\)\.(.*)/g);
			if (tmp1.length > 1) {

				let id = tmp1[1];
				if (id.charAt(0) === id.charAt(0).toUpperCase()) {
					result.identifier = 'lychee.' + id;
				} else {
					result.identifier = id;
				}

			}

		}

	};

	const _parse_requires = function(requires, stream, errors) {

		let i1 = stream.indexOf('requires([');
		let i2 = stream.indexOf('\n])', i1);
		let i3 = stream.indexOf('exports((lychee, sandbox) => {\n');

		if (i1 !== -1 && i2 !== -1 && i3 !== -1 && i1 < i3) {

			let tmp1 = stream.substr(i1 + 9, i2 - i1 - 7);
			if (tmp1.length > 0 && tmp1.startsWith('[') && tmp1.endsWith(']')) {

				let tmp2 = _parse_value(tmp1);
				if (tmp2 !== undefined && tmp2 instanceof Array) {

					tmp2.forEach(value => {

						if (requires.includes(value) === false) {
							requires.push(value);
						}

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
				'reference': 'strainer.api.Specification',
				'arguments': []
			};

		},

		check: function(asset) {

			asset = _validate_asset(asset) === true ? asset : null;


			let errors = [];
			let result = {
				identifier: null,
				attaches:   {},
				tags:       {},
				requires:   [],
				includes:   [],
				supports:   {},
				type:       'Sandbox'
			};

			if (asset !== null) {

				let stream = asset.buffer.toString('utf8');

				_parse_identifier(result, stream, errors);
				_parse_requires(result.requires, stream, errors);


				let i1 = stream.indexOf('lychee.specify(');
				let i2 = stream.indexOf('exports((lychee, sandbox) => {\n', i1);

				if (i1 === -1) {

					errors.push({
						url:       null,
						rule:      'no-specify',
						reference: null,
						message:   'Invalid Specification (missing specify()).',
						line:      0,
						column:    0
					});

				}

				if (i2 === -1) {

					errors.push({
						url:       null,
						rule:      'no-exports',
						reference: null,
						message:   'Invalid Specification (missing exports()).',
						line:      0,
						column:    0
					});

				}


				let i3 = stream.indexOf('requires([\n');
				let i4 = stream.indexOf('exports((lychee, sandbox) => {\n');

				if (i3 !== -1 && i4 !== -1 && i3 > i4) {
					errors.push(_create_error('no-meta', 'Invalid Specification ("requires()" after "exports()").'));
				}

			}


			return {
				errors: errors,
				result: result
			};

		},

		transcribe: function(asset) {

			asset = _validate_asset(asset) === true ? asset : null;


			if (asset !== null) {

				let code   = null;
				let report = asset.buffer || {
					header: {},
					memory: {},
					errors: [],
					result: {}
				};


				if (report.header instanceof Object) {

					let identifier = report.header.identifier || null;
					if (identifier !== null) {

						code = 'lychee.specify(\'' + report.header.identifier + '\')';


						let requires = report.header.requires || [];
						if (requires.length > 0) {
							code += '.requires([\n';
							code += requires.map(value => '\t\'' + value.toString() + '\'').join(',\n') + '\n';
							code += '])';
						}


						code += '.exports((lychee, sandbox) => {';
						code += '\n\n%BODY%\n\n';
						code += '});';
						code += '\n';


						return code;

					}

				}

			}


			return null;

		}

	};


	return Module;

});

