
lychee.define('lychee.net.socket.WS').tags({
	platform: 'html'
}).requires([
	'lychee.codec.JSON',
	'lychee.net.protocol.WS'
]).includes([
	'lychee.event.Emitter'
]).supports((lychee, global) => {

	if (typeof global.WebSocket !== 'undefined') {
		return true;
	}


	return false;

}).exports((lychee, global, attachments) => {

	const _Emitter   = lychee.import('lychee.event.Emitter');
	const _JSON      = lychee.import('lychee.codec.JSON');
	const _Protocol  = lychee.import('lychee.net.protocol.WS');
	const _WebSocket = global.WebSocket;



	/*
	 * HELPERS
	 */

	const _connect_socket = function(socket, protocol) {

		if (this.__connection !== socket) {

			socket.onmessage = event => {

				let blob = null;

				if (typeof event.data === 'string') {

					blob = Buffer.from(event.data, 'utf8');

				} else if (event.data instanceof ArrayBuffer) {

					blob = Buffer.from(event.data);

				}


				let temp = _JSON.decode(blob);
				if (temp === null) {
					return;
				}


				// XXX: HTML WebSocket doesn't support Buffer data
				let chunks = [ temp ];
				if (chunks.length > 0) {

					for (let c = 0, cl = chunks.length; c < cl; c++) {

						let chunk = chunks[c];
						if (chunk.payload[0] === 136) {

							this.send(chunk.payload, chunk.headers, true);
							this.disconnect();

							return;

						} else {

							this.trigger('receive', [ chunk.payload, chunk.headers ]);

						}

					}

				}

			};

			socket.onerror = _ => {
				this.trigger('error');
				this.disconnect();
			};

			socket.ontimeout = _ => {
				this.trigger('error');
				this.disconnect();
			};

			socket.onclose = _ => {
				this.disconnect();
			};


			this.__connection = socket;
			this.__protocol   = protocol;

			socket.onopen = _ => {
				this.trigger('connect');
			};

		}

	};

	const _disconnect_socket = function(socket, protocol) {

		if (this.__connection === socket) {

			socket.onmessage = function() {};
			socket.onerror   = function() {};
			socket.ontimeout = function() {};
			socket.onclose   = function() {};

			socket.close();
			protocol.close();


			this.__connection = null;
			this.__protocol   = null;

			this.trigger('disconnect');

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function() {

		this.__connection = null;
		this.__protocol   = null;


		_Emitter.call(this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
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


			if (host !== null && port !== null) {

				let url = /:/g.test(host) ? ('ws://[' + host + ']:' + port) : ('ws://' + host + ':' + port);

				if (connection !== null) {

					connection = null;

					// TODO: Remote Socket API

					// _connect_socket.call(this, connection, new _Protocol({
					//	type: _Protocol.TYPE.remote
					// }));
					// connection.resume();

				} else {

					connection = new _WebSocket(url, [ 'lycheejs' ]);


					_connect_socket.call(this, connection, new _Protocol({
						type: _Protocol.TYPE.client
					}));

				}


				return true;

			}


			return false;

		},

		send: function(payload, headers, binary) {

			payload = payload instanceof Buffer ? payload : null;
			headers = headers instanceof Object ? headers : {};
			binary  = binary === true;


			if (payload !== null) {

				let connection = this.__connection;
				let protocol   = this.__protocol;

				if (connection !== null && protocol !== null) {

					// XXX: HTML WebSocket does not support Buffer data
					let chunk = _JSON.encode({
						headers: headers,
						payload: payload
					});

					if (chunk !== null) {

						if (binary === true) {

							let blob = new ArrayBuffer(chunk.length);
							let view = new Uint8Array(blob);

							for (let c = 0, cl = chunk.length; c < cl; c++) {
								view[c] = chunk[c];
							}

							connection.send(blob);

						} else {

							connection.send(chunk.toString('utf8'));

						}


						return true;

					}

				}

			}


			return false;

		},

		disconnect: function() {

			let connection = this.__connection;
			let protocol   = this.__protocol;

			if (connection !== null && protocol !== null) {

				_disconnect_socket.call(this, connection, protocol);


				return true;

			}


			return false;

		}

	};


	return Composite;

});

