
lychee.define('strainer.api.Core').requires([
	'strainer.api.PARSER'
]).exports((lychee, global, attachments) => {

	const _PARSER = lychee.import('strainer.api.PARSER');



	/*
	 * HELPERS
	 */

	const _validate_asset = function(asset) {

		if (asset instanceof Object && typeof asset.serialize === 'function') {
			return true;
		}

		return false;

	};

	const _parse_type = function(result, stream, errors) {

		let i_callback   = stream.lastIndexOf('return Callback;');
		let i_composite  = stream.lastIndexOf('return Composite;');
		let i_module     = stream.lastIndexOf('return Module;');
		let i_check      = Math.max(i_callback, i_composite, i_module);
		let is_callback  = i_check !== -1 && i_check === i_callback;
		let is_composite = i_check !== -1 && i_check === i_composite;
		let is_module    = i_check !== -1 && i_check === i_module;

		if (is_callback) {
			result.type = 'Callback';
		} else if (is_composite) {
			result.type = 'Composite';
		} else if (is_module) {
			result.type = 'Module';
		}

	};

	const _parse_identifier = function(result, stream, errors) {

		let i1  = stream.indexOf('lychee');
		let i2  = stream.indexOf('\n', i1);
		let tmp = stream.substr(0, i2).trim();

		if (tmp.includes(' = ') && tmp.endsWith('(function(global) {')) {

			let tmp1 = tmp.split(/lychee\.([A-Za-z]+)\s=(.*)/g);
			if (tmp1.length > 1) {

				let id = tmp1[1];
				if (id.charAt(0) === id.charAt(0).toUpperCase()) {
					result.identifier = 'lychee.' + id;
				}

			} else if (tmp === 'lychee = (function(global) {') {

				result.identifier = 'lychee';

			}

		} else {

			errors.push({
				url:       null,
				rule:      'no-define',
				reference: null,
				message:   'Invalid Definition (missing "<lychee.Definition> = (function(global) {})()").',
				line:      0,
				column:    0
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
				'reference': 'strainer.api.Core',
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
				exports:    null,
				supports:   null,
				type:       null
			};

			if (asset !== null) {

				let stream = asset.buffer.toString('utf8');


				_parse_type(result, stream, errors);
				_parse_identifier(result, stream, errors);


				let i1 = stream.indexOf('=');
				let i2 = stream.indexOf(': (function(global) {\n', i1);
				let i3 = stream.indexOf('= (function(global) {\n');
				let i4 = stream.indexOf('(function(lychee, global) {\n');

				if (i1 === -1 && i4 === -1) {

					errors.push({
						url:       null,
						rule:      'no-core-define',
						reference: null,
						message:   'Invalid Core (missing assignment).',
						line:      0,
						column:    0
					});

				}

				if (i1 !== i3 && i2 === -1 && i4 === -1) {

					errors.push({
						url:       null,
						rule:      'no-core-exports',
						reference: null,
						message:   'Invalid Core (missing (function(global) {})().',
						line:      0,
						column:    0
					});

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

						code = identifier + ' = typeof ' + identifier + ' !== undefined ? ' + identifier + ' : (function(global) {';
						code += '\n\n%BODY%\n\n';
						code += '})(typeof window !== undefined ? window : (typeof global !== undefined ? global : this));';
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

