
lychee.define('lychee.net.service.Debugger').includes([
	'lychee.net.Service'
]).exports((lychee, global, attachments) => {

	const _Service = lychee.import('lychee.net.Service');
	const _TUNNELS = [];



	/*
	 * HELPERS
	 */

	const _resolve_reference = function(identifier) {

		let pointer = this;

		let ns = identifier.split('.');
		for (let n = 0, l = ns.length; n < l; n++) {

			let name = ns[n];

			if (pointer[name] !== undefined) {
				pointer = pointer[name];
			} else {
				pointer = null;
				break;
			}

		}

		return pointer;

	};

	const _bind_console = function(event) {

		this.bind(event, function(data) {

			let tunnel = this.tunnel;
			if (tunnel !== null && tunnel.type === 'remote') {

				let tid = data.tid || null;
				if (tid !== null) {

					let other = _TUNNELS.find(t => t.id === tid) || null;
					if (other !== null) {

						other.send(data, {
							id: this.id,
							event: 'console'
						});

					}

				}

			}

		}, this);

	};

	const _bind_relay = function(event) {

		this.bind(event, function(data) {

			let tunnel = this.tunnel;
			if (tunnel !== null && tunnel.type === 'remote') {

				let tid = data.tid || null;
				if (tid !== null) {

					let other = _TUNNELS.find(t => t.id === tid) || null;
					if (other !== null) {

						data.receiver = tunnel.id;

						other.send(data, {
							id: this.id,
							event: event
						});

					}

				}

			}

		}, this);

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		_Service.call(this, states);

		states = null;



		/*
		 * INITIALIZATION: CLIENT
		 */

		this.bind('define', function(data) {

			let tunnel = this.tunnel;
			if (tunnel !== null && tunnel.type === 'client') {

				if (typeof data.construtor === 'string' || typeof data.reference === 'string') {

					let environment = (lychee.environment !== null ? lychee.environment : null);
					let value       = false;
					let definition  = lychee.deserialize(data);

					if (environment !== null) {
						value = environment.define(definition);
					}


					if (tunnel !== null) {

						tunnel.send({
							tid:   data.receiver,
							value: value === true
						}, {
							id: this.id,
							event: 'define-value'
						});

					}

				}

			}

		}, this);

		this.bind('execute', function(data) {

			let tunnel = this.tunnel;
			if (tunnel !== null && tunnel.type === 'client') {

				if (typeof data.reference === 'string') {

					let scope    = (lychee.environment !== null ? lychee.environment.global : global);
					let value    = null;
					let instance = _resolve_reference.call(scope, data.reference);
					let bindargs = Array.from(data.arguments).map(value => {

						if (typeof value === 'string' && value.charAt(0) === '#') {

							if (lychee.debug === true) {
								console.log('lychee.net.service.Debugger: Injecting "' + value + '" from global');
							}

							let resolved_injection = _resolve_reference.call(scope, value.substr(1));
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

					tunnel.send({
						tid:   data.receiver,
						value: value
					}, {
						id: this.id,
						event: 'execute-value'
					});

				}

			}

		}, this);

		this.bind('expose', function(data) {

			let tunnel = this.tunnel;
			if (tunnel !== null && tunnel.type === 'client') {

				if (typeof data.reference === 'string') {

					let scope       = (lychee.environment !== null ? lychee.environment.global : global);
					let environment = _resolve_reference.call(scope, data.reference);
					let value       = lychee.Debugger.expose(environment);

					tunnel.send({
						tid:   data.receiver,
						value: value
					}, {
						id: this.id,
						event: 'expose-value'
					});

				}

			}

		}, this);

		this.bind('snapshot', function(data) {

			let tunnel = this.tunnel;
			if (tunnel !== null && tunnel.type === 'client') {

				if (typeof data.reference === 'string') {

					let scope    = (lychee.environment !== null ? lychee.environment.global : global);
					let instance = _resolve_reference.call(scope, data.reference);
					let value    = lychee.serialize(instance);

					tunnel.send({
						tid:   data.receiver,
						value: value
					}, {
						id:    'debugger',
						event: 'snapshot-value'
					});

				}

			}

		}, this);



		/*
		 * INITIALIZATION: REMOTE
		 */

		this.bind('plug', function() {

			let tunnel = this.tunnel;
			if (tunnel !== null && tunnel.type === 'remote') {
				_TUNNELS.push(tunnel);
			}

		}, this);

		this.bind('unplug', function() {

			let tunnel = this.tunnel;
			if (tunnel !== null && tunnel.type === 'remote') {

				let index = _TUNNELS.indexOf(tunnel);
				if (index !== -1) {
					_TUNNELS.splice(index, 1);
				}

			}

		}, this);

		// Relay events to proper tunnel (data.tid)
		_bind_relay.call(this, 'define');
		_bind_relay.call(this, 'execute');
		_bind_relay.call(this, 'expose');
		_bind_relay.call(this, 'snapshot');

		// Relay events to proper tunnel (data.receiver > data.tid)
		_bind_console.call(this, 'define-value');
		_bind_console.call(this, 'execute-value');
		_bind_console.call(this, 'expose-value');
		_bind_console.call(this, 'snapshot-value');

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.service.Debugger';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		define: function(tid, data) {

			tid  = typeof tid === 'string' ? tid  : null;
			data = data instanceof Object  ? data : null;


			if (data !== null) {

				return this.send({
					tid:         tid,
					constructor: data.constructor || null,
					reference:   data.reference   || null,
					arguments:   data.arguments   || null
				}, {
					event: 'define'
				});

			}


			return false;

		},

		execute: function(tid, data) {

			tid  = typeof tid === 'string' ? tid  : null;
			data = data instanceof Object  ? data : null;


			if (data !== null) {

				return this.send({
					tid:       tid,
					reference: data.reference || null,
					arguments: data.arguments || null
				}, {
					event: 'execute'
				});

			}


			return false;

		},

		expose: function(tid, data) {

			tid  = typeof tid === 'string' ? tid  : null;
			data = data instanceof Object  ? data : null;


			if (tid !== null && data !== null) {

				return this.send({
					tid:       tid,
					reference: data.reference || null
				}, {
					event: 'expose'
				});

			}


			return false;

		},

		report: function(message, blob) {

			message = typeof message === 'string' ? message : null;
			blob    = blob instanceof Object      ? blob    : null;


			if (message !== null) {

				return this.send({
					message: message,
					blob:    blob
				}, {
					event: 'error'
				});

			}


			return false;

		},

		snapshot: function(tid, data) {

			tid  = typeof tid === 'string' ? tid  : null;
			data = data instanceof Object  ? data : null;


			if (tid !== null && data !== null) {

				return this.send({
					tid:       tid,
					reference: data.reference || null
				}, {
					event: 'snapshot'
				});

			}


			return false;

		}

	};


	return Composite;

});

