
lychee.define('lychee.net.socket.HTTP').tags({
	platform: 'nidium'
}).requires([
	'lychee.net.protocol.HTTP'
]).includes([
	'lychee.event.Emitter'
]).supports((lychee, global) => {

	if (typeof global.Socket === 'function') {
		return true;
	}


	return false;

}).exports((lychee, global, attachments) => {

	const _Emitter  = lychee.import('lychee.event.Emitter');
	const _Protocol = lychee.import('lychee.net.protocol.HTTP');
	const _Socket   = global.Socket;



	/*
	 * HELPERS
	 */

	const _to_arraybuffer = function(buffer) {

		let bytes = new ArrayBuffer(buffer.length);
		let array = new Uint8Array(buffer.length);

		for (let b = 0, bl = buffer.length; b < bl; b++) {
			array[b] = buffer[b];
		}

		return bytes;

	};

	const _to_buffer = function(bytes) {

		let buffer = Buffer.alloc(bytes.byteLength);
		let array  = new Uint8Array(bytes);

		for (let b = 0; b < buffer.length; b++) {
			buffer[b] = array[b];
		}

		return buffer;

	};

	const _connect_socket = function(socket, protocol) {

		if (this.__connection !== socket) {

			socket.onread = data => {

				let blob = null;
				if (typeof data === 'string') {
					blob = Buffer.from(data, 'utf8');
				} else {
					blob = _to_buffer(data);
				}

				let chunks = protocol.receive(blob);
				if (chunks.length > 0) {

					for (let c = 0, cl = chunks.length; c < cl; c++) {
						this.trigger('receive', [ chunks[c].payload, chunks[c].headers ]);
					}

				}

			};

			socket.ondisconnect = _ => {
				this.disconnect();
			};


			this.__connection = socket;
			this.__protocol   = protocol;

			socket.onconnect = _ => {
				this.trigger('connect');
			};

		}


	};

	const _disconnect_socket = function(socket, protocol) {

		if (this.__connection === socket) {

			socket.onconnect    = function() {};
			socket.ondisconnect = function() {};
			socket.onread       = function() {};

			socket.close();
			protocol.close();


			this.__connection = null;
			this.__socket     = null;

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

					// TODO: Allow half open
					// TODO: setTimeout(0)
					// TODO: setNoDelay(true)
					// TODO: setKeepAlive(true, 0)
					// TODO: removeAllListeners('timeout')

					_connect_socket.call(this, connection, new _Protocol({
						type: _Protocol.TYPE.remote
					}));

					// TODO: connection.resume();

				} else {

					connection = new _Socket(host, port);

					// TODO: Like above

					_connect_socket.call(this, connection, new _Protocol({
						type: _Protocol.TYPE.client
					}));

					connection.connect();

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

					let chunk = protocol.send(payload, headers, binary);
					if (chunk !== null) {

						if (binary === true) {

							connection.write(_to_arraybuffer(chunk));

						} else {

							connection.write(chunk.toString('utf8'));

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

