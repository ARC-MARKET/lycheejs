#!/usr/bin/env node



(function() {

	var _CORE      = '';
	var _ASSETS    = {};
	var _BOOTSTRAP = {};


	(function() {

		if (typeof String.prototype.trim !== 'function') {

			String.prototype.trim = function() {
				return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
			};

		}

		if (typeof Object.values !== 'function') {

			Object.values = function(object) {

				if (object !== Object(object)) {
					throw new TypeError('Object.values called on a non-object');
				}


				var values = [];

				for (var prop in object) {

					if (Object.prototype.hasOwnProperty.call(object, prop)) {
						values.push(object[prop]);
					}

				}

				return values;

			};

		}

	})();



	var _fs      = require('fs');
	var _package = null;
	var _path    = require('path');
	var _root    = _path.resolve(process.cwd(), '.');



	/*
	 * HELPERS
	 */

	var _is_directory = function(path) {

		try {
			var stat = _fs.lstatSync(path);
			return stat.isDirectory();
		} catch(e) {
			return false;
		}

	};

	var _is_file = function(path) {

		try {
			var stat = _fs.lstatSync(path);
			return stat.isFile();
		} catch(e) {
			return false;
		}

	};

	var _create_directory = function(path, mode) {

		if (mode === undefined) {
			mode = 0777 & (~process.umask());
		}


		var is_directory = false;

		try {

			is_directory = _fs.lstatSync(path).isDirectory();

		} catch(err) {

			if (err.code === 'ENOENT') {

				if (_create_directory(_path.dirname(path), mode) === true) {
					_fs.mkdirSync(path, mode);
				}

				try {
					is_directory = _fs.lstatSync(path).isDirectory();
				} catch(err) {
				}

			}

		} finally {

			return is_directory;

		}

	};

	var _remove_directory = function(path) {

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

	var _get_projects = function(path) {

		var projects      = [];
		var projects_root = _path.resolve(_root, path);

		if (_is_directory(projects_root) === true) {

			projects = _fs.readdirSync(projects_root).filter(function(file) {
				return _is_directory(projects_root + '/' + file) === true;
			}).map(function(file) {
				return path + '/' + file;
			});

		}

		return projects;

	};

	var _walk_directory = function(files, node, path, attachments) {

		if (node instanceof Array) {

			if (node.indexOf('js') !== -1) {
				files.push(path + '.js');
			}

			if (attachments === true) {

				if (node.indexOf('json') !== -1)  files.push(path + '.json');
				if (node.indexOf('fnt') !== -1)   files.push(path + '.fnt');
				if (node.indexOf('msc') !== -1)   files.push(path + '.msc');
				if (node.indexOf('pkg') !== -1)   files.push(path + '.pkg');
				if (node.indexOf('png') !== -1)   files.push(path + '.png');
				if (node.indexOf('snd') !== -1)   files.push(path + '.snd');
				if (node.indexOf('store') !== -1) files.push(path + '.store');

			}

		} else if (node instanceof Object) {

			Object.keys(node).forEach(function(child) {
				_walk_directory(files, node[child], path + '/' + child, attachments);
			});

		}

	};

	var _package_definitions = function(json) {

		var files = [];

		if (json !== null) {

			var root = json.source.files || null;
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

	var _package_assets = function(json) {

		var files = [];

		if (json !== null) {

			var root = json.source.files || null;
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

	var _package_files = function(json) {

		var files = [];

		if (json !== null) {

			var root = json.source.files || null;
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

		var errors = 0;

		console.log('> Checking Environment');


		if (libraries.indexOf('./libraries/lychee') !== -1) {
			console.log('\tprocess cwd: OKAY');
		} else {
			console.log('\tprocess cwd: FAIL (' + _root + ' is not the lychee.js directory)');
			errors++;
		}


		var data = null;

		if (_is_file(_path.resolve(_root, './libraries/lychee/lychee.pkg')) === true) {

			try {
				data = JSON.parse(_fs.readFileSync(_path.resolve(_root, './libraries/lychee/lychee.pkg')));
			} catch(e) {
				data = null;
			}

		}


		if (data !== null) {
			_package = data;
			console.log('\t./libraries/lychee/lychee.pkg: OKAY');
		} else {
			console.log('\t./libraries/lychee/lychee.pkg: FAIL (Invalid JSON)');
			errors++;
		}


		if (_is_file(_path.resolve(_root, './libraries/lychee/source/platform/node/bootstrap.js')) === true) {

			global = {};

			try {

				require(_path.resolve(_root, './libraries/lychee/source/core/lychee.js'));
				require(_path.resolve(_root, './libraries/lychee/source/core/Asset.js'));
				require(_path.resolve(_root, './libraries/lychee/source/core/Definition.js'));
				require(_path.resolve(_root, './libraries/lychee/source/core/Environment.js'));
				require(_path.resolve(_root, './libraries/lychee/source/core/Package.js'));
				require(_path.resolve(_root, './libraries/lychee/source/platform/node/bootstrap.js'));

				lychee.envinit(null);

			} catch(e) {

				console.log('\n\n\n');
				console.log('Syntax Error in lychee.js core:');
				console.log('- - - - - - - - - - - - - - - -');
				console.log(e);
				console.log('\n\n\n');

				errors++;

			}

		}


		if (errors === 0) {
			console.log('> OKAY\n');
		} else {
			console.log('> FAIL\n');
			process.exit(1);
		}


		console.log('> Cleaning lychee.js builds');

		libraries.forEach(function(path) {

			var real = _path.resolve(_root, path);
			if (_is_directory(real + '/build')) {
				_remove_directory(real + '/build');
				console.log('\t' + path + '/build: OKAY');
			} else {
				console.log('~\t' + path + '/build: SKIP');
			}

		});

		projects.forEach(function(path) {

			var real = _path.resolve(_root, path);
			if (_is_directory(real + '/build')) {
				_remove_directory(real + '/build');
				console.log('\t' + path + '/build: OKAY');
			} else {
				console.log('~\t' + path + '/build: SKIP');
			}

		});

		cultivator.forEach(function(path) {

			var real = _path.resolve(_root, path);
			if (_is_directory(real + '/build')) {
				_remove_directory(real + '/build');
				console.log('\t' + path + '/build: OKAY');
			} else {
				console.log('~\t' + path + '/build: SKIP');
			}

		});

		console.log('> OKAY\n');

	})(_get_projects('./libraries'), _get_projects('./projects'), _get_projects('./projects/cultivator'));



	/*
	 * 1: LIBRARY DISTRIBUTION (SYNC)
	 */

	(function() {

		console.log('> Distributing lychee.js library');


		var dist = _package_definitions(_package).filter(function(value) {
			return value !== 'lychee.DIST';
		});

		var code = (function () {/*
			lychee.define('lychee.DIST').requires([{{requires}}]).exports(function(lychee, global, attachments) {

				var Class = function() {};

				Class.prototype = {

				};

				return Class;

			});

		*/}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1].split('\n').map(function(val) {
			return val.substr(3);
		}).join('\n').replace('{{requires}}', '\n\t' + dist.map(function(val) {
			return '\'' + val + '\'';
		}).join(',\n\t') + '\n');


		var result = true;
		var path   = _path.resolve(_root, './libraries/lychee/source/DIST.js');
		var dir    = _path.dirname(path);

		if (_is_directory(dir) === false) {
			_create_directory(dir);
		}


		if (_is_directory(dir) === true) {

			try {
				_fs.writeFileSync(path, code, 'utf8');
			} catch(e) {
				result = false;
			}

		} else {
			result = false;
		}


		if (result === true) {
			console.log('> OKAY\n');
		} else {
			console.log('> FAIL\n');
			process.exit(1);
		}

	})();



	/*
	 * 2: CORE GENERATION (SYNC)
	 */

	(function() {

		var errors = 0;
		var files  = _package_files(_package).filter(function(value) {
			return value.substr(0, 4) === 'core';
		});

		if (files.indexOf('core/lychee.js') !== 0) {

			files.reverse();
			files.push(files.splice(files.indexOf('core/lychee.js'), 1));
			files.reverse();

		}


		console.log('> Generating lychee.js core');


		files.forEach(function(file) {

			var path = _path.resolve(_root, './libraries/lychee/source/' + file);
			if (_is_file(path) === true) {
				_CORE += _fs.readFileSync(path, 'utf8');
			} else {
				errors++;
			}

		});


		if (errors === 0) {
			console.log('> OKAY\n');
		} else {
			console.log('> FAIL\n');
			process.exit(1);
		}

	})();



	/*
	 * 2: PLATFORM GENERATION (ASYNC)
	 */

	(function() {

		var errors    = 0;
		var assets    = _package_assets(_package).filter(function(value) {
			return value.substr(0, 8) === 'platform' && value.substr(-3) !== '.js';
		});
		var bootstrap = {};
		var files     = _package_files(_package).filter(function(value) {
			return value.substr(0, 8) === 'platform' && value.indexOf('bootstrap.js') !== -1;
		}).concat(_package_files(_package).filter(function(value) {
			return value.substr(0, 8) === 'platform' && value.indexOf('bootstrap.js') === -1;
		}).sort(function(a, b) {
			if (a > b) return  1;
			if (a < b) return -1;
			return 0;
		}));
		var platforms = Object.keys(_package.source.tags.platform);


		console.log('> Generating lychee.js platform adapters');


		assets.forEach(function(path) {

			var asset = new lychee.Asset('/libraries/lychee/source/' + path);
			if (asset !== null) {

				asset.onload = function(result) {

					if (result === true) {

						var id  = path.split('.').slice(0, -1).join('.');
						var ext = path.split('/').pop().split('.').slice(1).join('.');

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


				var prefix = 'platform/' + platform + '/';
				var base   = platform.indexOf('-') ? platform.split('-')[0] : null;

				if (base !== null) {

					for (var file in bootstrap[base]) {
						bootstrap[platform][file] = bootstrap[base][file];
					}

				}


				files.filter(function(value) {
					return value.substr(0, prefix.length) === prefix;
				}).map(function(value) {
					return value.substr(prefix.length);
				}).forEach(function(adapter) {

					var id   = (prefix + adapter).split('.').slice(0, -1).join('.');
					var path = _path.resolve(_root, './libraries/lychee/source/' + prefix + adapter);

					if (_is_file(path) === true) {

						var code = _fs.readFileSync(path, 'utf8');

						if (adapter === 'bootstrap.js' && typeof bootstrap[platform]['bootstrap.js'] === 'string') {

							bootstrap[platform][adapter] += code;

						} else if (_ASSETS[id] !== undefined) {

							var i1   = code.indexOf('.exports(');
							var tmp1 = '';
							var tmp2 = [];

							if (i1 !== -1) {

								for (var ext in _ASSETS[id]) {
									tmp2.push('\n\t"' + ext + '": lychee.deserialize(' + JSON.stringify(_ASSETS[id][ext]) + ')');
								}

								tmp1 += code.substr(0,  i1);
								tmp1 += '.attaches({' + (tmp2.length > 0 ? tmp2.join(',') : '') + '})';
								tmp1 += code.substr(i1, code.length - i1);


								code = tmp1;
								tmp1 = '';
								tmp2 = [];

							}

							bootstrap[platform][adapter] = tmp1;

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

				var result = true;
				var code   = _CORE + _BOOTSTRAP[platform];
				var path   = _path.resolve(_root, './libraries/lychee/build/' + platform + '/core.js');
				var dir    = _path.dirname(path);

				if (_is_directory(dir) === false) {
					_create_directory(dir);
				}


				if (_is_directory(dir) === true) {

					try {
						_fs.writeFileSync(path, code, 'utf8');
					} catch(e) {
						result = false;
					}

				} else {
					result = false;
				}


				if (result === false) {
					console.log('\t' + platform + ': FAIL (Could not write to "' + path + '")');
					errors++;
				} else {
					console.log('\t' + platform + ': OKAY');
				}

			});


			if (errors === 0) {
				console.log('> OKAY\n');
			} else {
				console.log('> FAIL\n');
				process.exit(1);
			}

		}, 1000);

	})();

})();

