
lychee.define('harvester.data.Filesystem').tags({
	platform: 'node'
}).supports(function(lychee, global) {

	try {

		require('fs');
		require('path');

		return true;

	} catch(err) {

	}


	return false;

}).exports(function(lychee, global, attachments) {

	var _ROOT = lychee.ROOT.lychee;
	var _fs   = require('fs');
	var _path = require('path');



	/*
	 * HELPERS
	 */

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



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(root) {

		root = typeof root === 'string' ? root : null;

		if (root !== null) {
			this.root = _path.normalize(_ROOT + _path.normalize(root));
		} else {
			this.root = _ROOT;
		}

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'harvester.data.Filesystem',
				'arguments':   [ this.root.substr(_ROOT.length) ]
			};

		},



		/*
		 * CUSTOM API
		 */

		asset: function(path, callback, scope) {

			path     = typeof path === 'string'     ? path     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (path === null) return false;


			var asset    = null;
			var resolved = _path.normalize(this.root.substr(process.cwd().length) + path);
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

				} catch(err) {
					return null;
				}

			}

		},

		dir: function(path, callback, scope) {

			path     = typeof path === 'string'     ? path     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (path === null) return false;


			var resolved = _path.normalize(this.root + path);
			if (callback !== null) {

				_fs.readdir(resolved, function(err, data) {

					if (err) {
						callback.call(scope, []);
					} else {
						callback.call(scope, data);
					}

				});

			} else {

				try {
					return _fs.readdirSync(resolved);
				} catch(err) {
					return [];
				}

			}

		},

		read: function(path, callback, scope) {

			path     = typeof path === 'string'     ? path     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (path === null) return false;


			var resolved = _path.normalize(this.root + path);
			if (callback !== null) {

				var data = null;
				try {
					data = _fs.readFileSync(resolved);
				} catch(err) {
					data = null;
				}

				callback.call(scope, data);

			} else {

				try {
					return _fs.readFileSync(resolved);
				} catch(err) {
					return null;
				}

			}

		},

		write: function(path, data, callback, scope) {

			path     = typeof path === 'string'     ? path     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (path === null) return false;


			var encoding = 'binary';

			if (typeof data === 'string') {
				encoding = 'utf8';
			} else {
				encoding = 'binary';
			}


			_create_directory(_path.dirname(path));


			var info     = this.info(_path.dirname(path));
			var resolved = _path.normalize(this.root + path);
			if (resolved !== null && info !== null && info.type === 'directory') {

				if (callback !== null) {

					var result = false;
					try {
						_fs.writeFileSync(resolved, data, encoding);
						result = true;
					} catch(err) {
						result = false;
					}

					callback.call(scope, result);

				} else {

					var result = false;
					try {
						_fs.writeFileSync(resolved, data, encoding);
						result = true;
					} catch(err) {
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


			if (path === null) return false;


			var resolved = _path.normalize(this.root + path);
			if (resolved !== null) {

				var stat = null;

				try {
					stat = _fs.lstatSync(resolved);
				} catch(err) {
					stat = null;
				}


				if (stat !== null) {

					return {
						type:   stat.isFile() ? 'file' : 'directory',
						length: stat.size,
						mtime:  new Date(stat.mtime.toUTCString())
					};

				}

			}


			return null;

		}

	};


	return Class;

});

