
lychee.define('lychee.net.client.Debugger').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _resolve_reference = function(identifier) {

		var pointer = this;

		var ns = identifier.split('.');
		for (var n = 0, l = ns.length; n < l; n++) {

			var name = ns[n];

			if (pointer[name] !== undefined) {
				pointer = pointer[name];
			} else {
				pointer = null;
				break;
			}

		}

		return pointer;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(client) {

		lychee.net.Service.call(this, 'debugger', client, lychee.net.Service.TYPE.client);



		/*
		 * INITIALIZATION
		 */

		this.bind('define', function(data) {

			if (typeof data.construtor === 'string' || typeof data.reference === 'string') {

				var scope       = (lychee.environment !== null ? lychee.environment.global : global);
				var environment = (lychee.environment !== null ? lychee.environment        : null);
				var definition  = lychee.deserialize(data);
				var value       = false;

				if (environment !== null) {
					value = environment.define(definition);
				}


				if (this.tunnel !== null) {

					this.tunnel.send({
						tid:   data.receiver,
						value: definition !== null
					}, {
						id:    'debugger',
						event: 'define-value'
					});

				}

			}

		}, this);

		this.bind('execute', function(data) {

			if (typeof data.reference === 'string') {

				var scope    = (lychee.environment !== null ? lychee.environment.global : global);
				var value    = null;
				var instance = _resolve_reference.call(scope, data.reference);
				var bindargs = [].slice.call(data.arguments, 0).map(function(value) {

					if (typeof value === 'string' && value.charAt(0) === '#') {

						if (lychee.debug === true) {
							console.log('lychee.net.client.Debugger: Injecting "' + value + '" from global');
						}

						var resolved_injection = _resolve_reference.call(scope, value.substr(1));
						if (resolved_injection !== null) {
							value = null;
						}

					}

					return value;

				});


				if (typeof instance === 'object') {

					value = lychee.serialize(instance);

				} else if (typeof resolved === 'function') {

					value = instance(bindargs);

				}


				if (value === undefined) {
					value = null;
				}


				if (this.tunnel !== null) {

					this.tunnel.send({
						tid:   data.receiver,
						value: value
					}, {
						id:    'debugger',
						event: 'execute-value'
					});

				}

			}

		}, this);

		this.bind('expose', function(data) {

			if (typeof data.reference === 'string') {

				var scope       = (lychee.environment !== null ? lychee.environment.global : global);
				var environment = _resolve_reference.call(scope, data.reference);
				var value       = lychee.Debugger.expose(environment);

				if (this.tunnel !== null) {

					this.tunnel.send({
						tid:   data.receiver,
						value: value
					}, {
						id:    'debugger',
						event: 'expose-value'
					});

				}

			}

		}, this);

		this.bind('serialize', function(data) {

			if (typeof data.reference === 'string') {

				var scope    = (lychee.environment !== null ? lychee.environment.global : global);
				var instance = _resolve_reference.call(scope, data.reference);
				var value    = lychee.serialize(instance);

				if (this.tunnel !== null) {

					this.tunnel.send({
						tid:   data.receiver,
						value: value
					}, {
						id:    'debugger',
						event: 'serialize-value'
					});

				}

			}

		}, this);

	};


	Class.prototype = {

		/*
		 * DEBUGGER API
		 */

		report: function(message, blob) {

			message = typeof message === 'string' ? message : null;
			blob    = blob instanceof Object      ? blob    : null;


			if (message !== null) {

				var tunnel = this.tunnel;
				if (tunnel !== null) {

					tunnel.send({
						message: message,
						blob:    blob
					}, {
						id:    this.id,
						event: 'error'
					});

				}

			}

		},



		/*
		 * CUSTOM API
		 */

		define: function(tid, data) {

			tid  = typeof tid === 'string' ? tid  : null;
			data = data instanceof Object  ? data : null;


			if (data !== null && this.tunnel !== null) {

				this.tunnel.send({
					tid:         tid,
					constructor: data.constructor || null,
					reference:   data.reference   || null,
					arguments:   data.arguments   || null
				}, {
					id:    'debugger',
					event: 'define'
				});


				return true;

			}


			return false;

		},

		execute: function(tid, data) {

			tid  = typeof tid === 'string' ? tid  : null;
			data = data instanceof Object  ? data : null;


			if (data !== null && this.tunnel !== null) {

				this.tunnel.send({
					tid:       tid,
					reference: data.reference || null,
					arguments: data.arguments || null
				}, {
					id:    'debugger',
					event: 'execute'
				});


				return true;

			}


			return false;

		},

		expose: function(tid, data) {

			tid  = typeof tid === 'string' ? tid  : null;
			data = data instanceof Object  ? data : null;


			if (this.tunnel !== null) {

				this.tunnel.send({
					tid:       tid,
					reference: data.reference || null
				}, {
					id:    'debugger',
					event: 'expose'
				});

			}

		},

		serialize: function(tid, data) {

			tid  = typeof tid === 'string' ? tid  : null;
			data = data instanceof Object  ? data : null;


			if (this.tunnel !== null) {

				this.tunnel.send({
					tid:       tid,
					reference: data.reference || null
				}, {
					id:    'debugger',
					event: 'serialize'
				});

			}

		}

	};


	return Class;

});

