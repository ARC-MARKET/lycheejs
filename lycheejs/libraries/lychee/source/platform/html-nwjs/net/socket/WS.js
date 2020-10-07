
lychee.define('lychee.net.socket.WS').tags({
	platform: 'html-nwjs'
}).requires([
	'lychee.crypto.SHA1',
	'lychee.net.protocol.WS'
]).includes([
	'lychee.event.Emitter'
]).supports((lychee, global) => {

	if (
		typeof global.require === 'function'
		&& typeof global.setInterval === 'function'
	) {

		try {

			global.require('net');

			return true;

		} catch (err) {
		}

	}


	return false;

}).exports((lychee, global, attachments) => {

	const Buffer         = lychee.import('Buffer');
	const _net           = global.require('net');
	const _clearInterval = global.clearInterval;
	const _setInterval   = global.setInterval;
	const _Buffer        = global.require('buffer').Buffer;
	const _Emitter       = lychee.import('lychee.event.Emitter');
	const _Protocol      = lychee.import('lychee.net.protocol.WS');
	const _SHA1          = lychee.import('lychee.crypto.SHA1');



	/*
	 * HELPERS
	 */

	const _connect_socket = function(socket, protocol) {

		if (this.__connection !== socket) {

			socket.on('data', raw => {

				// XXX: nwjs has global scope problems
				// XXX: Internal Buffer is not our global.Buffer interface

				let blob = Buffer.alloc(raw.length);
				for (let b = 0; b < blob.length; b++) {
					blob[b] = raw[b];
				}


				let chunks = protocol.receive(blob);
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

	const _verify_client = function(headers, nonce) {

		let connection = (headers['connection'] || '').toLowerCase();
		let upgrade    = (headers['upgrade']    || '').toLowerCase();
		let protocol   = (headers['sec-websocket-protocol'] || '').toLowerCase();

		if (connection === 'upgrade' && upgrade === 'websocket' && protocol === 'lycheejs') {

			let accept = (headers['sec-websocket-accept'] || '');
			let expect = (function(nonce) {

				let sha1 = new _SHA1();
				sha1.update(nonce + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
				return sha1.digest().toString('base64');

			})(nonce.toString('base64'));


			if (accept === expect) {
				return accept;
			}

		}


		return null;

	};

	const _verify_remote = function(headers) {

		let connection = (headers['connection'] || '').toLowerCase();
		let upgrade    = (headers['upgrade']    || '').toLowerCase();
		let protocol   = (headers['sec-websocket-protocol'] || '').toLowerCase();

		if (connection === 'upgrade' && upgrade === 'websocket' && protocol === 'lycheejs') {

			let host   = headers['host']   || null;
			let nonce  = headers['sec-websocket-key'] || null;
			let origin = headers['origin'] || null;

			if (host !== null && nonce !== null && origin !== null) {

				let handshake = '';
				let accept    = (function(nonce) {

					let sha1 = new _SHA1();
					sha1.update(nonce + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
					return sha1.digest().toString('base64');

				})(nonce);


				// HEAD

				handshake += 'HTTP/1.1 101 WebSocket Protocol Handshake\r\n';
				handshake += 'Upgrade: WebSocket\r\n';
				handshake += 'Connection: Upgrade\r\n';

				handshake += 'Sec-WebSocket-Version: '  + '13'       + '\r\n';
				handshake += 'Sec-WebSocket-Origin: '   + origin     + '\r\n';
				handshake += 'Sec-WebSocket-Protocol: ' + 'lycheejs' + '\r\n';
				handshake += 'Sec-WebSocket-Accept: '   + accept     + '\r\n';


				// BODY
				handshake += '\r\n';


				return handshake;

			}

		}


		return null;

	};

	const _upgrade_client = function(host, port, nonce) {

		let handshake  = '';
		let identifier = lychee.ROOT.project;


		if (identifier.startsWith(lychee.ROOT.lychee)) {
			identifier = lychee.ROOT.project.substr(lychee.ROOT.lychee.length + 1);
		}

		for (let n = 0; n < 16; n++) {
			nonce[n] = Math.round(Math.random() * 0xff);
		}



		// HEAD

		handshake += 'GET / HTTP/1.1\r\n';
		handshake += 'Host: ' + host + ':' + port + '\r\n';
		handshake += 'Upgrade: WebSocket\r\n';
		handshake += 'Connection: Upgrade\r\n';
		handshake += 'Origin: lycheejs://' + identifier + '\r\n';
		handshake += 'Sec-WebSocket-Key: ' + nonce.toString('base64') + '\r\n';
		handshake += 'Sec-WebSocket-Version: 13\r\n';
		handshake += 'Sec-WebSocket-Protocol: lycheejs\r\n';


		// BODY
		handshake += '\r\n';


		this.once('data', data => {

			let headers = {};
			let lines   = data.toString('utf8').split('\r\n');


			lines.forEach(line => {

				let index = line.indexOf(':');
				if (index !== -1) {

					let key = line.substr(0, index).trim().toLowerCase();
					let val = line.substr(index + 1, line.length - index - 1).trim();
					if (/connection|upgrade|sec-websocket-version|sec-websocket-origin|sec-websocket-protocol/g.test(key)) {
						headers[key] = val.toLowerCase();
					} else if (key === 'sec-websocket-accept') {
						headers[key] = val;
					}

				}

			});


			if (headers['connection'] === 'upgrade' && headers['upgrade'] === 'websocket') {

				this.emit('upgrade', {
					headers: headers,
					socket:  this
				});

			} else {

				let err = new Error('connect ECONNREFUSED');
				err.code = 'ECONNREFUSED';

				this.emit('error', err);

			}

		});


		this.write(handshake, 'ascii');

	};

	const _upgrade_remote = function(data) {

		let lines   = data.toString('utf8').split('\r\n');
		let headers = {};


		lines.forEach(line => {

			let index = line.indexOf(':');
			if (index !== -1) {

				let key = line.substr(0, index).trim().toLowerCase();
				let val = line.substr(index + 1, line.length - index - 1).trim();
				if (/host|connection|upgrade|origin|sec-websocket-protocol/g.test(key)) {
					headers[key] = val.toLowerCase();
				} else if (key === 'sec-websocket-key') {
					headers[key] = val;
				}

			}

		});


		if (headers['connection'] === 'upgrade' && headers['upgrade'] === 'websocket') {

			this.emit('upgrade', {
				headers: headers,
				socket:  this
			});

		} else {

			this.destroy();

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

				if (connection !== null) {

					connection.once('data', _upgrade_remote.bind(connection));
					connection.resume();

					connection.once('error', err => {

						if (lychee.debug === true) {

							let code = err.code || '';
							if (/ECONNABORTED|ECONNREFUSED|ECONNRESET/.test(code)) {
								console.warn('lychee.net.socket.WS: BAD CONNECTION to ' + host + ':' + port);
							}

						}

						this.trigger('error');
						this.disconnect();

					});

					connection.on('upgrade', event => {

						let protocol = new _Protocol({
							type: _Protocol.TYPE.remote
						});
						let socket   = event.socket || null;


						if (socket !== null) {

							let verification = _verify_remote.call(socket, event.headers);
							if (verification !== null) {

								socket.allowHalfOpen = true;
								socket.setTimeout(0);
								socket.setNoDelay(true);
								socket.setKeepAlive(true, 0);
								socket.removeAllListeners('timeout');
								socket.write(verification, 'ascii');


								_connect_socket.call(this, socket, protocol);

							} else {

								if (lychee.debug === true) {
									console.warn('lychee.net.socket.WS: BAD HANDSHAKE to ' + host + ':' + port);
								}


								socket.write('', 'ascii');
								socket.end();
								socket.destroy();

								this.trigger('error');
								this.disconnect();

							}

						}

					});

				} else {

					let nonce     = Buffer.alloc(16);
					let connector = new _net.Socket({
						// fd:       null,
						readable: true,
						writable: true
					});


					connector.once('connect', _upgrade_client.bind(connector, host, port, nonce));

					connector.on('upgrade', function(event) {

						let protocol = new _Protocol({
							type: _Protocol.TYPE.client
						});
						let socket   = event.socket || null;


						if (socket !== null) {

							let verification = _verify_client(event.headers, nonce);
							if (verification !== null) {

								socket.setTimeout(0);
								socket.setNoDelay(true);
								socket.setKeepAlive(true, 0);
								socket.removeAllListeners('timeout');


								let interval_id = _setInterval(_ => {

									if (socket.writable) {

										let chunk = protocol.ping();
										if (chunk !== null) {
											// XXX: nwjs has global scope problems
											// XXX: Internal Buffer is not our global.Buffer interface
											socket.write(_Buffer.from(chunk));
										}

									} else {

										_clearInterval(interval_id);
										interval_id = null;

									}

								}, 60000);


								_connect_socket.call(this, socket, protocol);

							} else {

								if (lychee.debug === true) {
									console.warn('lychee.net.socket.WS: BAD HANDSHAKE to ' + host + ':' + port);
								}


								socket.end();
								socket.destroy();

								this.trigger('error');
								this.disconnect();

							}

						}

					});

					connector.once('error', err => {

						if (lychee.debug === true) {

							let code = err.code || '';
							if (/ECONNABORTED|ECONNREFUSED|ECONNRESET/.test(code)) {
								console.warn('lychee.net.socket.WS: BAD CONNECTION to ' + host + ':' + port);
							}

						}

						this.trigger('error');
						this.disconnect();

						connector.end();
						connector.destroy();

					});

					connector.connect({
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
					if (chunk !== null) {

						// XXX: nwjs has global scope problems
						// XXX: Internal Buffer is not our global.Buffer interface
						connection.write(_Buffer.from(chunk));

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

