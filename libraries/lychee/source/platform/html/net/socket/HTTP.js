
lychee.define('lychee.net.socket.HTTP').tags({
	platform: 'html'
}).requires([
	'lychee.net.protocol.HTTP'
]).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	try {

		if (typeof global.XMLHttpRequest === 'function') {
			return true;
		}

	} catch(e) {
	}


	return false;

}).exports(function(lychee, global, attachments) {

	var _Protocol = lychee.import('lychee.net.protocol.HTTP');
	var _XHR      = global.XMLHttpRequest;



	/*
	 * HELPERS
	 */

	var _send_xhr = function(chunk, enc) {

		var tmp1    = chunk.toString('utf8').split('\r\n\r\n')[0];
		var tmp2    = chunk.toString('utf8').split('\r\n\r\n')[1];
		var tmp3    = chunk.toString('utf8').split('\n')[0].split(' ');
		var headers = tmp1.split('\n').slice(1);
		var payload = null;
		var socket  = new _XHR();
		var that    = this;


		if (enc === 'binary') {

			payload = (function(data) {

				var blob = new ArrayBuffer(data.length);
				var view = new Uint8Array(blob);

				for (var d = 0, dl = data.length; d < dl; d++) {
					view[d] = data[d];
				}

				return blob;

			})(new Buffer(tmp2, 'utf8'));

			socket.open(tmp3[0], tmp3[1], true);
			socket.responseType = 'arraybuffer';

			headers.forEach(function(line) {

				var key = line.substr(0, line.indexOf(':')).trim();
				var val = line.substr(line.indexOf(':') + 1).trim();

				if (key.length > 0 && /Connection|Content-Length/g.test(key) === false) {
					socket.setRequestHeader(key, val);
				}

			});

		} else {

			payload = tmp2;

			socket.open(tmp3[0], tmp3[1], true);
			socket.responseType = 'text';

			headers.forEach(function(line) {

				var key = line.substr(0, line.indexOf(':')).trim();
				var val = line.substr(line.indexOf(':') + 1).trim();

				if (key.length > 0 && /Connection|Content-Length/g.test(key) === false) {
					socket.setRequestHeader(key, val);
				}

			});

		}


		socket.onload = function() {

			var head = {};
			var blob = null;
			var view = null;

			if (typeof socket.response === 'string') {

				blob = new Buffer(socket.response, 'utf8');

			} else if (socket.response instanceof ArrayBuffer) {

				blob = new Buffer(socket.response.byteLength);
				view = new Uint8Array(socket.response);

				for (var v = 0, vl = blob.length; v < vl; v++) {
					blob[v] = view[v];
				}

			}


			var tmp = socket.getAllResponseHeaders().split('\r\n');
			if (tmp.length > 0) {

				tmp.forEach(function(line) {

					var key = line.substr(0, line.indexOf(':')).trim();
					var val = line.substr(line.indexOf(':') + 1).trim();

					if (key.length > 0) {
						head[key.toLowerCase()] = val;
					}

				});

			}


			// XXX: HTML XHR doesn't support Buffer data
			// var chunks = protocol.receive(blob);
			var temp   = { headers: head, payload: blob };
			var chunks = [ temp ];
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


		socket.send(payload);

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
					connection = {};


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

					var chunk = protocol.send(payload, headers, binary);
					var enc   = binary === true ? 'binary' : 'utf8';

					if (chunk !== null) {
						_send_xhr.call(this, chunk, enc);
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

