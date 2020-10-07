
lychee.define('lychee.net.socket.HTTP').tags({
	platform: 'node'
}).requires([
	'lychee.net.protocol.HTTP'
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

	const _net      = global.require('net');
	const _Emitter  = lychee.import('lychee.event.Emitter');
	const _Protocol = lychee.import('lychee.net.protocol.HTTP');



	/*
	 * HELPERS
	 */

	const _connect_socket = function(socket, protocol) {

		if (this.__connection !== socket) {

			socket.on('data', blob => {

				let chunks = protocol.receive(blob);
				if (chunks.length > 0) {

					for (let c = 0, cl = chunks.length; c < cl; c++) {
						this.trigger('receive', [ chunks[c].payload, chunks[c].headers ]);
					}

				}

			});

			socket.on('error', _ => {
				this.trigger('error');
				this.disconnect();
			});

			socket.on('timeout', _ => {
				this.trigger('error');
				this.disconnect();
			});

			socket.on('close', _ => {
				this.disconnect();
			});

			socket.on('end', _ => {
				this.disconnect();
			});


			this.__connection = socket;
			this.__protocol   = protocol;

			this.trigger('connect');

		}

	};

	const _disconnect_socket = function(socket, protocol) {

		if (this.__connection === socket) {

			socket.removeAllListeners('data');
			socket.removeAllListeners('error');
			socket.removeAllListeners('timeout');
			socket.removeAllListeners('close');
			socket.removeAllListeners('end');

			socket.destroy();
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

					connection.allowHalfOpen = true;
					connection.setTimeout(0);
					connection.setNoDelay(true);
					connection.setKeepAlive(true, 0);
					connection.removeAllListeners('timeout');


					_connect_socket.call(this, connection, new _Protocol({
						type: _Protocol.TYPE.remote
					}));

					connection.resume();

				} else {

					connection = new _net.Socket({
						readable: true,
						writable: true
					});

					connection.allowHalfOpen = true;
					connection.setTimeout(0);
					connection.setNoDelay(true);
					connection.setKeepAlive(true, 0);
					connection.removeAllListeners('timeout');


					_connect_socket.call(this, connection, new _Protocol({
						type: _Protocol.TYPE.client
					}));

					connection.connect({
						host: host,
						port: port
					});

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
					let enc   = binary === true ? 'binary' : 'utf8';

					if (chunk !== null) {

						connection.write(chunk, enc);

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

