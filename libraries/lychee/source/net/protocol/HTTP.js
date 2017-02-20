
lychee.define('lychee.net.protocol.HTTP').exports(function(lychee, global, attachments) {

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

	const _encode_buffer = function(payload, headers, binary) {

		let type           = this.type;
		let buffer         = null;

		let headers_data   = null;
		let headers_length = 0;
		let payload_data   = payload;
		let payload_length = payload.length;


		if (type === Composite.TYPE.client) {

			let url            = headers['url']             || null;
			let method         = headers['method']          || null;
			let service_id     = headers['@service-id']     || null;
			let service_event  = headers['@service-event']  || null;
			let service_method = headers['@service-method'] || null;


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

			for (let key in headers) {

				if (key.charAt(0) === '@') {
					headers_data += '' + _uppercase('x-' + key.substr(1)) + ': ' + headers[key] + '\r\n';
				} else if (/url|method/g.test(key) === false) {
					headers_data += '' + _uppercase(key) + ': ' + headers[key] + '\r\n';
				}

			}

			headers_data  += '\r\n';
			headers_length = headers_data.length;

		} else {

			let status  = headers['status'] || Composite.STATUS.normal_okay;
			let exposed = [ 'Content-Type' ];


			headers_data  = 'HTTP/1.1 ' + status + '\r\n';
			headers_data += 'Connection: keep-alive\r\n';
			headers_data += 'Content-Length: ' + payload_length + '\r\n';

			for (let key in headers) {

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


		let content_type = headers['content-type'] || 'text/plain';
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

	const _decode_buffer = function(buffer) {

		buffer = buffer.toString('utf8');


		let chunk = {
			bytes:   -1,
			headers: {},
			payload: null
		};


		if (buffer.indexOf('\r\n\r\n') === -1) {
			return chunk;
		}


		let headers_length = buffer.indexOf('\r\n\r\n');
		let headers_data   = buffer.substr(0, headers_length);
		let payload_data   = buffer.substr(headers_length + 4);

		let i_end = payload_data.indexOf('\r\n\r\n');
		if (i_end !== -1) {
			payload_data = payload_data.substr(0, i_end);
		}


		headers_data.split('\r\n').forEach(function(line) {

			let tmp = line.trim();
			if (/^(OPTIONS|GET|POST)/g.test(tmp) === true) {

				let tmp2   = tmp.split(' ');
				let method = (tmp2[0] || '').trim() || null;
				let url    = (tmp2[1] || '').trim() || null;

				if (method !== null && url !== null) {

					chunk.headers['method'] = method;
					chunk.headers['url']    = url;

				}


				if (url.substr(0, 5) === '/api/') {

					let tmp3 = [];

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

			} else if (tmp.substr(0, 4) === 'HTTP') {

				if (/[0-9]{3}/g.test(tmp) === true) {
					chunk.headers['status'] = tmp.split(' ')[1];
				}

			} else if (/^[0-9]{3}/g.test(tmp) === true) {

				chunk.headers['status'] = tmp.split(' ')[0];

			} else if (/:/g.test(tmp)) {

				let i_tmp = tmp.indexOf(':');
				let key   = tmp.substr(0, i_tmp).trim().toLowerCase();
				let val   = tmp.substr(i_tmp + 1).trim().toLowerCase();

				if (key === 'host') {

					if (/^\[([a-f0-9\:]+)\](.*)$/g.test(val) === true) {
						chunk.headers[key] = val.split(/^\[([a-f0-9\:]+)\](.*)$/g)[1];
					} else {
						chunk.headers[key] = val;
					}

				} else if (/origin|connection|upgrade|content-type|content-length|accept-encoding|accept-language|e-tag/g.test(key) === true) {

					chunk.headers[key] = val;

				} else if (/expires|if-modified-since|last-modified/g.test(key) === true) {

					val = tmp.split(':').slice(1).join(':').trim();
					chunk.headers[key] = val;

				} else if (/access-control/g.test(key) === true) {

					chunk.headers[key] = val;

				} else if (key.substr(0, 2) === 'x-') {

					chunk.headers['@' + key.substr(2)] = val;

				}

			}

		});


		let check = chunk.headers['method'] || null;
		if (check === 'GET') {

			let tmp4 = chunk.headers['url'] || '';
			if (tmp4.indexOf('?') !== -1) {

				let tmp5 = tmp4.split('?')[1].split('&');
				let tmp6 = {};

				tmp5.forEach(function(str) {

					let key = str.split('=')[0] || '';
					let val = str.split('=')[1] || '';

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

			let status = chunk.headers['status'] || null;
			if (status !== null) {
				chunk.bytes   = buffer.length;
				chunk.payload = new Buffer(payload_data, 'utf8');
			} else {
				chunk.bytes   = buffer.length;
				chunk.headers = null;
				chunk.payload = null;
			}

		}


		return chunk;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(type) {

		this.type = lychee.enumof(Composite.TYPE, type) ? type : null;

		this.__buffer   = new Buffer(0);
		this.__isClosed = false;


		if (lychee.debug === true) {

			if (this.type === null) {
				console.error('lychee.net.protocol.HTTP: Invalid (lychee.net.protocol.HTTP.TYPE) type.');
			}

		}

	};


	// Composite.FRAMESIZE = 32768; // 32kB
	Composite.FRAMESIZE = 0x800000; // 8MiB


	Composite.STATUS = {

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


	Composite.TYPE = {
		// 'default': 0, (deactivated)
		'client': 1,
		'remote': 2
	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'lychee.net.protocol.HTTP',
				'arguments':   [ this.type ],
				'blob':        null
			};

		},



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


			let chunks = [];


			if (blob !== null) {

				if (blob.length > Composite.FRAMESIZE) {

					chunks.push(this.close(Composite.STATUS.message_too_big));

				} else if (this.__isClosed === false) {

					let buf = this.__buffer;
					let tmp = new Buffer(buf.length + blob.length);


					buf.copy(tmp);
					blob.copy(tmp, buf.length);
					buf = tmp;


					let chunk = _decode_buffer.call(this, buf);

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

			status = typeof status === 'number' ? status : Composite.STATUS.no_content;


			if (this.__isClosed === false) {

// TODO: Close method should create a close status buffer
				// let buffer = new Buffer(4);

				// buffer[0]  = 128 + 0x08;
				// buffer[1]  =   0 + 0x02;

				// buffer.write(String.fromCharCode((status >> 8) & 0xff) + String.fromCharCode((status >> 0) & 0xff), 2, 'binary');

				// this.__isClosed = true;


				// return buffer;

			}


			return null;

		}

	};


	return Composite;

});
