
lychee.define('lychee.net.socket.HTTP').tags({
	platform: 'html'
}).requires([
	'lychee.net.protocol.HTTP'
]).includes([
	'lychee.event.Emitter'
]).supports((lychee, global) => {

	if (
		typeof global.XMLHttpRequest === 'function'
		|| typeof global.XMLHttpRequest === 'object'
	) {
		return true;
	}


	return false;

}).exports((lychee, global, attachments) => {

	const _Emitter  = lychee.import('lychee.event.Emitter');
	const _Protocol = lychee.import('lychee.net.protocol.HTTP');
	const _XHR      = global.XMLHttpRequest;



	/*
	 * HELPERS
	 */

	const _uppercase = function(str) {

		let tmp = str.split('-');

		for (let t = 0, tl = tmp.length; t < tl; t++) {
			let ch = tmp[t];
			tmp[t] = ch.charAt(0).toUpperCase() + ch.substr(1);
		}

		return tmp.join('-');

	};

	const _receive_xhr = function(raw_headers, raw_payload) {

		let blob = null;

		if (typeof raw_payload === 'string') {

			blob = Buffer.from(raw_payload, 'utf8');

		} else if (raw_payload instanceof ArrayBuffer) {

			blob = Buffer.from(raw_payload);

		}


		let headers = {};
		let payload = blob;

		raw_headers.split('\r\n').forEach(line => {

			let i1 = line.indexOf(':');
			if (i1 !== -1) {

				let key = line.substr(0, i1).trim().toLowerCase();
				let val = line.substr(i1 + 1).trim();

				if (key.startsWith('x-')) {
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

	const _reconnect_xhr = function(chunk, headers, binary) {

		let connection = this.__connection;
		if (connection !== null) {

			let tmp    = chunk.toString('utf8').split('\n')[0].trim().split(' ');
			let method = tmp[0];
			let url    = 'http://' + connection.host + ':' + connection.port + tmp[1];
			let socket = new _XHR();


			socket.open(method, url, true);
			socket.responseType = binary === true ? 'arraybuffer' : 'text';

			socket.onload = _ => {

				let chunks = _receive_xhr.call(this, socket.getAllResponseHeaders(), socket.response);
				if (chunks.length > 0) {

					for (let c = 0, cl = chunks.length; c < cl; c++) {

						let chunk = chunks[c];
						if (chunk.payload !== null) {
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

			for (let key in headers) {

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

	const _connect_socket = function(socket, protocol) {

		if (this.__connection !== socket) {

			// TODO: connect socket events

			this.__connection = socket;
			this.__protocol   = protocol;

			this.trigger('connect');

		}

	};

	const _disconnect_socket = function(socket, protocol) {

		if (this.__connection === socket) {

			// TODO: disconnect socket events

			// socket.destroy();
			protocol.close();


			this.__connection = null;
			this.__protocol   = null;

			setTimeout(_ => this.trigger('disconnect'), 0);

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


			if (host !== null && port !== null) {

				if (connection !== null) {

					connection = null;

					// TODO: Remote Socket API

					// _connect_socket.call(this, connection, new _Protocol({
					//	type: _Protocol.TYPE.remote
					// });
					// connection.resume();

				} else {

					connection = {
						host: host,
						port: port
					};


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
			headers = headers instanceof Object ? headers : null;
			binary  = binary === true;


			if (payload !== null) {

				let connection = this.__connection;
				let protocol   = this.__protocol;

				if (connection !== null && protocol !== null) {

					// XXX: HTML XHR does not support Buffer data
					let chunk = protocol.send(payload, headers, binary);


					// XXX: Web XHR does not support halfopen Sockets
					connection = _reconnect_xhr.call(this, chunk, headers, binary);
					chunk      = payload;


					if (connection !== null && chunk !== null) {

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

