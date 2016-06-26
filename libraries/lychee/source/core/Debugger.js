
lychee.Debugger = typeof lychee.Debugger !== 'undefined' ? lychee.Debugger : (function(global) {

	/*
	 * HELPERS
	 */

	var _client      = null;
	var _environment = null;

	var _bootstrap_environment = function() {

		if (_environment === null) {

			var currentenv = lychee.environment;
			lychee.setEnvironment(null);

			var defaultenv = lychee.environment;
			lychee.setEnvironment(currentenv);

			_environment = defaultenv;

		}

	};

	var _diff_environment = function(environment) {

		var cache1 = {};
		var cache2 = {};

		var global1 = _environment.global;
		var global2 = environment.global;

		for (var prop1 in global1) {

			if (global1[prop1] === global2[prop1]) continue;

			if (typeof global1[prop1] !== typeof global2[prop1]) {
				cache1[prop1] = global1[prop1];
			}

		}

		for (var prop2 in global2) {

			if (global2[prop2] === global1[prop2]) continue;

			if (typeof global2[prop2] !== typeof global1[prop2]) {
				cache2[prop2] = global2[prop2];
			}

		}


		var diff = Object.assign({}, cache1, cache2);
		if (Object.keys(diff).length > 0) {
			return diff;
		}


		return null;

	};

	var _report_error = function(environment, data) {

		var main = environment.global.MAIN || null;
		if (main !== null) {

			var client = main.client || null;
			if (client !== null) {

				var service = client.getService('debugger');
				if (service !== null) {
					service.report('lychee.Debugger: Report from ' + data.file + '#L' + data.line + ' in ' + data.method + '', data);
				}

			}

		}


		console.error('lychee.Debugger: Report from ' + data.file + '#L' + data.line + ' in ' + data.method + '');
		console.error('lychee.Debugger:             ' + data.definition + ' - "' + data.message + '"');

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'lychee.Debugger',
				'blob':      null
			};

		},

		expose: function(environment) {

			environment = environment instanceof lychee.Environment ? environment : lychee.environment;


			_bootstrap_environment();


			if (environment !== null && environment !== _environment) {

				var project = environment.id;
				if (project !== null) {

					if (lychee.diff(environment.global, _environment.global) === true) {

						var diff = _diff_environment(environment);
						if (diff !== null) {
							return diff;
						}

					}

				}

			}


			return null;

		},

		report: function(environment, error, referer) {


			_bootstrap_environment();


			environment = environment instanceof lychee.Environment ? environment : null;
			error       = error instanceof Error                    ? error       : null;
			referer     = referer instanceof Object                 ? referer     : null;


			if (environment !== null && error !== null) {

				var definition = null;

				if (referer !== null) {

					if (referer instanceof Stuff) {
						definition = referer.url;
					} else if (referer instanceof lychee.Definition) {
						definition = referer.id;
					}

				}


				var data = {
					project:     environment.id,
					definition:  definition,
					environment: environment.serialize(),
					file:        null,
					line:        null,
					method:      null,
					type:        error.toString().split(':')[0],
					message:     error.message
				};


				if (typeof error.stack === 'string') {

					var callsite = error.stack.split('\n')[0].trim();
					if (callsite.charAt(0) === '/') {

						data.file = callsite.split(':')[0];
						data.line = callsite.split(':')[1] || '';

					} else {

						callsite = error.stack.split('\n').find(function(val) {
							return val.trim().substr(0, 2) === 'at';
						});

						if (typeof callsite === 'string') {

							var tmp1 = callsite.split(' ');
							var tmp2 = tmp1[2];

							if (tmp2.charAt(0) === '(')               tmp2 = tmp2.substr(1);
							if (tmp2.charAt(tmp2.length - 1) === ')') tmp2 = tmp2.substr(0, tmp2.length - 1);


							var tmp3 = tmp2.split(':');

							data.file   = tmp3[0];
							data.line   = tmp3[1];
							data.code   = '';
							data.method = tmp1[1];

						}

					}

				} else if (typeof Error.captureStackTrace === 'function') {

					var orig = Error.prepareStackTrace;

					Error.prepareStackTrace = function(err, stack) { return stack; };
					Error.captureStackTrace(new Error());


					var stack    = [].slice.call(error.stack);
					var callsite = stack.shift();
					var FILTER   = [ 'module.js', 'vm.js', 'internal/module.js' ];

					while (callsite !== undefined && FILTER.indexOf(callsite.getFileName()) !== -1) {
						callsite = stack.shift();
					}

					if (callsite !== undefined) {

						data.file   = callsite.getFileName();
						data.line   = callsite.getLineNumber();
						data.code   = '' + (callsite.getFunction() || '').toString();
						data.method = callsite.getFunctionName() || callsite.getMethodName();

					}

					Error.prepareStackTrace = orig;

				}


				_report_error(environment, data);


				return true;

			}


			return false;

		}

	};


	return Module;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

