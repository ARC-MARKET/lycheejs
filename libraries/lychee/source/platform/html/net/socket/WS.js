
lychee.define('lychee.net.socket.WS').tags({
	platform: 'html'
}).requires([
	'lychee.codec.JSON',
	'lychee.net.protocol.WS'
]).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (typeof global.WebSocket !== 'undefined') {
		return true;
	}


	return false;

}).exports(function(lychee, global, attachments) {

	var _JSON      = lychee.import('lychee.codec.JSON');
	var _Protocol  = lychee.import('lychee.net.protocol.WS');
	var _WebSocket = global.WebSocket;



	/*
	 * HELPERS
	 */

	var _connect_socket = function(socket, protocol) {

		var that = this;
		if (that.__connection !== socket) {

			socket.onmessage = function(event) {

				var blob = null;
				var view = null;

				if (typeof event.data === 'string') {

					blob = new Buffer(event.data, 'utf8');

				} else if (event.data instanceof ArrayBuffer) {

					blob = new Buffer(event.data.byteLength);
					view = new Uint8Array(event.data);

					for (var v = 0, vl = blob.length; v < vl; v++) {
						blob[v] = view[v];
					}

				}


				var temp = _JSON.decode(blob);
				if (temp === null) {
					return;
				}


				// XXX: HTML WebSocket doesn't support Buffer data
				// var chunks = protocol.receive(blob);
				var chunks = [ temp ];
				if (chunks.length > 0) {

					for (var c = 0, cl = chunks.length; c < cl; c++) {

						var chunk = chunks[c];
						if (chunk.payload[0] === 136) {

							that.send(chunk.payload, chunk.headers, true);
							that.disconnect();

							return;

						} else {

							that.trigger('receive', [ chunk.payload, chunk.headers ]);

						}

					}

				}

			};

			socket.onerror = function() {
				that.trigger('error');
				that.disconnect();
			};

			socket.ontimeout = function() {
				that.trigger('error');
				that.disconnect();
			};

			socket.onclose = function() {
				that.disconnect();
			};


			that.__connection = socket;
			that.__protocol   = protocol;


			socket.onopen = function() {
				that.trigger('connect');
			};

		}

	};

	var _disconnect_socket = function(socket, protocol) {

		var that = this;
		if (that.__connection === socket) {

			socket.onmessage = function() {};
			socket.onerror   = function() {};
			socket.ontimeout = function() {};
			socket.onclose   = function() {};

			socket.close();
			protocol.close();


			that.__connection = null;
			that.__protocol   = null;

			that.trigger('disconnect');

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function() {

		this.__connection = null;
		this.__protocol   = null;


		lychee.event.Emitter.call(this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.socket.WS';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		connect: function(host, port, connection) {

			host       = typeof host === 'string'       ? host       : null;
			port       = typeof port === 'number'       ? (port | 0) : null;
			connection = typeof connection === 'object' ? connection : null;


			var that     = this;
			var url      = host.match(/:/g) !== null ? ('ws://[' + host + ']:' + port) : ('ws://' + host + ':' + port);
			var protocol = null;


			if (host !== null && port !== null) {

				if (connection !== null) {

					protocol   = new _Protocol(_Protocol.TYPE.remote);
					connection = null;

					// TODO: Remote Socket API

					// _connect_socket.call(that, connection, protocol);
					// connection.resume();

				} else {

					protocol   = new _Protocol(_Protocol.TYPE.client);
					connection = new _WebSocket(url, [ 'lycheejs' ]);


					_connect_socket.call(that, connection, protocol);

				}

			}

		},

		send: function(payload, headers, binary) {

			payload = payload instanceof Buffer ? payload : null;
			headers = headers instanceof Object ? headers : {};
			binary  = binary === true;


			if (payload !== null) {

				var connection = this.__connection;
				var protocol   = this.__protocol;

				if (connection !== null && protocol !== null) {

					// XXX: HTML WebSocket does not support Buffer data
					// var chunk = protocol.send(payload, headers, binary);
					// var enc   = binary === true ? 'binary' : 'utf8';


					var chunk = _JSON.encode({
						headers: headers,
						payload: payload
					});

					if (chunk !== null) {

						if (binary === true) {

							var blob = new ArrayBuffer(chunk.length);
							var view = new Uint8Array(blob);

							for (var c = 0, cl = chunk.length; c < cl; c++) {
								view[c] = chunk[c];
							}

							connection.send(blob);

						} else {

							connection.send(chunk.toString('utf8'));

						}

					}

				}

			}

		},

		disconnect: function() {

			var connection = this.__connection;
			var protocol   = this.__protocol;

			if (connection !== null && protocol !== null) {

				_disconnect_socket.call(this, connection, protocol);


				return true;

			}


			return false;

		}

	};


	return Composite;

});

