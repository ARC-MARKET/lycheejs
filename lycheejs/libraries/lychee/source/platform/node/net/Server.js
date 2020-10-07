
lychee.define('lychee.net.Server').tags({
	platform: 'node'
}).requires([
	'lychee.Storage',
	'lychee.codec.JSON',
	'lychee.net.Remote'
]).includes([
	'lychee.event.Emitter'
]).supports((lychee, global) => {

	if (typeof global.require === 'function') {

		try {

			global.require('net');
			return true;

		} catch (err) {
		}

	}


	return false;

}).exports((lychee, global, attachments) => {

	const _net     = global.require('net');
	const _Emitter = lychee.import('lychee.event.Emitter');
	const _JSON    = lychee.import('lychee.codec.JSON');
	const _Remote  = lychee.import('lychee.net.Remote');
	const _Storage = lychee.import('lychee.Storage');
	const _storage = new _Storage({
		id:    'server',
		type:  _Storage.TYPE.persistent,
		model: {
			id:   '[::ffff]:1337',
			type: 'client',
			host: '::ffff',
			port: 1337
		}
	});



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.codec    = _JSON;
		this.host     = null;
		this.port     = 1337;
		this.protocol = Composite.PROTOCOL.WS;
		this.remote   = _Remote;


		this.__isConnected = false;
		this.__server      = null;


		this.setCodec(states.codec);
		this.setHost(states.host);
		this.setPort(states.port);
		this.setProtocol(states.protocol);
		this.setRemote(states.remote);


		_Emitter.call(this);

		states = null;


		/*
		 * INITIALIZATION
		 */

		this.bind('connect', remote => {

			let id  = (/:/g.test(remote.host) ? '[' + remote.host + ']' : remote.host) + ':' + remote.port;
			let obj = _storage.create();
			if (obj !== null) {

				obj.id   = id;
				obj.type = 'client';
				obj.host = remote.host;
				obj.port = remote.port;

				_storage.write(id, obj);

			}

		}, this);

		this.bind('disconnect', remote => {

			let id  = (/:/g.test(remote.host) ? '[' + remote.host + ']' : remote.host) + ':' + remote.port;
			let obj = _storage.read(id);
			if (obj !== null) {
				_storage.remove(id);
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

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.Server';

			let states = (data['arguments'][0] || {});


			if (this.codec !== _JSON)                    states.codec    = lychee.serialize(this.codec);
			if (this.host !== 'localhost')               states.host     = this.host;
			if (this.port !== 1337)                      states.port     = this.port;
			if (this.protocol !== Composite.PROTOCOL.WS) states.protocol = this.protocol;
			if (this.remote !== _Remote)                 states.remote   = lychee.serialize(this.remote);


			data['arguments'][0] = states;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		connect: function() {

			if (this.__isConnected === false) {

				if (lychee.debug === true) {
					console.log('lychee.net.Server: Connected to ' + this.host + ':' + this.port);
				}


				let server = new _net.Server({
					allowHalfOpen:  true,
					pauseOnConnect: true
				});

				server.on('connection', socket => {

					let host   = socket.remoteAddress || socket.server._connectionKey.split(':')[1];
					let port   = socket.remotePort    || socket.server._connectionKey.split(':')[2];
					let remote = new this.remote({
						codec:    this.codec,
						host:     host,
						port:     port,
						protocol: this.protocol
					});

					this.trigger('preconnect', [ remote ]);

					remote.bind('connect',    _ => this.trigger('connect', [ remote ]));
					remote.bind('disconnect', _ => this.trigger('disconnect', [ remote ]));

					remote.connect(socket);

				});

				server.on('error', _ => server.close());

				server.on('close', _ => {
					this.__isConnected = false;
					this.__server      = null;
				});

				server.listen(this.port, this.host);


				this.__server      = server;
				this.__isConnected = true;


				return true;

			}


			return false;

		},

		disconnect: function() {

			let server = this.__server;
			if (server !== null) {
				server.close();
			}


			return true;

		},



		/*
		 * TUNNEL API
		 */

		setCodec: function(codec) {

			codec = lychee.interfaceof(_JSON, codec) ? codec : null;


			if (codec !== null) {

				let oldcodec = this.codec;
				if (oldcodec !== codec) {

					this.codec = codec;


					if (this.__isConnected === true) {
						this.disconnect();
						this.connect();
					}

				}


				return true;

			}


			return false;

		},

		setHost: function(host) {

			host = typeof host === 'string' ? host : null;


			if (host !== null) {

				this.host = host;

				return true;

			}


			return false;

		},

		setPort: function(port) {

			port = typeof port === 'number' ? (port | 0) : null;


			if (port !== null) {

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

		setRemote: function(remote) {

			remote = lychee.interfaceof(_Remote, remote) ? remote : null;


			if (remote !== null) {

				if (this.remote !== remote) {

					this.remote = remote;


					if (this.__isConnected === true) {
						this.disconnect();
						this.connect();
					}

				}


				return true;

			}


			return false;

		}

	};


	return Composite;

});

