
if (typeof global !== 'undefined') {
	global.lychee = {};
} else {
	this.lychee = {};
}


(function(lychee, global) {

	var _tree = {};
	var _tags = {};
	var _bases = {
		// default paths
		'lychee': './lychee'
	};


	lychee.define = function(name) {

		var namespace = null,
			classname = null;

		if (name.match(/\./)) {
			var tmp = name.split('.');
			classname = tmp[tmp.length - 1];
			tmp.pop();
			namespace = tmp.join('.');
		} else {
			classname = name;
			namespace = 'lychee';
		}


		return new lychee.DefinitionBlock(namespace, classname);

	};


	lychee.extend = function(obj) {

		for (var a = 1, al = arguments.length; a < al; a++) {

			var obj2 = arguments[a];
			if (obj2) {

				for (var prop in obj2) {
					obj[prop] = obj2[prop];
				}

			}

		}


		return obj;

	};


	lychee.rebase = function(settings) {

		settings = settings instanceof Object ? settings : null;


		if (settings !== null) {

			for (var namespace in settings) {
				if (settings.hasOwnProperty(namespace)) {

					_bases[namespace] = settings[namespace];

				}
			}

		}

		return lychee;

	};


	lychee.tag = function(settings) {

		settings = settings instanceof Object ? settings : null;


		if (settings !== null) {

			for (var tag in settings) {
				if (settings.hasOwnProperty(tag)) {

					var values = null;

					if (settings[tag] instanceof Array) {
						values = settings[tag];
					} else if (typeof settings[tag] === 'string') {
						values = [ settings[tag] ];
					}

					if (values !== null) {
						_tags[tag] = values;
					}

				}
			}

		}

		return lychee;

	};


	lychee.getEnvironment = function() {

		return {
			tree: _tree,
			tags: _tags,
			bases: _bases
		};

	};


	lychee.build = function(callback, scope) {
		throw "lychee.build: You need to include the lychee.Builder to build the dependency tree.";
	};



	lychee.DefinitionBlock = function(space, name) {

		// allows new lychee.DefinitionBlock('Renderer') without a namespace
		space = typeof name === 'string' ? space : null;
		name = typeof name === 'string' ? name : space;

		this._space = space;
		this._name = name;
		this._tags = {};
		this._requires = [];
		this._includes = [];
		this._exports = null;
		this._supports = null;

		return this;

	};


	lychee.DefinitionBlock.prototype = {

		__throw: function(message) {

			if (lychee.debug === true) {
				console.warn('lychee.DefinitionBlock: Use lychee.define(\'' + this._space + '.' + this._id + '\').' + message + ' instead.', this);
			}

		},

		tags: function(tags) {

			if (!tags instanceof Object) {
				this.__throw('tags({ tag: \'value\' })');
				return this;
			}

			for (var name in tags) {
				if (tags.hasOwnProperty(name)) {

					var value = tags[name];
					this._tags[name] = value;

				}
			}

			return this;

		},

		supports: function(supports) {

			if (!supports instanceof Function) {
				this.__throw('supports(function() {})');
				return this;
			}

			this._supports = supports;

			return this;
		},

		requires: function(requires) {

			if (!requires instanceof Array) {
				this.__throw('requires([ \'array\', \'of\', \'requirements\' ])');
				return this;
			}

			for (var r = 0, l = requires.length; r < l; r++) {

				var id;

				if (requires[r].match(/\./)) {
					id = requires[r];
				} else if (this._space !== null) {
					id = this._space + '.' + requires[r];
				} else {
					id = requires[r];
				}

				this._requires.push(id);

			}

			return this;

		},

		includes: function(includes) {

			if (!includes instanceof Array) {
				this.__throw('includes([ \'array\', \'of\', \'includes\' ])');
				return this;
			}

			for (var i = 0, l = includes.length; i < l; i++) {

				var id;
				// TODO: This needs to be more generic
				// but dunno how atm

				if (includes[i].match(/\./)) {
					id = includes[i];
				} else if (this._space !== null) {
					id = this._space + '.' + includes[i];
				} else {
					id = includes[i];
				}

				this._includes.push(id);

			}

			return this;

		},

		exports: function(exports) {

			if (!exports instanceof Function) {
				this.__throw('exports(function(lychee, global) { })');
				return this;
			}

			this._exports = exports;


			if (
				(this._supports === null || this._supports.call(global, lychee, global) === true)
				&& _tree[this._space + '.' + this._name] == null
			) {
				_tree[this._space + '.' + this._name] = this;
			}

		}

	};

})(lychee, typeof global !== 'undefined' ? global : this);



/*
 *
 * POLYFILLS FOR CRAPPY ENVIRONMENTS
 *
 *
 * This is apparently only for
 * Internet Explorer and NodeJS
 *
 * Thanks for being 2 lazy 2 implement
 * the Console API, bitches! :)
 *
 */

if (typeof console === 'undefined') {
	console = {};
}


(function(global) {

	if (global.console.log === undefined) {
		global.console.log = function() {}; // stub!
	}

	if (global.console.error === undefined) {
		global.console.error = global.console.log;
	}

	if (global.console.warn === undefined) {
		global.console.warn = global.console.log;
	}

	if (global.console.group === undefined) {
		global.console.group = function(title) {
			console.log('~ ~ ~ ' + title + '~ ~ ~');
		};
	}

	if (global.console.groupEnd === undefined) {
		global.console.groupEnd = function() {
			console.log('~ ~ ~ ~ ~ ~');
		};
	}

})(typeof global !== 'undefined' ? global : this);

