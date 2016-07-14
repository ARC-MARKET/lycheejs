
lychee.Definition = typeof lychee.Definition !== 'undefined' ? lychee.Definition : (function(global) {

	var lychee = global.lychee;



	/*
	 * HELPERS
	 */

	var _fuzz_id = function(filename) {

		var packages = lychee.environment.packages.filter(function(pkg) {
			return pkg.type === 'source';
		}).map(function(pkg) {

			return {
				id:  pkg.id,
				url: pkg.url.split('/').slice(0, -1).join('/')
			};

		});


		var ns  = filename.split('/');
		var pkg = packages.find(function(pkg) {
			return filename.substr(0, pkg.url.length) === pkg.url;
		}) || null;


		if (pkg !== null) {

			var tmp_i = ns.indexOf('source');
			var tmp_s = ns[ns.length - 1];

			if (/\.js$/g.test(tmp_s)) {
				ns[ns.length - 1] = tmp_s.split('.').slice(0, -1).join('.');
			}

			var classId = '';
			if (tmp_i !== -1) {
				classId = ns.slice(tmp_i + 1).join('.');
			}


			this.id        = pkg.id + '.' + classId;
			this.classId   = classId;
			this.packageId = pkg.id;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(id) {

		id = typeof id === 'string' ? id : '';


		if (id.match(/\./)) {

			var tmp = id.split('.');

			this.id        = id;
			this.classId   = tmp.slice(1).join('.');
			this.packageId = tmp[0];

		} else if (/^([A-Za-z0-9]+)/g.test(id) === true) {

			this.id        = 'lychee.' + id;
			this.classId   = id;
			this.packageId = 'lychee';

		} else {

			this.id        = '';
			this.classId   = '';
			this.packageId = '';


			var filename = lychee.Environment.__FILENAME || null;
			if (filename !== null) {
				_fuzz_id.call(this, filename);
			}


			if (this.id !== '') {
				console.warn('lychee.Definition: Fuzzy Identifier "' + this.id + '" (defined by ' + filename + ')');
			} else {
				console.error('lychee.Definition: Invalid Identifier "' + id + '" (defined by ' + filename + ')');
			}

		}


		this._attaches = {};
		this._tags     = {};
		this._requires = [];
		this._includes = [];
		this._exports  = null;
		this._supports = null;


		return this;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.attaches instanceof Object) {

				var attachesmap = {};

				for (var aid in blob.attaches) {
					attachesmap[aid] = lychee.deserialize(blob.attaches[aid]);
				}

				this.attaches(attachesmap);

			}

			if (blob.tags instanceof Object) {
				this.tags(blob.tags);
			}

			if (blob.requires instanceof Array) {
				this.requires(blob.requires);
			}

			if (blob.includes instanceof Array) {
				this.includes(blob.includes);
			}


			var index1, index2, tmp, bindargs;

			if (typeof blob.supports === 'string') {

				// Function head
				tmp      = blob.supports.split('{')[0].trim().substr('function '.length);
				bindargs = tmp.substr(1, tmp.length - 2).split(',');

				// Function body
				index1 = blob.supports.indexOf('{') + 1;
				index2 = blob.supports.lastIndexOf('}') - 1;
				bindargs.push(blob.supports.substr(index1, index2 - index1));

				this.supports(Function.apply(Function, bindargs));

			}

			if (typeof blob.exports === 'string') {

				// Function head
				tmp      = blob.exports.split('{')[0].trim().substr('function '.length);
				bindargs = tmp.substr(1, tmp.length - 2).split(',');

				// Function body
				index1 = blob.exports.indexOf('{') + 1;
				index2 = blob.exports.lastIndexOf('}') - 1;
				bindargs.push(blob.exports.substr(index1, index2 - index1));

				this.exports(Function.apply(Function, bindargs));

			}

		},

		serialize: function() {

			var settings = {};
			var blob     = {};


			if (Object.keys(this._attaches).length > 0) {

				blob.attaches = {};

				for (var aid in this._attaches) {
					blob.attaches[aid] = lychee.serialize(this._attaches[aid]);
				}

			}

			if (Object.keys(this._tags).length > 0) {

				blob.tags = {};

				for (var tid in this._tags) {
					blob.tags[tid] = this._tags[tid];
				}

			}

			if (this._requires.length > 0)          blob.requires = this._requires.slice(0);
			if (this._includes.length > 0)          blob.includes = this._includes.slice(0);
			if (this._supports instanceof Function) blob.supports = this._supports.toString();
			if (this._exports instanceof Function)  blob.exports  = this._exports.toString();


			return {
				'constructor': 'lychee.Definition',
				'arguments':   [ this.id ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * CUSTOM API
		 */

		attaches: function(map) {

			map = map instanceof Object ? map : null;


			if (map !== null) {

				for (var id in map) {

					var value = map[id];
					if (value instanceof Font || value instanceof Music || value instanceof Sound || value instanceof Texture || value !== undefined) {
						this._attaches[id] = map[id];
					}

				}

			}


			return this;

		},

		exports: function(callback) {

			callback = callback instanceof Function ? callback : null;


			if (callback !== null) {
				this._exports = callback;
			}


			return this;

		},

		includes: function(definitions) {

			definitions = definitions instanceof Array ? definitions : null;


			if (definitions !== null) {

				for (var d = 0, dl = definitions.length; d < dl; d++) {

					var definition = definitions[d];
					if (typeof definition === 'string') {

						if (definition.indexOf('.') !== -1 && this._includes.indexOf(definition) === -1) {
							this._includes.push(definition);
						}

					}

				}

			}


			return this;

		},

		requires: function(definitions) {

			definitions = definitions instanceof Array ? definitions : null;


			if (definitions !== null) {

				for (var d = 0, dl = definitions.length; d < dl; d++) {

					var definition = definitions[d];
					if (typeof definition === 'string') {

						if (definition.indexOf('.') !== -1 && this._requires.indexOf(definition) === -1) {
							this._requires.push(definition);
						}

					}

				}

			}


			return this;

		},

		supports: function(callback) {

			callback = callback instanceof Function ? callback : null;


			if (callback !== null) {
				this._supports = callback;
			}


			return this;

		},

		tags: function(map) {

			map = map instanceof Object ? map : null;


			if (map !== null) {

				for (var id in map) {

					var value = map[id];
					if (typeof value === 'string') {
						this._tags[id] = value;
					}

				}

			}


			return this;

		}

	};


	return Class;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

