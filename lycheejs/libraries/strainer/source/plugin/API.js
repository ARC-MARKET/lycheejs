
lychee.define('strainer.plugin.API').requires([
	'strainer.api.Callback',
	'strainer.api.Composite',
	'strainer.api.Core',
	'strainer.api.Definition',
	'strainer.api.Module',
	'strainer.api.Sandbox',
	'strainer.api.Specification',
	'strainer.fix.API'
]).exports((lychee, global, attachments) => {

	const _FIXES = lychee.import('strainer.fix.API');
	const _api   = {
		Callback:      lychee.import('strainer.api.Callback'),
		Composite:     lychee.import('strainer.api.Composite'),
		Core:          lychee.import('strainer.api.Core'),
		Definition:    lychee.import('strainer.api.Definition'),
		Module:        lychee.import('strainer.api.Module'),
		Sandbox:       lychee.import('strainer.api.Sandbox'),
		Specification: lychee.import('strainer.api.Specification')
	};



	/*
	 * HELPERS
	 */

	const _validate_asset = function(asset) {

		if (asset instanceof Object && typeof asset.serialize === 'function') {
			return true;
		}

		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Module = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'strainer.plugin.API',
				'arguments': []
			};

		},

		check: function(asset) {

			asset = _validate_asset(asset) === true ? asset : null;


			if (asset !== null) {

				let header = null;
				let report = null;
				let api    = null;
				let stream = asset.buffer.toString('utf8');
				let first  = stream.trim().split('\n')[0];


				let is_core          = asset.url.startsWith('/libraries/crux/source') && (first.endsWith('(function(global) {') || first.endsWith('(function(lychee, global) {'));
				let is_definition    = first.startsWith('lychee.define(');
				let is_specification = first.startsWith('lychee.specify(');

				if (is_definition === true) {

					header = _api['Definition'].check(asset);
					api    = _api[header.result.type] || null;

				} else if (is_specification === true) {

					header = _api['Specification'].check(asset);
					api    = _api['Sandbox'] || null;

				} else if (is_core === true) {

					header = _api['Core'].check(asset);
					api    = _api[header.result.type] || null;

				} else {

					if (asset.url.includes('/source/')) {

						header = _api['Definition'].check(asset);
						api    = _api[header.result.type] || null;

					} else if (asset.url.includes('/review/')) {

						header = _api['Specification'].check(asset);
						api    = _api['Sandbox'] || null;

					} else {

						// XXX: autofix assumes lychee.Definition syntax
						header = _api['Definition'].check(asset);
						api    = _api[header.result.type] || null;

					}

				}


				if (api !== null) {

					report = api.check(asset, header.result);

				} else {

					// XXX: autofix assumes lychee.Definition
					report = {
						memory: {},
						errors: [],
						result: {
							constructor: {
								body:       null,
								hash:       null,
								parameters: []
							},
							states:      {},
							properties:  {},
							enums:       {},
							events:      {},
							methods:     {},
							type:        null
						}
					};

				}


				if (header !== null && report !== null) {

					if (header.errors.length > 0) {

						let errors = [];

						errors.push.apply(errors, header.errors);
						errors.push.apply(errors, report.errors);

						report.errors = errors;

					}


					report.errors.forEach(err => {

						if (err.url === null) {
							err.url = asset.url;
						}

					});


					return {
						header: header.result,
						memory: report.memory,
						errors: report.errors,
						result: report.result
					};

				} else if (report !== null) {

					return {
						header: null,
						memory: report.memory,
						errors: report.errors,
						result: report.result
					};

				}

			}


			return null;

		},

		fix: function(asset, report) {

			asset  = _validate_asset(asset) === true ? asset  : null;
			report = report instanceof Object        ? report : null;


			let filtered = [];

			if (asset !== null && report !== null) {

				let code     = asset.buffer.toString('utf8');
				let modified = false;


				report.errors.forEach(err => {

					let rule = err.rule;

					let fix = _FIXES[rule] || null;
					if (fix !== null) {

						let result = fix(err, report, code);
						if (result !== null) {
							code     = result;
							modified = true;
						} else {
							filtered.push(err);
						}

					} else {

						filtered.push(err);

					}

				});


				if (modified === true) {
					asset.buffer    = Buffer.alloc(code.length, code, 'utf8');
					asset._MODIFIED = true;
				}

			}


			return filtered;

		},

		transcribe: function(asset) {

			asset = _validate_asset(asset) === true ? asset : null;


			if (asset !== null) {

				let report = asset.buffer || {
					header: {},
					memory: {},
					errors: [],
					result: {}
				};


				// TODO: Replace asset.buffer.header.identifier
				// in case library's definition starts with library namespace


				let api    = null;
				let header = null;
				let code   = null;


				let is_core          = asset.url.startsWith('/libraries/crux/source');
				let is_definition    = is_core === false && asset.url.includes('/api/');
				let is_specification = false;

				let type = report.header.type || null;
				if (type === 'Sandbox') {
					is_definition    = false;
					is_specification = true;
				} else if (type === 'Callback' || type === 'Composite' || type === 'Module') {
					is_definition    = true;
					is_specification = false;
				}


				if (is_definition === true) {
					header = _api['Definition'].transcribe(asset);
				} else if (is_specification === true) {
					header = _api['Specification'].transcribe(asset);
				} else if (is_core === true) {
					header = _api['Core'].transcribe(asset);
				}


				if (type === 'Callback') {
					api = _api['Callback'] || null;
				} else if (type === 'Composite') {
					api = _api['Composite'] || null;
				} else if (type === 'Module') {
					api = _api['Module'] || null;
				} else if (type === 'Sandbox') {
					api = _api['Sandbox'] || null;
				}


				if (header !== null && api !== null) {

					let tmp = api.transcribe(asset);
					if (tmp !== null) {
						code = header.replace('%BODY%', tmp);
					}

				}


				return code;

			}


			return null;

		}

	};


	return Module;

});

