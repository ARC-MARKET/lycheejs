
lychee.define('lychee.net.Server').tags({
	platform: 'node'
}).requires([
	'lychee.Storage',
	'lychee.codec.JSON',
	'lychee.net.Remote'
]).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof global.require === 'function') {

		try {

			global.require('net');
			return true;

		} catch (err) {
		}

	}


	return false;

}).exports(function(lychee, global, attachments) {

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

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.codec  = _JSON;
		this.host   = null;
		this.port   = 1337;
		this.remote = _Remote;
		this.type   = Composite.TYPE.WS;


		this.__isConnected = false;
		this.__server      = null;


		this.setCodec(settings.codec);
		this.setHost(settings.host);
		this.setPort(settings.port);
		this.setRemote(settings.remote);
		this.setType(settings.type);


		_Emitter.call(this);

		settings = null;


		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function(remote) {

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

		this.bind('disconnect', function(remote) {

			let id  = (/:/g.test(remote.host) ? '[' + remote.host + ']' : remote.host) + ':' + remote.port;
			let obj = _storage.read(id);
			if (obj !== null) {
				_storage.remove(id);
			}

		}, this);

	};


	Composite.TYPE = {
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

			let settings = {};


			if (this.codec !== _JSON)            settings.codec  = lychee.serialize(this.codec);
			if (this.host !== 'localhost')       settings.host   = this.host;
			if (this.port !== 1337)              settings.port   = this.port;
			if (this.remote !== _Remote)         settings.remote = lychee.serialize(this.remote);
			if (this.type !== Composite.TYPE.WS) settings.type   = this.type;


			data['arguments'][0] = settings;


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


				let that   = this;
				let server = new _net.Server({
					allowHalfOpen:  true,
					pauseOnConnect: true
				});


				server.on('connection', function(socket) {

					let host   = socket.remoteAddress || socket.server._connectionKey.split(':')[1];
					let port   = socket.remotePort    || socket.server._connectionKey.split(':')[2];
					let remote = new that.remote({
						codec: that.codec,
						host:  host,
						port:  port,
						type:  that.type
					});

					that.trigger('preconnect', [ remote ]);

					remote.bind('connect', function() {
						that.trigger('connect', [ this ]);
					});

					remote.bind('disconnect', function() {
						that.trigger('disconnect', [ this ]);
					});


					remote.connect(socket);

				});

				server.on('error', function() {
					this.close();
				});

				server.on('close', function() {
					that.__isConnected = false;
					that.__server      = null;
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

		setRemote: function(remote) {

			remote = lychee.interfaceof(_Remote, remote) ? remote : null;


			if (remote !== null) {

				let oldremote = this.remote;
				if (oldremote !== remote) {

					this.remote = remote;


					if (this.__isConnected === true) {
						this.disconnect();
						this.connect();
					}

				}


				return true;

			}


			return false;

		},

		setType: function(type) {

			type = lychee.enumof(Composite.TYPE, type) ? type : null;


			if (type !== null) {

				let oldtype = this.type;
				if (oldtype !== type) {

					this.type = type;


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

