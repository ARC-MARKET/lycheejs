#!/usr/bin/env node



(function(global) {

	const _fs        = require('fs');
	const _path      = require('path');
	const _process   = global.process;
	let   _CORE      = '';
	const _ASSETS    = {};
	const _BOOTSTRAP = {};
	let   _PACKAGE   = null;
	const _PLATFORM  = _process.argv[2] || null;
	const _ROOT      = _path.resolve(_process.cwd(), '.');



	/*
	 * CONSOLE POLYFILL
	 */

	const _log          = console.log;
	const _error        = console.error;
	const _INDENT       = '    ';
	const _INDENT_PLAIN = '           ';
	const _WHITESPACE   = new Array(512).fill(' ').join('');

	const _console_log = function(value) {

		let line = ('  (L) ' + value).replace(/\t/g, _INDENT).trimRight();
		let maxl = process.stdout.columns - 4;
		if (line.length > maxl) {
			line = line.substr(0, maxl);
		} else {
			line = line + _WHITESPACE.substr(0, maxl - line.length);
		}

		_log.call(console, line);

	};

	const _console_error = function(value) {

		let line = ('(E) ' + value).replace(/\t/g, _INDENT).trimRight();
		let maxl = process.stdout.columns - 4;
		if (line.length > maxl) {
			line = line.substr(0, maxl);
		} else {
			line = line + _WHITESPACE.substr(0, maxl - line.length);
		}

		_error.call(console,
			'\u001b[37m',
			'\u001b[41m',
			line,
			'\u001b[49m',
			'\u001b[39m'
		);

	};



	/*
	 * ECMA POLYFILL
	 */

	(function() {

		if (typeof Object.values !== 'function') {

			Object.values = function(object) {

				if (object !== Object(object)) {
					throw new TypeError('Object.values called on a non-object');
				}


				let values = [];

				for (let prop in object) {

					if (Object.prototype.hasOwnProperty.call(object, prop)) {
						values.push(object[prop]);
					}

				}

				return values;

			};

		}

	})();



	/*
	 * HELPERS
	 */

	const _is_directory = function(path) {

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

	const _create_directory = function(path, mode) {

		if (mode === undefined) {
			mode = 0o777 & (~_process.umask());
		}


		let is_directory = false;

		try {

			is_directory = _fs.lstatSync(path).isDirectory();

		} catch (err) {

			if (err.code === 'ENOENT') {

				if (_create_directory(_path.dirname(path), mode) === true) {
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

	const _remove_directory = function(path) {

		path = _path.resolve(path);


		if (_is_directory(path) === true) {

			_fs.readdirSync(path).forEach(function(file) {

				if (_is_directory(path + '/' + file) === true) {
					_remove_directory(path + '/' + file);
				} else {
					_fs.unlinkSync(path + '/' + file);
				}

			});

			_fs.rmdirSync(path);

		}

	};

	const _get_projects = function(path) {

		let projects      = [];
		let projects_root = _path.resolve(_ROOT, path);

		if (_is_directory(projects_root) === true) {

			projects = _fs.readdirSync(projects_root).filter(function(file) {
				return _is_directory(projects_root + '/' + file) === true;
			}).map(function(file) {
				return path + '/' + file;
			});

		}

		return projects;

	};

	const _walk_directory = function(files, node, path, attachments) {

		if (node instanceof Array) {

			if (node.indexOf('js') !== -1) {
				files.push(path + '.js');
			}

			if (attachments === true) {

				node.filter(function(ext) {
					return ext !== 'js';
				}).forEach(function(ext) {
					files.push(path + '.' + ext);
				});

			}

		} else if (node instanceof Object) {

			Object.keys(node).forEach(function(child) {
				_walk_directory(files, node[child], path + '/' + child, attachments);
			});

		}

	};

	const _package_assets = function(json) {

		let files = [];

		if (json !== null) {

			let root = json.source.files || null;
			if (root !== null) {
				_walk_directory(files, root, '', true);
			}

		}


		return files.map(function(value) {
			return value.substr(1);
		}).sort(function(a, b) {
			if (a > b) return  1;
			if (a < b) return -1;
			return 0;
		}).filter(function(value) {
			return value.indexOf('__') === -1;
		});

	};

	const _package_definitions = function(json) {

		let files = [];

		if (json !== null) {

			let root = json.source.files || null;
			if (root !== null) {
				_walk_directory(files, root, '', false);
			}

		}


		return files.map(function(value) {
			return value.substr(1);
		}).filter(function(value) {
			return value.substr(0, 4) !== 'core' && value.substr(0, 8) !== 'platform';
		}).map(function(value) {
			return 'lychee.' + value.split('.')[0].split('/').join('.');
		}).filter(function(value) {
			return value.indexOf('__') === -1;
		});

	};

	const _package_files = function(json) {

		let files = [];

		if (json !== null) {

			let root = json.source.files || null;
			if (root !== null) {
				_walk_directory(files, root, '', false);
			}

		}


		return files.map(function(value) {
			return value.substr(1);
		}).sort(function(a, b) {
			if (a > b) return  1;
			if (a < b) return -1;
			return 0;
		}).filter(function(value) {
			return value.indexOf('__') === -1;
		});

	};



	/*
	 * 0: ENVIRONMENT CHECK (SYNC)
	 */

	(function(libraries, projects, cultivator) {

		let errors = 0;

		console.log('  (L) Checking Environment');


		if (libraries.indexOf('./libraries/lychee') !== -1) {
			_console_log('\tprocess cwd: OKAY');
		} else {
			_console_log('\tprocess cwd: FAIL (' + _ROOT + ' is not the lychee.js directory)');
			errors++;
		}


		let data = null;

		if (_is_file(_path.resolve(_ROOT, './libraries/lychee/lychee.pkg')) === true) {

			try {
				data = JSON.parse(_fs.readFileSync(_path.resolve(_ROOT, './libraries/lychee/lychee.pkg')));
			} catch (err) {
				data = null;
			}

		}


		if (data !== null) {
			_PACKAGE = data;
			_console_log('\t./libraries/lychee/lychee.pkg: OKAY');
		} else {
			_console_log('\t./libraries/lychee/lychee.pkg: FAIL (Invalid JSON)');
			errors++;
		}


		if (_is_file(_path.resolve(_ROOT, './libraries/lychee/source/platform/node/bootstrap.js')) === true) {

			global = {};

			try {

				require(_path.resolve(_ROOT, './libraries/lychee/source/core/lychee.js'));
				require(_path.resolve(_ROOT, './libraries/lychee/source/core/Asset.js'));
				require(_path.resolve(_ROOT, './libraries/lychee/source/core/Definition.js'));
				require(_path.resolve(_ROOT, './libraries/lychee/source/core/Environment.js'));
				require(_path.resolve(_ROOT, './libraries/lychee/source/core/Package.js'));
				require(_path.resolve(_ROOT, './libraries/lychee/source/platform/node/bootstrap.js'));

				lychee.envinit(null);

			} catch (err) {

				_console_error('+---------------------------------+');
				_console_error('| Syntax Error in lychee.js Core  |');
				_console_error('+---------------------------------+');
				_console_error('\n');

				('' || err.stack).split('\n').forEach(function(line) {
					_console_error(line);
				});

				errors++;

			}

		}


		if (errors === 0) {
			console.info('SUCCESS');
		} else {
			_console_error('FAILURE');
			_process.exit(1);
		}


		console.log('Cleaning lychee.js Projects and Libraries');

		libraries.forEach(function(path) {

			let real = _path.resolve(_ROOT, path);
			if (_is_directory(real + '/build')) {
				_remove_directory(real + '/build');
			}

		});

		projects.forEach(function(path) {

			let real = _path.resolve(_ROOT, path);
			if (_is_directory(real + '/build')) {
				_remove_directory(real + '/build');
			}

		});

		cultivator.forEach(function(path) {

			let real = _path.resolve(_ROOT, path);
			if (_is_directory(real + '/build')) {
				_remove_directory(real + '/build');
			}

		});

		console.info('SUCCESS');

	})(_get_projects('./libraries'), _get_projects('./projects'), _get_projects('./projects/cultivator'));



	/*
	 * 1: LIBRARY DISTRIBUTION (SYNC)
	 */

	(function() {

		console.log('Distributing lychee.js Library');


		let dist = _package_definitions(_PACKAGE).filter(function(value) {
			return value !== 'lychee.DIST';
		});

		let code = (function () {/*
			lychee.define('lychee.DIST').requires([{{requires}}]).exports(function(lychee, global, attachments) {

				let Composite = function() {};

				Composite.prototype = {

					// deserialize: function(blob) {},

					serialize: function() {

						return {
							'constructor': 'lychee.DIST',
							'arguments': []
						};

					}

				};

				return Composite;

			});

		*/}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1].split('\n').map(function(val) {
			return val.substr(3);
		}).join('\n').replace('{{requires}}', '\n\t' + dist.map(function(val) {
			return '\'' + val + '\'';
		}).join(',\n\t') + '\n');


		let result = true;
		let path   = _path.resolve(_ROOT, './libraries/lychee/source/DIST.js');
		let dir    = _path.dirname(path);

		if (_is_directory(dir) === false) {
			_create_directory(dir);
		}


		if (_is_directory(dir) === true) {

			try {
				_fs.writeFileSync(path, code, 'utf8');
			} catch (err) {
				result = false;
			}

		} else {
			result = false;
		}


		if (result === true) {
			console.info('SUCCESS');
		} else {
			console.error('FAILURE');
			_process.exit(1);
		}

	})();



	/*
	 * 2: CORE GENERATION (SYNC)
	 */

	(function() {

		let errors = 0;
		let files  = _package_files(_PACKAGE).filter(function(value) {
			return value.substr(0, 4) === 'core';
		});

		if (files.indexOf('core/lychee.js') !== 0) {

			files.reverse();
			files.push(files.splice(files.indexOf('core/lychee.js'), 1));
			files.reverse();

		}


		console.log('Generating lychee.js Core');


		files.forEach(function(file) {

			let path = _path.resolve(_ROOT, './libraries/lychee/source/' + file);
			if (_is_file(path) === true) {
				_CORE += _fs.readFileSync(path, 'utf8');
			} else {
				errors++;
			}

		});


		if (errors === 0) {
			console.info('SUCCESS');
		} else {
			console.error('FAILURE');
			_process.exit(1);
		}

	})();



	/*
	 * 2: PLATFORM GENERATION (ASYNC)
	 */

	(function() {

		let errors    = 0;
		let assets    = _package_assets(_PACKAGE).filter(function(value) {
			return value.substr(0, 8) === 'platform' && value.substr(-3) !== '.js';
		});
		let bootstrap = {};
		let files     = _package_files(_PACKAGE).filter(function(value) {
			return value.substr(0, 8) === 'platform' && value.indexOf('bootstrap.js') !== -1;
		}).concat(_package_files(_PACKAGE).filter(function(value) {
			return value.substr(0, 8) === 'platform' && value.indexOf('bootstrap.js') === -1;
		}).sort(function(a, b) {
			if (a > b) return  1;
			if (a < b) return -1;
			return 0;
		}));
		let platforms = Object.keys(_PACKAGE.source.tags.platform).filter(function(platform) {
			return _PLATFORM !== null ? platform === _PLATFORM : true;
		});


		console.log('Generating lychee.js Fertilizer Adapters');


		assets.forEach(function(path) {

			let asset = new lychee.Asset('/libraries/lychee/source/' + path);
			if (asset !== null) {

				asset.onload = function(result) {

					if (result === true) {

						let id  = path.split('.')[0];
						let ext = path.split('/').pop().split('.').slice(1).join('.');

						if (_ASSETS[id] === undefined) {
							_ASSETS[id] = {};
						}

						_ASSETS[id][ext] = lychee.serialize(this);

					}

				};

				asset.load();

			}

		});


		setTimeout(function() {

			platforms.forEach(function(platform) {

				bootstrap[platform] = {};


				let prefix = 'platform/' + platform + '/';
				let base   = platform.indexOf('-') ? platform.split('-')[0] : null;

				if (base !== null) {

					for (let file in bootstrap[base]) {
						bootstrap[platform][file] = bootstrap[base][file];
					}

				}


				files.filter(function(value) {
					return value.substr(0, prefix.length) === prefix;
				}).map(function(value) {
					return value.substr(prefix.length);
				}).forEach(function(adapter) {

					let id   = (prefix + adapter).split('.').slice(0, -1).join('.');
					let path = _path.resolve(_ROOT, './libraries/lychee/source/' + prefix + adapter);

					if (_is_file(path) === true) {

						let code = _fs.readFileSync(path, 'utf8');

						if (adapter === 'bootstrap.js' && typeof bootstrap[platform]['bootstrap.js'] === 'string') {

							bootstrap[platform][adapter] += code;

						} else if (_ASSETS[id] !== undefined) {

							let i1   = code.indexOf('.exports(');
							let tmp1 = '';
							let tmp2 = [];

							if (i1 !== -1) {

								for (let ext in _ASSETS[id]) {
									tmp2.push('\n\t"' + ext + '": lychee.deserialize(' + JSON.stringify(_ASSETS[id][ext]) + ')');
								}

								tmp1 += code.substr(0,  i1);
								tmp1 += '.attaches({' + (tmp2.length > 0 ? tmp2.join(',') : '') + '\n})';
								tmp1 += code.substr(i1, code.length - i1);


								code = tmp1;
								tmp1 = '';
								tmp2 = [];

							}

							bootstrap[platform][adapter] = code;

						} else {

							bootstrap[platform][adapter] = code;

						}

					}

				});

			});


			platforms.forEach(function(platform) {

				if (Object.keys(bootstrap[platform]).length === 0) {
					delete bootstrap[platform];
				} else {
					_BOOTSTRAP[platform] = Object.values(bootstrap[platform]).join('');
				}

			});


			Object.keys(_BOOTSTRAP).forEach(function(platform) {

				let result = true;
				let code   = _CORE + _BOOTSTRAP[platform];
				let path   = _path.resolve(_ROOT, './libraries/lychee/build/' + platform + '/core.js');
				let dir    = _path.dirname(path);

				if (_is_directory(dir) === false) {
					_create_directory(dir);
				}


				if (_is_directory(dir) === true) {

					try {
						_fs.writeFileSync(path, code, 'utf8');
					} catch (err) {
						result = false;
					}

				} else {
					result = false;
				}


				if (result === false) {
					console.log('\t' + platform + ': FAILURE (Could not write to "' + path + '")');
					errors++;
				} else {
					console.log('\t' + platform + ': SUCCESS');
				}

			});


			if (errors === 0) {
				console.info('SUCCESS');
			} else {
				console.error('FAILURE');
				_process.exit(1);
			}

		}, 1000);

	})();

})(typeof global !== 'undefined' ? global : this);

