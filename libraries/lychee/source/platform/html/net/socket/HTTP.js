
lychee.define('lychee.net.socket.HTTP').tags({
	platform: 'html'
}).requires([
	'lychee.net.protocol.HTTP'
]).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	try {

		if (typeof global.XMLHttpRequest === 'function' || typeof global.XMLHttpRequest === 'object') {
			return true;
		}

	} catch(err) {
	}


	return false;

}).exports(function(lychee, global, attachments) {

	var _Protocol = lychee.import('lychee.net.protocol.HTTP');
	var _XHR      = global.XMLHttpRequest;



	/*
	 * HELPERS
	 */

	var _uppercase = function(str) {

		var tmp = str.split('-');

		for (var t = 0, tl = tmp.length; t < tl; t++) {
			var ch = tmp[t];
			tmp[t] = ch.charAt(0).toUpperCase() + ch.substr(1);
		}

		return tmp.join('-');

	};

	var _receive_xhr = function(raw_headers, raw_payload) {

		var blob = null;
		var view = null;


		if (typeof raw_payload === 'string') {

			blob = new Buffer(raw_payload, 'utf8');

		} else if (raw_payload instanceof ArrayBuffer) {

			blob = new Buffer(raw_payload.byteLength);
			view = new Uint8Array(raw_payload);

			for (var v = 0, vl = blob.length; v < vl; v++) {
				blob[v] = view[v];
			}

		}


		var headers = {};
		var payload = blob;

		raw_headers.split('\r\n').forEach(function(line) {

			var i1 = line.indexOf(':');
			if (i1 !== -1) {

				var key = line.substr(0, i1).trim().toLowerCase();
				var val = line.substr(i1 + 1).trim();

				if (key.substr(0, 2) === 'x-') {
					headers['@' + key.substr(2)] = val;
				} else if (key.length > 0) {
					headers[key.toLowerCase()] = val;
				}

			}

		});


		return [{
			headers: headers,
			payload: payload
		}];

	};

	var _reconnect_xhr = function(chunk, headers, binary) {

		var connection = this.__connection;
		if (connection !== null) {

			var tmp    = chunk.toString('utf8').split('\n')[0].trim().split(' ');
			var method = tmp[0];
			var url    = 'http://' + connection.host + ':' + connection.port + tmp[1];
			var socket = new _XHR();
			var that   = this;


			socket.open(method, url, true);
			socket.responseType = binary === true ? 'arraybuffer' : 'text';

			socket.onload = function() {

				var chunks = _receive_xhr.call(that, socket.getAllResponseHeaders(), socket.response);
				if (chunks.length > 0) {

					for (var c = 0, cl = chunks.length; c < cl; c++) {

						var chunk = chunks[c];
						if (chunk.payload !== null) {
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

			for (var key in headers) {

				if (key.charAt(0) === '@') {
					socket.setRequestHeader(_uppercase('x-' + key.substr(1)), headers[key]);
				} else {
					socket.setRequestHeader(_uppercase(key), headers[key]);
				}

			}


			return socket;

		}


		return null;

	};

	var _connect_socket = function(socket, protocol) {

		var that = this;
		if (that.__connection !== socket) {

			// TODO: connect socket events

			that.__connection = socket;
			that.__protocol   = protocol;

			that.trigger('connect');

		}

	};

	var _disconnect_socket = function(socket, protocol) {

		var that = this;
		if (that.__connection === socket) {

			// TODO: disconnect socket events

			// socket.destroy();
			protocol.close();


			that.__connection = null;
			that.__protocol   = null;


			setTimeout(function() {
				that.trigger('disconnect');
			}, 0);

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function() {

		this.__connection = null;
		this.__protocol   = null;


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.socket.HTTP';


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
			var url      = host.match(/:/g) !== null ? ('http://[' + host + ']:' + port) : ('http://' + host + ':' + port);
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
					connection = {
						host: host,
						port: port
					};


					_connect_socket.call(that, connection, protocol);

				}

			}

		},

		send: function(payload, headers, binary) {

			payload = payload instanceof Buffer ? payload : null;
			headers = headers instanceof Object ? headers : null;
			binary  = binary === true;


			if (payload !== null) {

				var connection = this.__connection;
				var protocol   = this.__protocol;

				if (connection !== null && protocol !== null) {

					// XXX: HTML XHR does not support Buffer data
					var chunk = protocol.send(payload, headers, binary);
					// var enc   = binary === true ? 'binary' : 'utf8';


					// XXX: Web XHR does not support halfopen Sockets
					connection = _reconnect_xhr.call(this, chunk, headers, binary);
					chunk      = payload;


					if (connection !== null && chunk !== null) {

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


	return Class;

});

