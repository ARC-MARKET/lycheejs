
lychee.define('lychee.net.Server').tags({
	platform: 'html'
}).requires([
	'lychee.Storage',
	'lychee.codec.JSON',
	'lychee.net.Remote'
]).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	// TODO: Feature Detection of Raw TCP Socket API

	return true;

}).exports(function(lychee, global, attachments) {

	var _JSON    = lychee.import('lychee.codec.JSON');
	var _Remote  = lychee.import('lychee.net.Remote');
	var _Storage = lychee.import('lychee.Storage');
	var _storage = new _Storage({
		id:    'server',
		type:  _Storage.TYPE.persistent,
		model: {
			id:   '::ffff:1337',
			host: '::ffff',
			port: 1337
		}
	});



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.codec  = _JSON;
		this.host   = null;
		this.port   = 1337;
		this.remote = _Remote;
		this.type   = Class.TYPE.WS;


		this.__isConnected = false;
		this.__server      = null;


		this.setCodec(settings.codec);
		this.setHost(settings.host);
		this.setPort(settings.port);
		this.setType(settings.type);


		lychee.event.Emitter.call(this);

		settings = null;


		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function(remote) {

			var id  = remote.host + ':' + remote.port;
			var obj = _storage.create();
			if (obj !== null) {

				obj.id   = id;
				obj.host = remote.host;
				obj.port = remote.port;

				_storage.write(id, obj);

			}

		}, this);

		this.bind('disconnect', function(remote) {

			var id  = remote.host + ':' + remote.port;
			var obj = _storage.read(id);
			if (obj !== null) {
				_storage.remove(id);
			}

		}, this);

	};


	Class.TYPE = {
		WS:   0,
		HTTP: 1,
		TCP:  2
	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.Server';

			var settings = {};


			if (this.codec !== _JSON)        settings.codec  = lychee.serialize(this.codec);
			if (this.host !== 'localhost')   settings.host   = this.host;
			if (this.port !== 1337)          settings.port   = this.port;
			if (this.remote !== _Remote)     settings.remote = lychee.serialize(this.remote);
			if (this.type !== Class.TYPE.WS) settings.type   = this.type;


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


				// TODO: Setup HTTP Server

				var that      = this;
				// var server = new _net.Server();


				// server.on('connection', function(socket) {

				// 	var host   = socket.remoteAddress || socket.server._connectionKey.split(':')[1];
				// 	var port   = socket.remotePort    || socket.server._connectionKey.split(':')[2];
				// 	var remote = new that.remote({
				// 		codec: that.codec,
				// 		host:  host,
				// 		port:  port,
				// 		type:  that.type
				// 	});


				// 	remote.bind('connect', function() {
				// 		that.trigger('connect', [ this ]);
				// 	});

				// 	remote.bind('disconnect', function() {
				// 		that.trigger('disconnect', [ this ]);
				// 	});


				// 	remote.connect(socket);

				// });

				// server.on('error', function() {
				// 	this.close();
				// });

				// server.on('close', function() {
				// 	that.__isConnected = false;
				// 	that.__server      = null;
				// });

				// server.listen(this.port, this.host);


				// this.__server      = server;
				// this.__isConnected = true;


				return true;

			}


			return false;

		},

		disconnect: function() {

			var server = this.__server;
			if (server !== null) {
				server.close();
			}


			return true;

		},



		/*
		 * TUNNEL API
		 */

		setCodec: function(codec) {

			codec = lychee.interfaceof(codec, _JSON) === true ? codec : null;


			if (codec !== null) {

				var oldcodec = this.codec;
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

			remote = lychee.interfaceof(remote, _Remote) === true ? remote : null;


			if (remote !== null) {

				var oldremote = this.remote;
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

			type = lychee.enumof(Class.TYPE, type) ? type : null;


			if (type !== null) {

				var oldtype = this.type;
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


	return Class;

});

