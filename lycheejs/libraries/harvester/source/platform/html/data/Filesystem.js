
lychee.define('harvester.data.Filesystem').tags({
	platform: 'html'
}).supports((lychee, global) => {

	return true;

}).exports((lychee, global, attachments) => {

	const _ROOT = lychee.ROOT.lychee;



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

			let tmp1 = this.root;
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
				} else {
					return null;
				}

			} else if (path.charAt(0) !== '/') {
				path = '/' + path;
			}


			let asset    = null;
			let resolved = path;
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


			if (callback !== null) {
				callback([]);
			} else {
				return [];
			}

		},

		read: function(path, callback, scope) {

			path     = typeof path === 'string'     ? path     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (callback !== null) {
				callback(null);
			} else {
				return null;
			}

		},

		write: function(path, data, callback, scope) {

			path     = typeof path === 'string'     ? path     : null;
			data     = data !== undefined           ? data     : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (callback !== null) {
				callback.call(scope, false);
			} else {
				return false;
			}

		},

		info: function(path) {

			path = typeof path === 'string' ? path : null;


			return null;

		}

	};


	return Composite;

});

