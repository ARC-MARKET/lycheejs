
lychee.define('Storage').tags({
	platform: 'html'
}).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof Storage !== 'undefined') {

		try {

			if (typeof global.localStorage === 'object' && typeof global.sessionStorage === 'object') {
				return true;
			}

		} catch(err) {
			return true;
		}

	}


	return false;

}).exports(function(lychee, global, attachments) {

	var _JSON       = {
		encode: JSON.stringify,
		decode: JSON.parse
	};
	var _PERSISTENT = null;
	var _TEMPORARY  = null;



	/*
	 * FEATURE DETECTION
	 */

	(function() {

		var local   = false;
		var session = false;


		try {

			local = 'localStorage' in global;

			if (local === true) {
				_PERSISTENT = global.localStorage;
			}

			session = 'sessionStorage' in global;

			if (session === true) {
				_TEMPORARY = global.sessionStorage;
			}

		} catch(err) {

			local   = false;
			session = true;

			_PERSISTENT = null;
			_TEMPORARY  = {

				data: {},

				getItem: function(id) {
					return this.data[id] || null;
				},

				setItem: function(id, data) {
					this.data[id] = data;
				}

			};

		}


		if (lychee.debug === true) {

			var methods = [];

			if (local)   methods.push('Persistent');
			if (session) methods.push('Temporary');

			if (methods.length === 0) {
				console.error('lychee.Storage: Supported methods are NONE');
			} else {
				console.info('lychee.Storage: Supported methods are ' + methods.join(', '));
			}

		}

	})();



	/*
	 * HELPERS
	 */

	var _read_storage = function(silent) {

		silent = silent === true;


		var id   = this.id;
		var blob = null;


		var type = this.type;
		if (type === Class.TYPE.persistent) {

			if (_PERSISTENT !== null) {
				blob = JSON.parse(_PERSISTENT.getItem(id));
			}

		} else if (type === Class.TYPE.temporary) {

			if (_TEMPORARY !== null) {
				blob = JSON.parse(_TEMPORARY.getItem(id));
			}

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
		if (operations.length !== 0) {

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
			if (type === Class.TYPE.persistent) {

				if (_PERSISTENT !== null) {
					_PERSISTENT.setItem(id, _JSON.encode(blob));
				}

			} else if (type === Class.TYPE.temporary) {

				if (_TEMPORARY !== null) {
					_TEMPORARY.setItem(id, _JSON.encode(blob));
				}

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

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.id    = 'lychee-Storage-' + _id++;
		this.model = {};
		this.type  = Class.TYPE.persistent;

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


	Class.TYPE = {
		persistent: 0,
		temporary:  1
	};


	Class.prototype = {

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
			if (this.type !== Class.TYPE.persistent)         settings.type  = this.type;


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
			return lychee.extendunlink({}, this.model);
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

			type = lychee.enumof(Class.TYPE, type) ? type : null;


			if (type !== null) {

				this.type = type;

				return true;

			}


			return false;

		}

	};


	return Class;

});

