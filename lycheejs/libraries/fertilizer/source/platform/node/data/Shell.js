
lychee.define('fertilizer.data.Shell').requires([
	'lychee.Asset'
]).tags({
	platform: 'node'
}).supports((lychee, global) => {

	if (typeof global.require === 'function') {

		try {

			global.require('child_process');
			global.require('fs');
			global.require('path');

			return true;

		} catch (err) {
		}

	}


	return false;

}).exports((lychee, global, attachments) => {

	const _child_process = require('child_process');
	const _fs            = require('fs');
	const _path          = require('path');
	const _Asset         = lychee.import('lychee.Asset');
	const _ROOT          = lychee.ROOT.lychee;



	/*
	 * HELPERS
	 */

	const _create_directory = function(path, mode) {

		if (mode === undefined) {
			mode = 0o777 & (~process.umask());
		}


		let is_directory = false;

		try {

			let stat1 = _fs.lstatSync(path);
			if (stat1.isSymbolicLink()) {

				let tmp   = _fs.realpathSync(path);
				let stat2 = _fs.lstatSync(tmp);
				if (stat2.isDirectory()) {
					is_directory = true;
				}

			} else if (stat1.isDirectory()) {
				is_directory = true;
			}

		} catch (err) {

			if (err.code === 'ENOENT') {

				if (_create_directory(_path.dirname(path), mode) === true) {
					_fs.mkdirSync(path, mode);
				}

				try {

					let stat2 = _fs.lstatSync(path);
					if (stat2.isSymbolicLink()) {

						let tmp   = _fs.realpathSync(path);
						let stat3 = _fs.lstatSync(tmp);
						if (stat3.isDirectory()) {
							is_directory = true;
						}

					} else if (stat2.isDirectory()) {
						is_directory = true;
					}

				} catch (err) {
				}

			}

		}


		return is_directory;

	};

	const _walk_recursive = function(path, filtered) {

		let info = this.info(path);
		if (info !== null && info.type === 'directory') {

			let resolved = _path.normalize(this.__root + path);

			let files = [];

			try {
				files = _fs.readdirSync(resolved);
			} catch (err) {
			}

			files.filter(file => file.startsWith('.') === false).forEach(file => {

				let info = this.info(path + '/' + file);
				if (info !== null) {

					if (info.type === 'directory') {

						_walk_recursive.call(this, path + '/' + file, filtered);

					} else if (info.type === 'file') {

						let url = path + '/' + file;
						if (filtered.includes(url) === false) {
							filtered.push(url);
						}

					}

				}

			});

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.root = typeof states.root === 'string' ? states.root : null;

		this.__root  = _ROOT;
		this.__stack = [];



		/*
		 * INITIALIZATION
		 */

		if (this.root !== null) {

			let tmp1 = _path.normalize(this.root);
			let tmp2 = _ROOT;
			if (tmp1.startsWith('/')) {
				tmp2 = _ROOT + tmp1;
			} else if (tmp1.startsWith('./')) {
				tmp2 = _ROOT + tmp1.substr(1);
			}

			if (tmp2.endsWith('/')) {
				tmp2 = tmp2.substr(0, tmp2.length - 1);
			}

			this.__root = tmp2;

		}

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.stack instanceof Array) {

				for (let s = 0, sl = blob.stack.length; s < sl; s++) {
					this.__stack.push(blob.stack[s]);
				}

			}

		},

		serialize: function() {

			let states = {};
			let blob   = {};


			if (this.root !== null) states.root = this.root.substr(_ROOT.length);


			if (this.__stack.length > 0) {
				blob.stack = this.__stack.map(lychee.serialize);
			}


			return {
				'constructor': 'fertilizer.data.Shell',
				'arguments':   [ states ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * CUSTOM API
		 */

		copy: function(path, dest, callback, scope) {

			path     = typeof path === 'string'     ? path     : null;
			dest     = typeof dest === 'string'     ? dest     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (path !== null && dest !== null) {

				if (path.charAt(0) !== '/') {
					path = '/' + path;
				}

				if (dest.charAt(0) !== '/') {
					dest = '/' + dest;
				}


				let path_info = this.info(path);
				let dest_info = this.info(dest);

				if (path_info.type === 'file' && dest_info === null) {

					let result = true;
					try {

						let fd_read  = _fs.openSync(path, 'r');
						let fd_write = _fs.openSync(dest, 'w');
						let buffer   = Buffer.alloc(64 * 1025);
						let bytes    = 0;
						let offset   = 0;

						do {

							bytes = _fs.readSync(fd_read, buffer, 0, buffer.length, offset);
							_fs.writeSync(fd_write, buffer, 0, bytes);
							offset += bytes;

						} while (bytes !== 0);

						_fs.closeSync(fd_read);
						_fs.closeSync(fd_write);

					} catch (err) {
						result = false;
					}


					if (callback !== null) {
						callback.call(scope, result);
					} else {
						return result;
					}

				} else {

					if (callback !== null) {
						callback.call(scope, false);
					} else {
						return false;
					}

				}

			} else {

				if (callback !== null) {
					callback.call(scope, false);
				} else {
					return false;
				}

			}

		},

		info: function(path, callback, scope) {

			path     = typeof path === 'string'     ? path     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (path !== null) {

				if (path.charAt(0) !== '/') {
					path = '/' + path;
				}

				let resolved = _path.normalize(this.__root + path);
				if (resolved !== null) {

					let result = null;

					try {

						let stat1 = _fs.lstatSync(resolved);
						if (stat1.isSymbolicLink()) {

							let tmp   = _fs.realpathSync(resolved);
							let stat2 = _fs.lstatSync(tmp);

							result = {
								type:  stat2.isFile() ? 'file' : 'directory',
								mtime: new Date(stat2.mtime.toUTCString())
							};

						} else {

							result = {
								type:  stat1.isFile() ? 'file' : 'directory',
								mtime: new Date(stat1.mtime.toUTCString())
							};

						}

					} catch (err) {
					}


					if (callback !== null) {
						callback.call(scope, result);
					} else {
						return result;
					}

				} else {

					if (callback !== null) {
						callback.call(scope, null);
					} else {
						return null;
					}

				}

			} else {

				if (callback !== null) {
					callback.call(scope, null);
				} else {
					return null;
				}

			}

		},

		exec: function(command, callback, scope) {

			command  = typeof command === 'string'  ? command  : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (command !== null) {

				let args  = command.split(' ').slice(1);
				let cmd   = command.split(' ')[0];
				let file  = _ROOT + (cmd.charAt(0) !== '/' ? '/' : '') + cmd;
				let stack = this.__stack;

				let path = file.split('/').slice(0, -1).join('/');
				if (path.endsWith('/bin')) {
					path = path.split('/').slice(0, -1).join('/');
				}


				if (file.endsWith('.js')) {

					args.reverse();
					args.push(file);
					args.push('env:node');
					args.reverse();

					file = _ROOT + '/bin/helper/helper.sh';

				}


				if (callback !== null) {

					try {

						_child_process.execFile(file, args, {
							cwd: path
						}, (error, stdout, stderr) => {

							let code = 0;
							if (error !== null) {
								code = error.code;
							}

							stack.push({
								args:   args,
								exit:   code,
								file:   file,
								path:   path,
								stdout: stdout.toString(),
								stderr: stderr.toString()
							});


							if (error) {
								callback.call(scope, false);
							} else {
								callback.call(scope, true);
							}

						});

					} catch (err) {

						callback.call(scope, false);

					}

				} else {

					let result = true;
					let stdout = '';

					try {

						stdout = _child_process.execFileSync(file, args, {
							cwd:   path,
							stdio: [ 'ignore', 'pipe', 'ignore' ]
						});

						stack.push({
							args:   args,
							exit:   0,
							file:   file,
							path:   path,
							stdout: stdout.toString(),
							stderr: ''
						});

					} catch (err) {

						stack.push({
							args:   args,
							exit:   1,
							file:   file,
							path:   path,
							stdout: stdout.toString(),
							stderr: ''
						});

						result = false;

					}

					return result;

				}

			} else {

				if (callback !== null) {
					callback.call(scope, false);
				} else {
					return false;
				}

			}

		},

		trace: function(limit, callback, scope) {

			limit    = typeof limit === 'number'    ? (limit | 0) : null;
			callback = callback instanceof Function ? callback    : null;
			scope    = scope !== undefined          ? scope       : this;


			let stack = this.__stack;
			if (limit !== null) {
				stack = stack.reverse().slice(0, limit).reverse();
			} else {
				stack = stack.slice(0);
			}


			if (callback !== null) {
				callback.call(scope, stack);
			} else {
				return stack;
			}

		},

		tree: function(path, callback, scope) {


			path     = typeof path === 'string'     ? path     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (path !== null) {

				let urls = [];

				_walk_recursive.call(this, path, urls);

				let filtered = urls.map(url => '.' + url.substr(path.length));
				if (callback !== null) {
					callback.call(scope, filtered);
				} else {
					return filtered;
				}

			} else {

				if (callback !== null) {
					callback.call(scope, []);
				} else {
					return [];
				}

			}

		},

		zip: function(assets, callback, scope) {

			assets   = assets instanceof Array      ? assets   : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (assets !== null) {

				let sandbox = '/tmp/fertilizer-data-Shell-' + Date.now();
				let urls = assets.map(asset => {

					if (asset instanceof Object) {

						let url = asset.url || null;
						if (url !== null) {

							if (url.startsWith('./')) {
								return sandbox + '/' + url.substr(2);
							} else if (url.startsWith('/')) {
								return sandbox + url;
							} else {
								return url;
							}

						}

					}

					return null;

				});

				let buffers = assets.map(asset => {

					if (asset instanceof Object) {

						let buffer = asset.buffer || null;
						if (buffer instanceof Buffer) {
							return buffer;
						} else {

							let data = lychee.serialize(asset);
							if (data !== null && data.blob instanceof Object) {

								let blob = data.blob;
								if (typeof blob.buffer === 'string') {

									let tmp = blob.buffer.substr(blob.buffer.indexOf(',') + 1);

									return Buffer.from(tmp, 'base64');

								}

							}

						}

					}

					return null;

				});


				_create_directory(sandbox);


				urls.forEach((url, u) => {

					let buffer = buffers[u] || null;
					let result = false;

					if (url !== null && buffer !== null) {

						let folder = _path.dirname(url);
						let path   = url;

						_create_directory(folder);

						try {
							_fs.writeFileSync(path, buffer, 'binary');
							result = true;
						} catch (err) {
							result = false;
						}

					}


					if (result === false) {
						console.warn('fertilizer.data.Shell: Could not write "' + url + '".');
					}

				});


				let result = false;

				try {
					let cmd = 'cd "' + sandbox + '" && zip -r -q "' + sandbox + '.zip" ./*';
					_child_process.execSync(cmd);
					result = true;
				} catch (err) {
					result = false;
				}


				if (result === true) {

					let asset = new _Asset(sandbox + '.zip', null, true);
					if (asset !== null) {

						if (callback !== null) {

							asset.onload = function(result) {

								if (result === true) {
									callback.call(scope, asset);
								} else {
									callback.call(scope, null);
								}

							};

							asset.load();

						} else {
							return asset;
						}

					} else {

						if (callback !== null) {
							callback.call(scope, null);
						} else {
							return null;
						}

					}

				} else {

					if (callback !== null) {
						callback.call(scope, null);
					} else {
						return null;
					}

				}

			} else {

				if (callback !== null) {
					callback.call(scope, null);
				} else {
					return null;
				}

			}

		}

	};


	return Composite;

});

