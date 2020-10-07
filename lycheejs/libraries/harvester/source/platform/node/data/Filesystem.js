
lychee.define('harvester.data.Filesystem').tags({
	platform: 'node'
}).supports((lychee, global) => {

	try {

		require('fs');
		require('path');

		return true;

	} catch (err) {

	}


	return false;

}).exports((lychee, global, attachments) => {

	const _ROOT = lychee.ROOT.lychee;
	const _fs   = require('fs');
	const _path = require('path');



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



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.root = typeof states.root === 'string' ? states.root : null;

		this.__root = _ROOT;



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

		// deserialize: function(blob) {},

		serialize: function() {

			let states = {};


			if (this.root !== null) states.root = this.root.substr(_ROOT.length);


			return {
				'constructor': 'harvester.data.Filesystem',
				'arguments':   [ states ]
			};

		},



		/*
		 * CUSTOM API
		 */

		asset: function(path, callback, scope) {

			path     = typeof path === 'string'     ? path     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (path === null) {

				if (callback !== null) {
					callback(null);
				}

				return null;

			} else if (path.charAt(0) !== '/') {
				path = '/' + path;
			}


			let asset    = null;
			let resolved = _path.normalize(this.__root.substr(process.cwd().length) + path);
			if (callback !== null) {

				asset = new lychee.Asset(resolved, null, true);

				if (asset !== null) {

					asset.onload = function() {
						callback.call(scope, this);
					};

					asset.load();

				} else {

					callback.call(scope, null);

				}

			} else {

				try {

					asset = new lychee.Asset(resolved, null, true);

					if (asset !== null) {
						asset.load();
					}

					return asset;

				} catch (err) {
					return null;
				}

			}

		},

		dir: function(path, callback, scope) {

			path     = typeof path === 'string'     ? path     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (path === null) {

				if (callback !== null) {
					callback([]);
				}

				return [];

			} else if (path.charAt(0) !== '/') {
				path = '/' + path;
			}


			let resolved = _path.normalize(this.__root + path);
			if (callback !== null) {

				_fs.readdir(resolved, (err, data) => {

					if (err) {
						callback.call(scope, []);
					} else {
						callback.call(scope, data);
					}

				});

			} else {

				try {
					return _fs.readdirSync(resolved);
				} catch (err) {
					return [];
				}

			}

		},

		read: function(path, callback, scope) {

			path     = typeof path === 'string'     ? path     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (path === null) {

				if (callback !== null) {
					callback(null);
				}

				return null;

			} else if (path.charAt(0) !== '/') {
				path = '/' + path;
			}


			let resolved = _path.normalize(this.__root + path);
			if (callback !== null) {

				let data = null;
				try {
					data = _fs.readFileSync(resolved);
				} catch (err) {
					data = null;
				}

				callback.call(scope, data);

			} else {

				try {
					return _fs.readFileSync(resolved);
				} catch (err) {
					return null;
				}

			}

		},

		write: function(path, data, callback, scope) {

			path     = typeof path === 'string'     ? path     : null;
			data     = data !== undefined           ? data     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (path === null) {

				if (callback !== null) {
					callback(false);
				}

				return false;

			} else if (path.charAt(0) !== '/') {
				path = '/' + path;
			}


			let encoding = 'binary';

			if (typeof data === 'string') {
				encoding = 'utf8';
			} else {
				encoding = 'binary';
			}


			_create_directory(_path.dirname(this.__root + path));


			let info     = this.info(_path.dirname(path));
			let resolved = _path.normalize(this.__root + path);
			if (resolved !== null && info !== null && info.type === 'directory') {

				if (callback !== null) {

					let result = false;
					try {
						_fs.writeFileSync(resolved, data, encoding);
						result = true;
					} catch (err) {
						result = false;
					}

					callback.call(scope, result);

				} else {

					let result = false;
					try {
						_fs.writeFileSync(resolved, data, encoding);
						result = true;
					} catch (err) {
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

		info: function(path) {

			path = typeof path === 'string' ? path : null;


			if (path === null) {
				return null;
			} else if (path.charAt(0) !== '/') {
				path = '/' + path;
			}


			let resolved = _path.normalize(this.__root + path);
			if (resolved !== null) {

				try {

					let stat1 = _fs.lstatSync(resolved);
					if (stat1.isSymbolicLink()) {

						let tmp   = _fs.realpathSync(resolved);
						let stat2 = _fs.lstatSync(tmp);

						return {
							type:   stat2.isFile() ? 'file' : 'directory',
							length: stat2.size,
							mtime:  new Date(stat2.mtime.toUTCString())
						};

					} else {

						return {
							type:   stat1.isFile() ? 'file' : 'directory',
							length: stat1.size,
							mtime:  new Date(stat1.mtime.toUTCString())
						};

					}

				} catch (err) {
				}

			}


			return null;

		}

	};


	return Composite;

});

