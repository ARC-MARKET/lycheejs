
lychee.define('lychee.net.Server').tags({
	platform: 'nodejs'
}).requires([
	'lychee.net.Remote'
]).includes([
	'lychee.event.Emitter'
]).supports(function(lychee, global) {

	if (
		typeof process !== 'undefined'
	) {
		return true;
	}


	return false;

}).exports(function(lychee, global) {

	var http = require('http');
	var crypto = require('crypto');


	var Class = function(encoder, decoder) {

		encoder = encoder instanceof Function ? encoder : function(msg) { return msg; };
		decoder = decoder instanceof Function ? decoder : function(msg) { return msg; };


		this.__encoder = encoder;
		this.__decoder = decoder;

		this.__server       = null;
		this.__isRunning    = false;
		this.__maxFrameSize = 32768;
		this.__remotes      = [];


		lychee.event.Emitter.call(this, 'server');

	};


	Class.prototype = {

		/*
		 * PRIVATE API
		 */

		__getWebSocketHeaders: function(httpheaders) {

			var wsheaders = {
				host:    httpheaders.host,
				origin:  httpheaders.origin || null,
				version: +httpheaders.version || 0
			};


			for (var prop in httpheaders) {

				if (prop.substr(0, 14) === 'sec-websocket-') {
					wsheaders[prop.substr(14)] = httpheaders[prop];
				}

			}


			if (wsheaders.version) {
				return wsheaders;
			}


			return null;

		},

		__getWebSocketHandshake: function(request, head) {

			var headers = this.__getWebSocketHeaders(request.headers);
			if (headers !== null && headers.origin !== null) {

				var sha1 = crypto.createHash('sha1');
				sha1.update(headers.key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');


				// HEAD
				var handshake = '';
				handshake += 'HTTP/1.1 101 WebSocket Protocol Handshake\r\n';
				handshake += 'Upgrade: WebSocket\r\n';
				handshake += 'Connection: Upgrade\r\n';

				handshake += 'Sec-WebSocket-Version: ' + headers.version       + '\r\n';
				handshake += 'Sec-WebSocket-Origin: '  + headers.origin        + '\r\n';
				handshake += 'Sec-WebSocket-Accept: '  + sha1.digest('base64') + '\r\n';


				// BODY
				handshake += '\r\n';


				return handshake;

			}


			return null;

		},

		__upgrade: function(request, socket, head) {

			// 1. Validate Upgrade Request
			var reqheaders = request.headers;
			if (
				!(
					request.method === 'GET'
					&& typeof reqheaders.upgrade !== 'undefined'
					&& typeof reqheaders.connection !== 'undefined'
					&& reqheaders.upgrade.toLowerCase() === 'websocket'
					&& reqheaders.connection.toLowerCase().indexOf('upgrade') !== -1
				)
			) {

				return false;

			}


			// 2. Handshake
			var handshake = this.__getWebSocketHandshake(request, head);
			if (handshake !== null) {

				socket.write(handshake, 'ascii');
				socket.setTimeout(0);
				socket.setNoDelay(true);
				socket.setKeepAlive(true, 0);
				socket.removeAllListeners('timeout');

				this.connect(new lychee.net.Remote(
					this, socket, this.__maxFrameSize,
					this.__encoder, this.__decoder
				));


				return true;

			}


			return false;

		},



		/*
		 * PUBLIC API
		 */

		listen: function(port, host) {

			port = typeof port === 'number' ? port : 80;
			host = typeof host === 'string' ? host : null;


			if (lychee.debug === true) {
				console.log('lychee.net.Server: Listening on ' + host + ':' + port);
			}


			var that = this;

			this.__server = new http.Server();
			this.__server.listen(port, host);
			this.__server.on('upgrade', function(request, socket, headers) {

				if (that.__upgrade(request, socket, headers) === false) {
					socket.end();
					socket.destroy();
				}

			});


			this.__isRunning = true;

		},



		/*
		 * REMOTE INTEGRATION API
		 */

		connect: function(remote) {

			var found = false;
			for (var r = 0, rl = this.__remotes.length; r < rl; r++) {

				if (this.__remotes[r] === remote) {
					found = true;
					break;
				}

			}


			if (found === false) {

				if (lychee.debug === true) {
					console.log('lychee.net.Server: Connected lychee.Remote (' + remote.id + ')');
				}

				this.__remotes.push(remote);
				this.trigger('connect', [ remote ]);

			}

		},

		disconnect: function(remote) {

			var found = false;
			for (var r = 0, rl = this.__remotes.length; r < rl; r++) {

				if (this.__remotes[r] === remote) {
					found = true;
					this.__remotes.splice(r, 1);
					rl--;
				}

			}


			if (found === true) {
				this.trigger('disconnect', [ remote ]);
			}

		}

	};


	return Class;

});

