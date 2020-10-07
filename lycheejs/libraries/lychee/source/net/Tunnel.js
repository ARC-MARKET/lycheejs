
lychee.define('lychee.net.Tunnel').requires([
	'lychee.net.socket.HTTP',
	// 'lychee.net.socket.TCP',
	'lychee.net.socket.WS',
	'lychee.codec.BENCODE',
	'lychee.codec.BITON',
	'lychee.codec.JSON',
	'lychee.net.Service'
]).includes([
	'lychee.event.Emitter'
]).exports((lychee, global, attachments) => {

	const _socket  = lychee.import('lychee.net.socket');
	const _Emitter = lychee.import('lychee.event.Emitter');
	const _Service = lychee.import('lychee.net.Service');
	const _BENCODE = lychee.import('lychee.codec.BENCODE');
	const _BITON   = lychee.import('lychee.codec.BITON');
	const _JSON    = lychee.import('lychee.codec.JSON');



	/*
	 * HELPERS
	 */

	const _plug_service = function(id, service) {

		id = typeof id === 'string' ? id : null;

		if (id === null || service === null) {
			return;
		}


		let found = false;

		for (let w = 0, wl = this.__services.waiting.length; w < wl; w++) {

			if (this.__services.waiting[w] === service) {
				this.__services.waiting.splice(w, 1);
				found = true;
				wl--;
				w--;
			}

		}


		if (found === true) {

			this.__services.active.push(service);

			service.trigger('plug');

			if (lychee.debug === true) {
				console.log('lychee.net.Tunnel: Remote plugged in Service (' + id + ')');
			}

		}

	};

	const _unplug_service = function(id, service) {

		id = typeof id === 'string' ? id : null;

		if (id === null || service === null) {
			return;
		}


		let found = false;

		for (let w = 0, wl = this.__services.waiting.length; w < wl; w++) {

			if (this.__services.waiting[w] === service) {
				this.__services.waiting.splice(w, 1);
				found = true;
				wl--;
				w--;
			}

		}

		for (let a = 0, al = this.__services.active.length; a < al; a++) {

			if (this.__services.active[a] === service) {
				this.__services.active.splice(a, 1);
				found = true;
				al--;
				a--;
			}

		}


		if (found === true) {

			service.trigger('unplug');

			if (lychee.debug === true) {
				console.log('lychee.net.Tunnel: Remote unplugged Service (' + id + ')');
			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.id        = 'localhost:1337';
		this.codec     = lychee.interfaceof(_JSON, states.codec) ? states.codec : _JSON;
		this.host      = 'localhost';
		this.port      = 1337;
		this.protocol  = Composite.PROTOCOL.WS;
		this.reconnect = 0;
		this.type      = null;


		this.__isConnected = false;
		this.__socket      = null;
		this.__services    = {
			waiting: [],
			active:  []
		};


		this.setHost(states.host);
		this.setPort(states.port);
		this.setProtocol(states.protocol);
		this.setReconnect(states.reconnect);
		this.setType(states.type);


		_Emitter.call(this);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function() {

			this.__isConnected = true;

		}, this);

		this.bind('send', function(payload, headers) {

			if (this.__socket !== null) {
				this.__socket.send(payload, headers);
			}

		}, this);

		this.bind('disconnect', function() {

			this.__isConnected = false;


			for (let a = 0, al = this.__services.active.length; a < al; a++) {
				this.__services.active[a].trigger('unplug');
			}

			this.__services.active  = [];
			this.__services.waiting = [];


			if (this.reconnect > 0) {
				setTimeout(_ => this.trigger('connect'), this.reconnect);
			}

		}, this);

	};


	Composite.PROTOCOL = {
		WS:   0,
		HTTP: 1,
		TCP:  2
	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			let socket = lychee.deserialize(blob.socket);
			if (socket !== null) {
				this.__socket = socket;
			}


			if (blob.services instanceof Array) {

				for (let s = 0, sl = blob.services.length; s < sl; s++) {
					this.addService(lychee.deserialize(blob.services[s]));
				}

			}

		},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.Tunnel';

			let states = {};
			let blob   = (data['blob'] || {});


			if (this.codec !== _JSON)                    states.codec     = lychee.serialize(this.codec);
			if (this.host !== 'localhost')               states.host      = this.host;
			if (this.port !== 1337)                      states.port      = this.port;
			if (this.protocol !== Composite.PROTOCOL.WS) states.protocol  = this.protocol;
			if (this.reconnect !== 0)                    states.reconnect = this.reconnect;
			if (this.type !== null)                      states.type      = this.type;


			if (this.__socket !== null) blob.socket = lychee.serialize(this.__socket);


			if (this.__services.active.length > 0) {

				blob.services = [];

				for (let a = 0, al = this.__services.active.length; a < al; a++) {

					let service = this.__services.active[a];

					blob.services.push(lychee.serialize(service));

				}

			}


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		connect: function(connection) {

			connection = typeof connection === 'object' ? connection : null;


			if (this.__isConnected === false) {

				let protocol = this.protocol;
				if (protocol === Composite.PROTOCOL.WS) {
					this.__socket = new _socket.WS();
				} else if (protocol === Composite.PROTOCOL.HTTP) {
					this.__socket = new _socket.HTTP();
				} else if (protocol === Composite.PROTOCOL.TCP) {
					this.__socket = new _socket.TCP();
				}


				this.__socket.bind('connect', function() {
					this.trigger('connect');
				}, this);

				this.__socket.bind('receive', function(payload, headers) {
					this.receive(payload, headers);
				}, this);

				this.__socket.bind('disconnect', function() {
					this.disconnect();
				}, this);

				this.__socket.bind('error', function() {
					this.setReconnect(0);
					this.disconnect();
				}, this);


				this.__socket.connect(this.host, this.port, connection);


				return true;

			}


			return false;

		},

		disconnect: function() {

			if (this.__isConnected === true) {

				let socket = this.__socket;
				if (socket !== null) {

					socket.unbind('connect');
					socket.unbind('receive');
					socket.unbind('disconnect');
					socket.unbind('error');
					socket.disconnect();
					this.__socket = null;

				}


				this.trigger('disconnect');


				return true;

			}


			return false;

		},

		send: function(data, headers) {

			data    = data instanceof Object    ? data    : null;
			headers = headers instanceof Object ? headers : {};


			if (data === null) {
				return false;
			}


			if (typeof headers.id     === 'string') headers['@service-id']     = headers.id;
			if (typeof headers.event  === 'string') headers['@service-event']  = headers.event;
			if (typeof headers.method === 'string') headers['@service-method'] = headers.method;


			delete headers.id;
			delete headers.event;
			delete headers.method;


			let payload = null;
			if (data !== null) {
				payload = this.codec.encode(data);
			}


			if (payload !== null) {

				this.trigger('send', [ payload, headers ]);

				return true;

			}


			return false;

		},

		receive: function(payload, headers) {

			payload = payload instanceof Buffer ? payload : null;
			headers = headers instanceof Object ? headers : {};


			let id     = headers['@service-id']     || null;
			let event  = headers['@service-event']  || null;
			let method = headers['@service-method'] || null;

			let data = null;
			if (payload.length === 0) {
				payload = this.codec.encode({});
			}

			if (payload !== null) {
				data = this.codec.decode(payload);
			}


			let instance = this.getService(id);
			if (instance !== null && data !== null) {

				if (method === '@plug' || method === '@unplug') {

					if (method === '@plug') {
						_plug_service.call(this,   id, instance);
					} else if (method === '@unplug') {
						_unplug_service.call(this, id, instance);
					}

				} else if (method !== null) {

					if (typeof instance[method] === 'function') {
						instance[method](data);
					}

				} else if (event !== null) {

					if (typeof instance.trigger === 'function') {
						instance.trigger(event, [ data ]);
					}

				}

			} else {

				this.trigger('receive', [ data, headers ]);

			}


			return true;

		},

		setHost: function(host) {

			host = typeof host === 'string' ? host : null;


			if (host !== null) {

				this.id   = (/:/g.test(host) ? '[' + host + ']' : host) + ':' + this.port;
				this.host = host;

				return true;

			}


			return false;

		},

		setPort: function(port) {

			port = typeof port === 'number' ? (port | 0) : null;


			if (port !== null) {

				this.id   = (/:/g.test(this.host) ? '[' + this.host + ']' : this.host) + ':' + port;
				this.port = port;

				return true;

			}


			return false;

		},

		setProtocol: function(protocol) {

			protocol = lychee.enumof(Composite.PROTOCOL, protocol) ? protocol : null;


			if (protocol !== null) {

				if (this.protocol !== protocol) {

					this.protocol = protocol;


					if (this.__isConnected === true) {
						this.disconnect();
						this.connect();
					}

				}

				return true;

			}


			return false;

		},

		setReconnect: function(reconnect) {

			reconnect = typeof reconnect === 'number' ? (reconnect | 0) : null;


			if (reconnect !== null) {

				this.reconnect = reconnect;

				return true;

			}


			return false;

		},

		addService: function(service) {

			service = lychee.interfaceof(_Service, service) ? service : null;


			if (service !== null) {

				let found = false;

				for (let w = 0, wl = this.__services.waiting.length; w < wl; w++) {

					if (this.__services.waiting[w] === service) {
						found = true;
						break;
					}

				}

				for (let a = 0, al = this.__services.active.length; a < al; a++) {

					if (this.__services.active[a] === service) {
						found = true;
						break;
					}

				}


				if (found === false) {

					this.__services.waiting.push(service);

					this.send({}, {
						id:     service.id,
						method: '@plug'
					});

				}


				return true;

			}


			return false;

		},

		getService: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				for (let w = 0, wl = this.__services.waiting.length; w < wl; w++) {

					let wservice = this.__services.waiting[w];
					if (wservice.id === id) {
						return wservice;
					}

				}

				for (let a = 0, al = this.__services.active.length; a < al; a++) {

					let aservice = this.__services.active[a];
					if (aservice.id === id) {
						return aservice;
					}

				}

			}


			return null;

		},

		removeService: function(service) {

			service = lychee.interfaceof(_Service, service) ? service : null;


			if (service !== null) {

				let found = false;

				for (let w = 0, wl = this.__services.waiting.length; w < wl; w++) {

					if (this.__services.waiting[w] === service) {
						found = true;
						break;
					}

				}

				for (let a = 0, al = this.__services.active.length; a < al; a++) {

					if (this.__services.active[a] === service) {
						found = true;
						break;
					}

				}


				if (found === true) {

					this.send({}, {
						id:     service.id,
						method: '@unplug'
					});

				}


				return true;

			}


			return false;

		},

		removeServices: function() {

			this.__services.waiting.slice(0).forEach(service => _unplug_service.call(this, service.id, service));
			this.__services.active.slice(0).forEach(service => _unplug_service.call(this, service.id, service));

			return true;

		},

		setType: function(type) {

			type = typeof type === 'string' ? type : null;


			if (type !== null) {

				if (/^(client|remote)$/g.test(type) === true) {

					this.type = type;

					return true;

				}

			}


			return false;

		}

	};


	return Composite;

});

