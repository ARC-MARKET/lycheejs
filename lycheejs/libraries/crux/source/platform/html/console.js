
(function(lychee, global) {

	let has_console = 'console' in global && typeof console !== 'undefined';
	if (has_console === false) {
		console = {};
	}

	const  _clear   = console.clear || function() {};
	const  _log     = console.log   || function() {};
	const  _info    = console.info  || console.log;
	const  _warn    = console.warn  || console.log;
	const  _error   = console.error || console.log;
	let    _std_out = '';
	let    _std_err = '';



	/*
	 * HELPERS
	 */

	const _INDENT         = '    ';
	const _args_to_string = function(args) {

		let output = [];

		for (let a = 0, al = args.length; a < al; a++) {

			let value = args[a];
			let o     = 0;

			if (typeof value === 'function') {

				let tmp = (value).toString().split('\n');

				for (let t = 0, tl = tmp.length; t < tl; t++) {
					output.push(tmp[t]);
				}

				o = output.length - 1;

			} else if (value instanceof Object) {

				let tmp = [];

				try {

					let cache = [];

					tmp = JSON.stringify(value, (key, value) => {

						if (value instanceof Object) {

							if (cache.indexOf(value) === -1) {
								cache.push(value);
								return value;
							} else {
								return undefined;
							}

						} else {
							return value;
						}

					}, _INDENT).split('\n');

				} catch (err) {
				}

				if (tmp.length > 1) {

					for (let t = 0, tl = tmp.length; t < tl; t++) {
						output.push(tmp[t]);
					}

					o = output.length - 1;

				} else {

					let chunk = output[o];
					if (chunk === undefined) {
						output[o] = tmp[0].trim();
					} else {
						output[o] = (chunk + ' ' + tmp[0]).trim();
					}

				}

			} else if (typeof value === 'string' && value.includes('\n')) {

				let tmp = value.split('\n');

				for (let t = 0, tl = tmp.length; t < tl; t++) {
					output.push(tmp[t]);
				}

				o = output.length - 1;

			} else {

				let chunk = output[o];
				if (chunk === undefined) {
					output[o] = ('' + value).replace(/\t/g, _INDENT).trim();
				} else {
					output[o] = (chunk + (' ' + value).replace(/\t/g, _INDENT)).trim();
				}

			}

		}


		let ol = output.length;
		if (ol > 1) {
			return output.join('\n');
		} else {
			return output[0];
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	console.clear = function() {
		_clear.call(console);
	};

	console.log = function() {

		let al   = arguments.length;
		let args = [ '(L)' ];
		for (let a = 0; a < al; a++) {
			args.push(arguments[a]);
		}

		_std_out += _args_to_string(args) + '\n';

		_log.apply(console, args);

	};

	console.info = function() {

		let al   = arguments.length;
		let args = [ '(I)' ];
		for (let a = 0; a < al; a++) {
			args.push(arguments[a]);
		}

		_std_out += _args_to_string(args) + '\n';

		_info.apply(console, args);

	};

	console.warn = function() {

		let al   = arguments.length;
		let args = [ '(W)' ];
		for (let a = 0; a < al; a++) {
			args.push(arguments[a]);
		}

		_std_out += _args_to_string(args) + '\n';

		_warn.apply(console, args);

	};

	console.error = function() {

		let al   = arguments.length;
		let args = [ '(E)' ];
		for (let a = 0; a < al; a++) {
			args.push(arguments[a]);
		}

		_std_err += _args_to_string(args) + '\n';

		_error.apply(console, args);

	};

	console.deserialize = function(blob) {

		if (typeof blob.stdout === 'string') {
			_std_out = blob.stdout;
		}

		if (typeof blob.stderr === 'string') {
			_std_err = blob.stderr;
		}

	};

	console.serialize = function() {

		let blob = {};


		if (_std_out.length > 0) blob.stdout = _std_out;
		if (_std_err.length > 0) blob.stderr = _std_err;


		return {
			'reference': 'console',
			'blob':      Object.keys(blob).length > 0 ? blob : null
		};

	};



	/*
	 * EASTER EGG
	 */

	(function(log, console) {

		let ver = lychee.VERSION;
		let css = [
			'font-family:monospace;color:#405050;background:#405050',
			'font-family:monospace;color:#ffffff;background:#405050',
			'font-family:monospace;color:#d0494b;background:#405050'
		];

		let is_chrome  = /Chrome/g.test(navigator.userAgent.split(' ').slice(-2, -1)[0] || '');
		let is_opera   = /OPR/g.test(navigator.userAgent.split(' ').slice(-1) || '');
		let is_safari  = /AppleWebKit/g.test(navigator.userAgent);
		let is_firefox = !!(console.firebug || console.exception);


		if (is_chrome || is_opera) {

			log.call(console, '%c\u2588\u2588\u2588\u2588\u2588%c\u2584\u2584%c\u2588\u2588\u2588\u2588\u2588 %clychee.%cjs%c ' + ver + '     ', css[0], css[2], css[0], css[1], css[2], css[1]);
			log.call(console, '%c\u2588%c\u2580\u2584\u2584%c\u2588%c\u2580\u2580%c\u2588%c\u2584\u2584\u2580%c\u2588 %cIsomorphic Engine     ', css[0], css[1], css[0], css[2], css[0], css[1], css[0], css[1]);
			log.call(console, '%c\u2588%c\u2584\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2584%c\u2588 %chttps://lychee.js.org ',         css[0], css[1], css[0], css[1]);

		} else if (is_firefox || is_safari) {

			log.call(console, '%c\u2588\u2588\u2588\u2588\u2588%c\u2584\u2584%c\u2588\u2588\u2588\u2588\u2588 %clychee.%cjs%c ' + ver + '     ', css[0], css[2], css[0], css[1], css[2], css[1]);
			log.call(console, '%c\u2588%c\u2580\u2584\u2584%c\u2588%c\u2580\u2580%c\u2588%c\u2584\u2584\u2580%c\u2588 %cIsomorphic Engine     ', css[0], css[1], css[0], css[2], css[0], css[1], css[0], css[1]);
			log.call(console, '%c\u2588%c\u2584\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2584%c\u2588 %chttps://lychee.js.org ',         css[0], css[1], css[0], css[1]);

			log.call(console, '%c                                     ', css[1]);
			log.call(console, '%c   Please use Chrome/Chromium/Opera  ', css[1]);
			log.call(console, '%c   We recommend the Blink Dev Tools  ', css[1]);
			log.call(console, '%c                                     ', css[1]);

		} else {

			log.call(console, 'lychee.js ' + ver);
			log.call(console, 'Isomorphic Engine');
			log.call(console, '');
			log.call(console, 'Please use Chrome/Chromium/Opera');
			log.call(console, 'We recommend the Blink Dev Tools');
			log.call(console, '');

		}

	})(_log, console);

})(this.lychee, this);

