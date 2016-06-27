
lychee.define('lychee.net.protocol.HTTP').exports(function(lychee, global, attachments) {

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

	var _encode_buffer = function(payload, headers, binary) {

		var type           = this.type;
		var buffer         = null;

		var headers_data   = null;
		var headers_length = 0;
		var payload_data   = payload;
		var payload_length = payload.length;


		if (type === Class.TYPE.client) {

			var url            = headers['url']             || null;
			var method         = headers['method']          || null;
			var service_id     = headers['@service-id']     || null;
			var service_event  = headers['@service-event']  || null;
			var service_method = headers['@service-method'] || null;


			if (service_id !== null) {

				if (service_method !== null) {

					method = 'GET';
					url    = '/api/' + service_id + '/' + service_method;

				} else if (service_event !== null) {

					method = 'POST';
					url    = '/api/' + service_id + '/' + service_event;

				}

			}


			if (url !== null && method !== null) {
				headers_data = method + ' ' + url + ' HTTP/1.1\r\n';
			} else {
				headers_data = 'GET * HTTP/1.1\r\n';
			}


			headers_data += 'Connection: keep-alive\r\n';
			headers_data += 'Content-Length: ' + payload_length + '\r\n';

			for (var key in headers) {

				if (key.charAt(0) === '@') {
					headers_data += '' + _uppercase('x-' + key.substr(1)) + ': ' + headers[key] + '\r\n';
				} else if (/url|method/g.test(key) === false) {
					headers_data += '' + _uppercase(key) + ': ' + headers[key] + '\r\n';
				}

			}

			headers_data  += '\r\n';
			headers_length = headers_data.length;

		} else {

			var status  = headers['status'] || Class.STATUS.normal_okay;
			var exposed = [ 'Content-Type' ];


			headers_data  = 'HTTP/1.1 ' + status + '\r\n';
			headers_data += 'Connection: keep-alive\r\n';
			headers_data += 'Content-Length: ' + payload_length + '\r\n';

			for (var key in headers) {

				if (key.charAt(0) === '@') {
					headers_data += '' + _uppercase('x-' + key.substr(1)) + ': ' + headers[key] + '\r\n';
					exposed.push(_uppercase('x-' + key.substr(1)));
				} else if (/status/g.test(key) === false) {
					headers_data += '' + _uppercase(key) + ': ' + headers[key] + '\r\n';
				}

			}

			headers_data  += 'Access-Control-Expose-Headers: ' + exposed.join(', ') + '\r\n';
			headers_data  += '\r\n';
			headers_length = headers_data.length;

		}


		var content_type = headers['content-type'] || 'text/plain';
		if (/text\//g.test(content_type) === true) {

			buffer = new Buffer(headers_length + payload_length + 2);
			buffer.write(headers_data, 0, headers_length, 'utf8');
			payload_data.copy(buffer, headers_length, 0, payload_length);
			buffer.write('\r\n', headers_length + payload_length, 2, 'utf8');

		} else {

			buffer = new Buffer(headers_length + payload_length + 2);
			buffer.write(headers_data, 0, headers_length, 'utf8');
			payload_data.copy(buffer, headers_length, 0, payload_length);
			buffer.write('\r\n', headers_length + payload_length, 2, 'utf8');

		}


		return buffer;

	};

	var _decode_buffer = function(buffer) {

		buffer = buffer.toString('utf8');


		var fragment = this.__fragment;
		var type     = this.type;
		var chunk    = {
			bytes:   -1,
			headers: {},
			payload: null
		};


		if (buffer.indexOf('\r\n\r\n') === -1) {
			return chunk;
		}


		var headers_length = buffer.indexOf('\r\n\r\n');
		var headers_data   = buffer.substr(0, headers_length);
		var payload_data   = buffer.substr(headers_length + 4);
		var payload_length = buffer.length - headers_length - 4;

		var i_end = payload_data.indexOf('\r\n\r\n');
		if (i_end !== -1) {
			payload_data   = payload_data.substr(0, i_end);
			payload_length = payload_data.length;
		}


		headers_data.split('\r\n').forEach(function(line) {

			var tmp = line.trim();
			if (tmp.indexOf(':') !== -1) {

				var key = (tmp.split(':')[0] || '').trim().toLowerCase();
				var val = (tmp.split(':')[1] || '').trim();

				if (/host|origin|connection|upgrade|content-type|content-length|accept-encoding|accept-language|e-tag/g.test(key) === true) {

					chunk.headers[key] = val;

				} else if (/expires|if-modified-since|last-modified/g.test(key) === true) {

					val = tmp.split(':').slice(1).join(':').trim();
					chunk.headers[key] = val;

				} else if (/access-control/g.test(key) === true) {

					chunk.headers[key] = val;

				} else if (key.substr(0, 2) === 'x-') {

					chunk.headers['@' + key.substr(2)] = val;

				}

			} else if (/OPTIONS|GET|POST/g.test(tmp) === true) {

				var tmp2   = tmp.split(' ');
				var method = (tmp2[0] || '').trim() || null;
				var url    = (tmp2[1] || '').trim() || null;

				if (method !== null && url !== null) {

					chunk.headers['method'] = method;
					chunk.headers['url']    = url;

				}


				if (url.substr(0, 5) === '/api/') {

					var tmp3 = [];

					if (url.indexOf('?') !== -1) {
						tmp3 = url.split('?')[0].split('/');
					} else {
						tmp3 = url.split('/');
					}

					if (tmp3.length === 4) {

						if (method === 'GET') {

							chunk.headers['@service-id']     = tmp3[2];
							chunk.headers['@service-method'] = tmp3[3];

						} else if (method === 'POST') {

							chunk.headers['@service-id']    = tmp3[2];
							chunk.headers['@service-event'] = tmp3[3];

						}

					}

				}

			} else if (/[0-9]{3}/g.test(tmp.substr(0, 3)) === true) {
				chunk.headers['status'] = tmp.split(' ')[0];
			}

		});


		var check = chunk.headers['method'] || null;
		if (check === 'GET') {

			var tmp4 = chunk.headers['url'] || '';
			if (tmp4.indexOf('?') !== -1) {

				var tmp5 = tmp4.split('?')[1].split('&');
				var tmp6 = {};

				tmp5.forEach(function(str) {

					var key = str.split('=')[0] || '';
					var val = str.split('=')[1] || '';

					if (key !== '' && val !== '') {
						tmp6[key] = val;
					}

				});


				chunk.bytes   = headers_data.length + payload_data.length + 4;
				chunk.payload = new Buffer(JSON.stringify(tmp6), 'utf8');

			} else {

				chunk.bytes   = headers_data.length + payload_data.length + 4;
				chunk.payload = new Buffer('', 'utf8');

			}

		} else if (check === 'OPTIONS') {

			chunk.bytes   = headers_data.length + payload_data.length + 4;
			chunk.payload = new Buffer('', 'utf8');

		} else if (check === 'POST') {

			chunk.bytes   = headers_data.length + payload_data.length + 4;
			chunk.payload = new Buffer(payload_data, 'utf8');

		} else {

			chunk.bytes   = buffer.length;
			chunk.headers = null;
			chunk.payload = null;

		}


		return chunk;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(type) {

		type = lychee.enumof(Class.TYPE, type) ? type : null;


		this.type = type;


		this.__buffer   = new Buffer(0);
		this.__fragment = { payload: new Buffer(0) };
		this.__isClosed = false;


		if (lychee.debug === true) {

			if (this.type === null) {
				console.error('lychee.net.protocol.HTTP: Invalid (lychee.net.protocol.HTTP.TYPE) type.');
			}

		}

	};


	// Class.FRAMESIZE = 32768; // 32kB
	Class.FRAMESIZE = 0x800000; // 8MiB


	Class.STATUS = {

		// RFC7231
		normal_continue: '100 Continue',
		normal_okay:     '200 OK',
		protocol_error:  '400 Bad Request',
		message_too_big: '413 Payload Too Large',
		not_found:       '404 Not Found',
		not_allowed:     '405 Method Not Allowed',
		not_implemented: '501 Not Implemented',
		bad_gateway:     '502 Bad Gateway',

		// RFC7233
		normal_closure:  '204 No Content',
		normal_partial:  '206 Partial Content'

	};


	Class.TYPE = {
		// 'default': 0, (deactivated)
		'client': 1,
		'remote': 2
	};


	Class.prototype = {

		/*
		 * PROTOCOL API
		 */

		send: function(payload, headers, binary) {

			payload = payload instanceof Buffer ? payload : null;
			headers = headers instanceof Object ? headers : null;
			binary  = binary === true;


			if (payload !== null) {

				if (this.__isClosed === false) {
					return _encode_buffer.call(this, payload, headers, binary);
				}

			}


			return null;

		},

		receive: function(blob) {

			blob = blob instanceof Buffer ? blob : null;


			var chunks = [];


			if (blob !== null) {

				if (blob.length > Class.FRAMESIZE) {

					chunks.push(this.close(Class.STATUS.message_too_big));

				} else if (this.__isClosed === false) {

					var buf = this.__buffer;
					var tmp = new Buffer(buf.length + blob.length);


					buf.copy(tmp);
					blob.copy(tmp, buf.length);
					buf = tmp;


					var chunk = _decode_buffer.call(this, buf);

					while (chunk.bytes !== -1) {

						if (chunk.payload !== null) {
							chunks.push(chunk);
						}


						tmp = new Buffer(buf.length - chunk.bytes);
						buf.copy(tmp, 0, chunk.bytes);
						buf = tmp;

						chunk = null;
						chunk = _decode_buffer.call(this, buf);

					}


					this.__buffer = buf;

				}

			}


			return chunks;

		},

		close: function(status) {

			status = typeof status === 'number' ? status : Class.STATUS.no_content;


			if (this.__isClosed === false) {

// TODO: Close method should create a close status buffer
				// var buffer = new Buffer(4);

				// buffer[0]  = 128 + 0x08;
				// buffer[1]  =   0 + 0x02;

				// buffer.write(String.fromCharCode((status >> 8) & 0xff) + String.fromCharCode((status >> 0) & 0xff), 2, 'binary');

				// this.__isClosed = true;


				// return buffer;

			}


			return null;

		}

	};


	return Class;

});
