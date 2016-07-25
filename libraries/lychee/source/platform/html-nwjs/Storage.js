
lychee.define('Storage').tags({
	platform: 'node'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof global.require === 'function') {

		var fs = global.require('fs');
		if (typeof fs.readFileSync === 'function' && typeof fs.writeFileSync === 'function') {
			return true;
		}

	}


	return false;

}).exports(function(lychee, global, attachments) {

	var _JSON       = {
		encode: JSON.stringify,
		decode: JSON.parse
	};
	var _PERSISTENT = {};
	var _TEMPORARY  = {};



	/*
	 * FEATURE DETECTION
	 */

	var _read_persistent  = function() { return false; };
	var _write_persistent = function() { return false; };

	(function() {

		var _fs = require('fs');


		var read = 'readFileSync' in _fs;
		if (read === true) {

			_read_persistent = function() {

				var url = lychee.environment.resolve('./lychee.store');


				var raw = null;
				try {
					raw = _fs.readFileSync(url, 'utf8');
				} catch(err) {
					raw = null;
				}


				var buffer = null;
				try {
					buffer = JSON.parse(raw);
				} catch(err) {
					buffer = null;
				}


				if (buffer !== null) {

					for (var id in buffer) {
						_PERSISTENT[id] = buffer[id];
					}


					return true;

				}


				return false;

			};

		}


		var write = 'writeFileSync' in _fs;
		if (write === true) {

			_write_persistent = function() {

				var buffer = _JSON.encode(_PERSISTENT);
				var url    = lychee.environment.resolve('./lychee.store');


				var result = false;
				try {
					result = _fs.writeFileSync(url, buffer, 'utf8');
				} catch(err) {
					result = false;
				}


				return result;

			};

		}


		if (lychee.debug === true) {

			var methods = [];

			if (read && write) methods.push('Persistent');
			if (_TEMPORARY)    methods.push('Temporary');

			if (methods.length === 0) {
				console.error('lychee.Storage: Supported methods are NONE');
			} else {
				console.info('lychee.Storage: Supported methods are ' + methods.join(', '));
			}

		}


		_read_persistent();

	})();



	/*
	 * HELPERS
	 */

	var _read_storage = function(silent) {

		silent = silent === true;


		var id   = this.id;
		var blob = null;


		var type = this.type;
		if (type === Composite.TYPE.persistent) {
			blob = _PERSISTENT[id] || null;
		} else if (type === Composite.TYPE.temporary) {
			blob = _TEMPORARY[id]  || null;
		}


		if (blob !== null) {

			if (this.model === null) {

				if (blob['@model'] instanceof Object) {
					this.model = blob['@model'];
				}

			}


			if (Object.keys(this.__objects).length !== Object.keys(blob['@objects']).length) {

				if (blob['@objects'] instanceof Object) {

					this.__objects = {};

					for (var o in blob['@objects']) {
						this.__objects[o] = blob['@objects'][o];
					}


					if (silent === false) {
						this.trigger('sync', [ this.__objects ]);
					}


					return true;

				}

			}

		}


		return false;

	};

	var _write_storage = function(silent) {

		silent = silent === true;


		var operations = this.__operations;
		if (operations.length > 0) {

			while (operations.length > 0) {

				var operation = operations.shift();
				if (operation.type === 'update') {

					if (this.__objects[operation.id] !== operation.object) {
						this.__objects[operation.id] = operation.object;
					}

				} else if (operation.type === 'remove') {

					if (this.__objects[operation.id] !== undefined) {
						delete this.__objects[operation.id];
					}

				}

			}


			var id   = this.id;
			var blob = {
				'@model':   this.model,
				'@objects': this.__objects
			};


			var type = this.type;
			if (type === Composite.TYPE.persistent) {

				_PERSISTENT[id] = blob;
				_write_persistent();

			} else if (type === Composite.TYPE.temporary) {

				_TEMPORARY[id] = blob;

			}


			if (silent === false) {
				this.trigger('sync', [ this.__objects ]);
			}


			return true;

		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	var _id = 0;

	var Composite = function(data) {

		var settings = Object.assign({}, data);


		this.id    = 'lychee-Storage-' + _id++;
		this.model = {};
		this.type  = Composite.TYPE.persistent;


		this.__objects    = {};
		this.__operations = [];


		this.setId(settings.id);
		this.setModel(settings.model);
		this.setType(settings.type);


		lychee.event.Emitter.call(this);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		_read_storage.call(this);

	};


	Composite.TYPE = {
		persistent: 0,
		temporary:  1
	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		sync: function(silent) {

			silent = silent === true;


			var result = false;


			if (this.__operations.length > 0) {
				result = _write_storage.call(this, silent);
			} else {
				result = _read_storage.call(this, silent);
			}


			return result;

		},

		deserialize: function(blob) {

			if (blob.objects instanceof Object) {

				this.__objects = {};

				for (var o in blob.objects) {

					var object = blob.objects[o];

					if (lychee.interfaceof(this.model, object) === true) {
						this.__objects[o] = object;
					}

				}

			}

		},

		serialize: function() {

			var data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.Storage';

			var settings = {};
			var blob     = (data['blob'] || {});


			if (this.id.substr(0, 15) !== 'lychee-Storage-') settings.id    = this.id;
			if (Object.keys(this.model).length !== 0)        settings.model = this.model;
			if (this.type !== Composite.TYPE.persistent)         settings.type  = this.type;


			if (Object.keys(this.__objects).length > 0) {

				blob.objects = {};

				for (var o in this.__objects) {

					var object = this.__objects[o];
					if (object instanceof Object) {
						blob.objects[o] = _JSON.decode(_JSON.encode(object));
					}

				}

			}


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		create: function() {
			return lychee.assignunlink({}, this.model);
		},

		filter: function(callback, scope) {

			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			var filtered = [];


			if (callback !== null) {

				for (var o in this.__objects) {

					var object = this.__objects[o];

					if (callback.call(scope, object, o) === true) {
						filtered.push(object);
					}

				}


			}


			return filtered;

		},

		read: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				var object = this.__objects[id] || null;
				if (object !== null) {
					return object;
				}

			}


			return null;

		},

		remove: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				var object = this.__objects[id] || null;
				if (object !== null) {

					this.__operations.push({
						type:   'remove',
						id:     id,
						object: object
					});


					_write_storage.call(this);

					return true;

				}

			}


			return false;

		},

		write: function(id, object) {

			id     = typeof id === 'string'                    ? id     : null;
			object = lychee.diff(this.model, object) === false ? object : null;


			if (id !== null && object !== null) {

				this.__operations.push({
					type:   'update',
					id:     id,
					object: object
				});


				_write_storage.call(this);

				return true;

			}


			return false;

		},

		setId: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				this.id = id;

				return true;

			}


			return false;

		},

		setModel: function(model) {

			model = model instanceof Object ? model : null;


			if (model !== null) {

				this.model = _JSON.decode(_JSON.encode(model));

				return true;

			}


			return false;

		},

		setType: function(type) {

			type = lychee.enumof(Composite.TYPE, type) ? type : null;


			if (type !== null) {

				this.type = type;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

