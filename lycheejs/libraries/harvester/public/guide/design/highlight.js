
(function(global, $) {

	const _LANGUAGES = {};

	_LANGUAGES['bash'] = _LANGUAGES['sh'] = {

		builtins: [

			'alias',
			'bind', 'break', 'builtin',
			'caller', 'cd', 'command', 'continue',
			'declare',
			'echo', 'enable', 'eval', 'exec', 'exit', 'export',
			'help',
			'getopts',
			'hash',
			'kill',
			'logout',
			'mapfile',
			'printf', 'pwd',
			'read', 'readarray', 'readonly',
			'shift', 'sleep', 'source', 'stat',
			'test', 'times', 'trap', 'type', 'typeset',
			'ulimit', 'umask', 'unalias', 'unset',
			'wait', 'which',

			'-a',
			'-d',
			'-e', '-eq',
			'-f',
			'-gt',
			'-l', '-lt',
			'-ne',
			'-s'

		],

		keywords: [
			'case',
			'do', 'done',
			'elif', 'else', 'esac',
			'fi', 'for', 'function',
			'if', 'in',
			'let', 'local',
			'return',
			'set', 'shopt',
			'then',
			'while'
		],

		literals: [
			'false',
			'true'
		],

		warnings: [
			'sudo',
			'su',
			'su -'
		],

		constants: {
			comment: [
				new RegExp('(#(.*)\n)', 'g')
			],
			number: [
				new RegExp('((-?)(\\d+))', 'g')
			],
			string: [
				new RegExp('(\'(.*?)\')', 'g'),
				new RegExp('("([^"]+)")', 'g')
			]
		}

	};

	_LANGUAGES['ecmascript'] = _LANGUAGES['javascript'] = {

		builtins: [
			'Array', 'ArrayBuffer', 'arguments',
			'Boolean',
			'Date', 'DateView',
			'Error', 'EvalError', 'escape', 'eval',
			'Float32Array', 'Float64Array', 'Function',
			'Int8Array', 'Int16Array', 'Int32Array', 'InternalError', 'Intl', 'isFinite', 'isNaN',
			'JSON',
			'Map', 'Math',
			'Number',
			'Object',
			'Promise', 'Proxy', 'parseFloat', 'parseInt',
			'RangeError', 'Reflect', 'ReferenceError', 'RegExp',
			'Set', 'StopIteration', 'String', 'Symbol', 'SyntaxError',
			'TypeError',
			'Uint8Array', 'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'unescape',
			'WeakMap', 'WeakSet',

			// lychee.js Crux
			'Asset', 'Config', 'Music', 'Sound', 'Stuff', 'Texture'
		],

		keywords: [
			'as', 'async', 'await',
			'break',
			'case', 'catch', 'const', 'continue',
			'debugger', 'default', 'delete', 'do',
			'else', 'export',
			'finally', 'for', 'from', 'function',
			'if', 'import', 'in', 'instanceof',
			'let',
			'new',
			'of',
			'return',
			'static', 'super', 'switch',
			'that', 'this', 'throw', 'try', 'typeof',
			'void',
			'while',
			'yield'
		],

		literals: [
			'false',
			'Infinity',
			'NaN', 'null',
			'true',
			'undefined'
		],

		warnings: [
			'var',
			'with'
		],

		constants: {
			comment: [
				new RegExp('(//(.*)\n)', 'g')
			],
			number: [
				new RegExp('(0[bB][01]+?)', 'g'),
				new RegExp('(0[oO][0-7]+?)', 'g'),
				new RegExp('(0x[a-fA-F0-9]+)', 'g'),
				new RegExp('((-?)(\\d[eE][-+]?\\d+))', 'g'),
				new RegExp('((-?)(\\d.\\d+))', 'g'),
				new RegExp('((-?)(\\d+))', 'g')
			],
			string: [
				new RegExp('(\'(.*?)\')', 'g'),
				new RegExp('("([^"]+)")', 'g')
			]
		}

	};



	/*
	 * HELPERS
	 */

	const _get_line = function(code, index) {

		let line = '';

		if (index !== -1) {

			let i0 = code.lastIndexOf('\n', index);
			let i1 = code.indexOf('\n',     index + 1);

			if (i1 === -1) {
				i1 = code.length - 1;
			}

			if (i0 !== -1 && i1 !== -1) {
				line = code.substr(i0 + 1, i1 - i0 - 1);
			}

		}

		return line;

	};

	const _replace_comment_multi = function(code) {

		// XXX: Fuck ES multiline regexes in particular
		// let multi = /\/\*[\s\S]*?\*\/.*$/gm;

		let off = 0;
		let i0  = code.indexOf('/*', off);
		let i1  = code.indexOf('*/', off + i0 + 1);

		while (i0 !== -1 && i1 !== -1) {

			let comment = code.substr(i0, i1 - i0 + 2).split('\n').map(line => {
				return '<span class="ast-comment">' + line + '</span>';
			}).join('\n');

			code = code.substr(0, i0) + comment + code.substr(i1 + 2);

			off = i1 + 2;
			i0  = code.indexOf('/*', off);
			i1  = code.indexOf('*/', i0 + 1);

		}

		return code;

	};

	const _replace = function(code, key, type) {

		let regexp = new RegExp('([\\(|\\)|\\n|\\s]+)(' + key + ')(\\s|\\(|\\)|,|;|\\.)', 'g');

		code = code.replace(regexp, '$1<span class="ast-' + type + ' ast-' + key.toLowerCase() + '">$2</span>$3');

		return code;

	};

	const _replace_regexp = function(code, pattern, type) {

		let match = code.match(pattern);
		if (match !== null) {

			let check    = match[0];
			let new_line = pattern.source.endsWith('\n)');

			if (check.includes('<') === false && check.includes('ast-') === false) {
				code = code.replace(pattern, '<span class="ast-constant ast-' + type + '">$1</span>' + (new_line ? '\n' : ''));
			}

		}

		return code;

	};



	/*
	 * IMPLEMENTATION
	 */

	const highlight = function(code, lang) {

		let language = _LANGUAGES[lang] || null;
		if (language !== null) {

			Object.keys(language.constants).forEach(type => {

				language.constants[type].forEach(regexp => {
					code = _replace_regexp(code, regexp, type);
				});

			});

			let builtins = language.builtins;
			if (builtins.length > 0) {

				for (let b = 0, bl = builtins.length; b < bl; b++) {

					let word  = builtins[b];
					let check = code.indexOf(word);
					if (check !== -1) {

						let line = _get_line(code, check);
						if (line.startsWith('<span class="ast-comment">') === false) {
							code = _replace(code, word, 'builtin');
						}

					}

				}

			}

			let literals = language.literals;
			if (literals.length > 0) {

				for (let l = 0, ll = literals.length; l < ll; l++) {

					let word  = literals[l];
					let check = code.indexOf(word);
					if (check !== -1) {

						let line = _get_line(code, check);
						if (line.startsWith('<span class="ast-comment">') === false) {
							code = _replace(code, word, 'literal');
						}

					}

				}

			}

			let keywords = language.keywords;
			if (keywords.length > 0) {

				for (let k = 0, kl = keywords.length; k < kl; k++) {

					let word  = keywords[k];
					let check = code.indexOf(word);
					if (check !== -1) {

						let line = _get_line(code, check);
						if (line.startsWith('<span class="ast-comment">') === false) {
							code = _replace(code, word, 'keyword');
						}

					}

				}

			}

			let warnings = language.warnings;
			if (warnings.length > 0) {

				for (let w = 0, wl = warnings.length; w < wl; w++) {

					let word  = warnings[w];
					let check = code.indexOf(word);
					if (check !== -1) {
						code = _replace(code, word, 'warning');
					}

				}

			}

			code = _replace_comment_multi(code);

		}


		return code;

	};


	global.$highlight = highlight;

})(typeof window !== 'undefined' ? window : this, window.$);

