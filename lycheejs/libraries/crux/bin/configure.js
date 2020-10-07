#!/usr/local/bin/lycheejs-helper env:node


(function(global) {

	const _fs        = require('fs');
	const _path      = require('path');
	const _process   = global.process;
	const _BOOTSTRAP = {};
	const _CORE      = [];
	let   _PACKAGE   = null;
	const _ROOT      = __filename.split('/').slice(0, -2).join('/');



	/*
	 * CONSOLE POLYFILL
	 */

	const _INDENT     = '    ';
	const _WHITESPACE = new Array(512).fill(' ').join('');

	const _console_log = function(value) {

		let line = ('(L) ' + value).replace(/\t/g, _INDENT).trimRight();
		let maxl = process.stdout.columns - 2;
		if (line.length > maxl) {
			line = line.substr(0, maxl);
		} else {
			line = line + _WHITESPACE.substr(0, maxl - line.length);
		}

		process.stdout.write('\u001b[49m\u001b[97m ' + line + ' \u001b[39m\u001b[49m\u001b[0m\n');

	};

	const _console_error = function(value) {

		let line = ('(E) ' + value).replace(/\t/g, _INDENT).trimRight();
		let maxl = process.stdout.columns - 2;
		if (line.length > maxl) {
			line = line.substr(0, maxl);
		} else {
			line = line + _WHITESPACE.substr(0, maxl - line.length);
		}

		process.stderr.write('\u001b[41m\u001b[97m ' + line + ' \u001b[39m\u001b[49m\u001b[0m\n');

	};



	/*
	 * HELPERS
	 */

	const _is_folder = function(path) {

		try {
			let stat = _fs.lstatSync(path);
			return stat.isDirectory();
		} catch (err) {
			return false;
		}

	};

	const _is_file = function(path) {

		try {
			let stat = _fs.lstatSync(path);
			return stat.isFile();
		} catch (err) {
			return false;
		}

	};

	const _create_folder = function(path, mode) {

		if (mode === undefined) {
			mode = 0o777 & (~_process.umask());
		}


		let is_directory = false;

		try {

			is_directory = _fs.lstatSync(path).isDirectory();

		} catch (err) {

			if (err.code === 'ENOENT') {

				if (_create_folder(_path.dirname(path), mode) === true) {
					_fs.mkdirSync(path, mode);
				}

				try {
					is_directory = _fs.lstatSync(path).isDirectory();
				} catch (err) {
				}

			}

		}


		return is_directory;

	};



	/*
	 * SOURCE MAPS
	 */

	const _BASE64     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	const _base64_vlq = function(raw) {

		let val = '';
		let vlq = raw < 0 ? ((-raw) << 1) + 1 : (raw << 1) + 0;

		do {

			let digit = vlq & ((1 << 5) - 1);

			vlq >>>= 5;

			if (vlq > 0) {
				digit |= (1 << 5);
			}

			val += _BASE64[digit];

		} while (vlq > 0);

		return val;

	};

	const _get_sourcemaps = function(file, entries) {

		let last_id   = 0;
		let last_line = 0;
		let remaining = 0;

		let sources  = entries.map(function(entry) {
			return entry.file;
		});

		let mappings = entries.map(function(entry) {

			let id    = sources.indexOf(entry.file);
			let code  = entry.code;
			let diff  = entry.diff || 0;
			let lines = code.split('\n').length - 1;
			let chunk = '';

			chunk += remaining === 0 ? "A" : "," + _base64_vlq(remaining); // build column 0
			chunk += _base64_vlq(id - last_id);                            // file index
			chunk += _base64_vlq(1  - last_line - diff);                   // line index
			chunk += _base64_vlq(0);                                       // source column 0
			chunk += Array(lines).join(';AACA');

			last_id   = id;
			last_line = lines;


			let check = code.lastIndexOf('\n');
			if (check !== -1) {
				remaining = code.length - check - 1;
			} else {
				remaining = code.length;
			}

			chunk += remaining === 0 ? ';' : (lines !== 0 ? ';AACA' : '');

			if (remaining !== 0) {
				last_line++;
			}

			return chunk;

		});


		return {
			version:  3,
			file:     file,
			sources:  sources,
			mappings: mappings.join('')
		};

	};



	/*
	 * IMPLEMENTATION
	 */

	const _init_lychee = function() {

		return new Promise((resolve, reject) => {

			_console_log('Initializing lychee.js Crux');

			let file = _path.resolve(_ROOT, './lychee.pkg');
			if (_is_file(file) === true) {

				let result = true;


				// XXX: Needs to be global
				global = {};


				try {

					require(_path.resolve(_ROOT, './source/lychee.js'));
					require(_path.resolve(_ROOT, './source/Asset.js'));
					require(_path.resolve(_ROOT, './source/Package.js'));
					require(_path.resolve(_ROOT, './source/Definition.js'));
					require(_path.resolve(_ROOT, './source/Environment.js'));
					require(_path.resolve(_ROOT, './source/Specification.js'));
					require(_path.resolve(_ROOT, './source/Simulation.js'));
					require(_path.resolve(_ROOT, './source/platform/node/console.js'));

					require(_path.resolve(_ROOT, './source/platform/node/BOOTSTRAP.js'));
					require(_path.resolve(_ROOT, './source/platform/node/Buffer.js'));
					require(_path.resolve(_ROOT, './source/platform/node/Config.js'));
					require(_path.resolve(_ROOT, './source/platform/node/Font.js'));
					require(_path.resolve(_ROOT, './source/platform/node/Music.js'));
					require(_path.resolve(_ROOT, './source/platform/node/Sound.js'));
					require(_path.resolve(_ROOT, './source/platform/node/Stuff.js'));
					require(_path.resolve(_ROOT, './source/platform/node/Texture.js'));
					require(_path.resolve(_ROOT, './source/platform/node/FEATURES.js'));

					lychee.init(null);

				} catch (err) {

					_console_error('+--------------------------------+');
					_console_error('| Syntax Error in lychee.js Crux |');
					_console_error('+--------------------------------+');
					_console_error('\n');

					('' || err.stack).split('\n').forEach(function(line) {
						_console_error(line);
					});

					result = false;

				}


				if (result === true) {
					resolve();
				} else {
					reject();
				}

			} else {

				reject();

			}

		});

	};

	const _init_package = function() {

		return new Promise((resolve, reject) => {

			console.log('Initializing lychee.js Package');

			let pkg = new lychee.Package({
				id:  'lychee',
				url: '/libraries/crux/lychee.pkg'
			});

			setTimeout(_ => {

				let files = pkg.getFiles();
				if (files.includes('lychee.js')) {
					_PACKAGE = pkg;
					resolve();
				} else {
					_PACKAGE = null;
					reject();
				}

			}, 200);

		});

	};

	const _load_core = function() {

		return new Promise((resolve, reject) => {

			console.log('Loading lychee.js Crux Core');

			let pkg = _PACKAGE || null;
			if (pkg !== null) {

				let core = pkg.getFiles().filter(function(path) {
					return path.includes('/') === false;
				});

				if (core.indexOf('lychee.js') !== 0) {
					core.reverse();
					core.push(core.splice(core.indexOf('lychee.js'), 1)[0]);
					core.reverse();
				}

				core.forEach(function(file) {

					let path = _path.resolve(_ROOT, './source/' + file);
					if (_is_file(path) === true) {

						_CORE.push({
							code: _fs.readFileSync(path, 'utf8'),
							diff: file === 'lychee.js' ? 1 : 0,
							file: file
						});

					}

				});

				resolve();

			} else {
				reject();
			}

		});

	};

	const _inject_platforms = function() {

		return new Promise((resolve, reject) => {

			console.log('Injecting lychee.js Crux Platforms');

			let pkg = _PACKAGE || null;
			if (pkg !== null) {

				let platforms = Object.keys(pkg.config.buffer.source.tags.platform);
				if (platforms.length > 0) {

					let code = '';

					code += '\n';
					code += JSON.stringify(platforms) + '.forEach(function(platform) {\n';
					code += '\tif (lychee.PLATFORMS.includes(platform) === false) {\n';
					code += '\t\tlychee.PLATFORMS.push(platform);\n';
					code += '\t}\n';
					code += '});\n';
					code += '\n';

					_CORE.push({
						code: code,
						file: '@platforms.js'
					});

				}

				resolve();

			} else {
				reject();
			}

		});

	};

	const _BOOTSTRAP_PRIORITY = [
		'console.js',
		'BOOTSTRAP.js',
		'Buffer.js',
		'Config.js',
		'Font.js',
		'Music.js',
		'Sound.js',
		'Stuff.js',
		'Texture.js',

		// XXX: All builds contain all FEATURES.js files
		'FEATURES.js'

	];

	const _load_bootstrap = function() {

		return new Promise((resolve, reject) => {

			console.log('Loading lychee.js Crux Bootstrap');

			let pkg = _PACKAGE || null;
			if (pkg !== null) {

				let platforms = Object.keys(pkg.config.buffer.source.tags.platform);
				if (platforms.length > 0) {

					platforms.forEach(platform => {

						let check = _BOOTSTRAP[platform] || null;
						if (check === null) {
							_BOOTSTRAP[platform] = [];
						}

						_BOOTSTRAP_PRIORITY.forEach(file => {

							let path = _path.resolve(_ROOT, './source/platform/' + platform + '/' + file);
							if (_is_file(path) === true) {

								_BOOTSTRAP[platform].push({
									code: _fs.readFileSync(path, 'utf8'),
									file: 'platform/' + platform + '/' + file
								});

							}

						});

					});

					resolve();

				} else {
					reject();
				}

			} else {
				reject();
			}

		});

	};

	const _build = function() {

		return new Promise((resolve, reject) => {

			console.log('Building lychee.js Crux');


			let features = [];

			for (let platform in _BOOTSTRAP) {

				let file = _BOOTSTRAP[platform].find(src => src.file.endsWith('FEATURES.js')) || null;
				if (file !== null) {
					features.push(file);
				}

			}


			for (let platform in _BOOTSTRAP) {

				let filtered = Array.from(_CORE);

				if (platform.includes('-')) {

					_BOOTSTRAP_PRIORITY.filter(file => file !== 'FEATURES.js').forEach(file => {

						let base = _BOOTSTRAP[platform.split('-')[0]].find(src => src.file.endsWith(file)) || null;
						if (base !== null) {
							filtered.push(base);
						}

						let incr = _BOOTSTRAP[platform].find(src => src.file.endsWith(file)) || null;
						if (incr !== null) {
							filtered.push(incr);
						}

					});

				} else {

					_BOOTSTRAP[platform].filter(file => file !== 'FEATURES.js').forEach(file => filtered.push(file));

				}


				if (features.length > 0) {
					features.forEach(feature => filtered.push(feature));
				}


				let sources = filtered.map(function(src) {

					return {
						code: src.code,
						diff: src.diff || 0,
						file: src.file.startsWith('@') ? src.file : '/libraries/crux/source/' + src.file
					};

				});


				let file = '/libraries/crux/build/' + platform + '/dist.js';
				let maps = _get_sourcemaps(file, sources);
				let path = _path.resolve(_ROOT, './' + file.split('/').slice(3).join('/'));


				let folder = _path.dirname(path);
				if (_is_folder(folder) === false) {
					_create_folder(folder);
				}


				let result = true;

				if (_is_folder(folder) === true) {

					let code = sources.map(src => src.code).join('');
					try {
						_fs.writeFileSync(path, code, 'utf8');
					} catch (err) {
						result = false;
					}


					let json = JSON.stringify(maps, null, '\t');
					try {
						_fs.writeFileSync(path + '.map', json, 'utf8');
					} catch (err) {
					}

				} else {
					result = false;
				}


				if (result === false) {
					console.warn('\t' + platform + ': FAILURE (Could not write to "' + path + '")');
				} else {
					console.log('\t' + platform + ': SUCCESS');
				}

			}


			resolve();

		});

	};



	/*
	 * INITIALIZATION
	 */


	(async function execute() {

		const _on_error = err => {
			console.error('FAILURE');
			process.exit(1);
		};

		await _init_lychee().catch(_on_error);
		await _init_package().catch(_on_error);

		await _load_core().catch(_on_error);
		await _inject_platforms().catch(_on_error);

		await _load_bootstrap().catch(_on_error);
		await _build().catch(_on_error);


		console.info('SUCCESS');
		process.exit(0);

	})();

})(typeof global !== 'undefined' ? global : this);

