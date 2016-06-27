
lychee.define('lychee.net.protocol.WS').requires([
	'lychee.codec.JSON'
]).exports(function(lychee, global, attachments) {

	var _JSON = lychee.import('lychee.codec.JSON');



	/*
	 * HELPERS
	 */

	/*
	 * WebSocket Framing Protocol
	 *
	 *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
	 * +-+-+-+-+-------+-+-------------+-------------------------------+
	 * |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
	 * |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
	 * |N|V|V|V|       |S|             |   (if payload len==126/127)   |
	 * | |1|2|3|       |K|             |                               |
	 * +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
	 * |     Extended payload length continued, if payload len == 127  |
	 * + - - - - - - - - - - - - - - - +-------------------------------+
	 * |                               |Masking-key, if MASK set to 1  |
	 * +-------------------------------+-------------------------------+
	 * | Masking-key (continued)       |          Payload Data         |
	 * +-------------------------------- - - - - - - - - - - - - - - - +
	 * :                     Payload Data continued ...                :
	 * + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
	 * |                     Payload Data continued ...                |
	 * +---------------------------------------------------------------+
	 *
	 */

	var _on_ping_frame = function() {

		var type = this.type;
		if (type === Class.TYPE.remote) {

			var buffer = new Buffer(2);

			// FIN, Pong
			// Unmasked, 0 payload

			buffer[0] = 128 + 0x0a;
			buffer[1] =   0 + 0x00;


			return buffer;

		}


		return null;

	};

	var _on_pong_frame = function() {

		var type = this.type;
		if (type === Class.TYPE.client) {

			var buffer = new Buffer(6);

			// FIN, Ping
			// Masked, 0 payload

			buffer[0] = 128 + 0x09;
			buffer[1] = 128 + 0x00;

			buffer[2] = (Math.random() * 0xff) | 0;
			buffer[3] = (Math.random() * 0xff) | 0;
			buffer[4] = (Math.random() * 0xff) | 0;
			buffer[5] = (Math.random() * 0xff) | 0;


			return buffer;

		}


		return null;

	};


	var _encode_buffer = function(payload, headers, binary) {

		var buffer         = null;
		var data           = _JSON.encode({
			headers: headers,
			payload: payload
		});
		var mask           = false;
		var mask_data      = null;
		var payload_data   = null;
		var payload_length = data.length;
		var type           = this.type;


		if (type === Class.TYPE.client) {

			mask      = true;
			mask_data = new Buffer(4);

			mask_data[0] = (Math.random() * 0xff) | 0;
			mask_data[1] = (Math.random() * 0xff) | 0;
			mask_data[2] = (Math.random() * 0xff) | 0;
			mask_data[3] = (Math.random() * 0xff) | 0;

			payload_data = data.map(function(value, index) {
				return value ^ mask_data[index % 4];
			});

		} else {

			mask         = false;
			mask_data    = new Buffer(4);
			payload_data = data.map(function(value) {
				return value;
			});

		}


		// 64 Bit Extended Payload Length
		if (payload_length > 0xffff) {

			var lo = payload_length | 0;
			var hi = (payload_length - lo) / 4294967296;

			buffer = new Buffer((mask === true ? 14 : 10) + payload_length);

			buffer[0] = 128 + (binary === true ? 0x02 : 0x01);
			buffer[1] = (mask === true ? 128 : 0) + 127;

			buffer[2] = (hi >> 24) & 0xff;
			buffer[3] = (hi >> 16) & 0xff;
			buffer[4] = (hi >>  8) & 0xff;
			buffer[5] = (hi >>  0) & 0xff;

			buffer[6] = (lo >> 24) & 0xff;
			buffer[7] = (lo >> 16) & 0xff;
			buffer[8] = (lo >>  8) & 0xff;
			buffer[9] = (lo >>  0) & 0xff;


			if (mask === true) {

				mask_data.copy(buffer, 10);
				payload_data.copy(buffer, 14);

			} else {

				payload_data.copy(buffer, 10);

			}


		// 16 Bit Extended Payload Length
		} else if (payload_length > 125) {

			buffer = new Buffer((mask === true ? 8 : 4) + payload_length);

			buffer[0] = 128 + (binary === true ? 0x02 : 0x01);
			buffer[1] = (mask === true ? 128 : 0) + 126;

			buffer[2] = (payload_length >> 8) & 0xff;
			buffer[3] = (payload_length >> 0) & 0xff;


			if (mask === true) {

				mask_data.copy(buffer, 4);
				payload_data.copy(buffer, 8);

			} else {

				payload_data.copy(buffer, 4);

			}


		// 7 Bit Payload Length
		} else {

			buffer = new Buffer((mask === true ? 6 : 2) + payload_length);

			buffer[0] = 128 + (binary === true ? 0x02 : 0x01);
			buffer[1] = (mask === true ? 128 : 0) + payload_length;


			if (mask === true) {

				mask_data.copy(buffer, 2);
				payload_data.copy(buffer, 6);

			} else {

				payload_data.copy(buffer, 2);

			}

		}


		return buffer;

	};

	var _decode_buffer = function(buffer) {

		var fragment = this.__fragment;
		var type     = this.type;
		var chunk    = {
			bytes:   -1,
			headers: {},
			payload: null
		};


		if (buffer.length <= 2) {
			return chunk;
		}


		var fin            = (buffer[0] & 128) === 128;
		// var rsv1        = (buffer[0] & 64) === 64;
		// var rsv2        = (buffer[0] & 32) === 32;
		// var rsv3        = (buffer[0] & 16) === 16;
		var operator       = buffer[0] & 15;
		var mask           = (buffer[1] & 128) === 128;
		var mask_data      = new Buffer(4);
		var payload_length = buffer[1] & 127;
		var payload_data   = null;

		if (payload_length <= 125) {

			if (mask === true) {
				mask_data    = buffer.slice(2, 6);
				payload_data = buffer.slice(6, 6 + payload_length);
				chunk.bytes  = 6 + payload_length;
			} else {
				mask_data    = null;
				payload_data = buffer.slice(2, 2 + payload_length);
				chunk.bytes  = 2 + payload_length;
			}

		} else if (payload_length === 126) {

			payload_length = (buffer[2] << 8) + buffer[3];

			if (mask === true) {
				mask_data    = buffer.slice(4, 8);
				payload_data = buffer.slice(8, 8 + payload_length);
				chunk.bytes  = 8 + payload_length;
			} else {
				mask_data    = null;
				payload_data = buffer.slice(4, 4 + payload_length);
				chunk.bytes  = 4 + payload_length;
			}

		} else if (payload_length === 127) {

			var hi = (buffer[2] << 24) + (buffer[3] << 16) + (buffer[4] << 8) + buffer[5];
			var lo = (buffer[6] << 24) + (buffer[7] << 16) + (buffer[8] << 8) + buffer[9];

			payload_length = (hi * 4294967296) + lo;

			if (mask === true) {
				mask_data    = buffer.slice(10, 14);
				payload_data = buffer.slice(14, 14 + payload_length);
				chunk.bytes  = 14 + payload_length;
			} else {
				mask_data    = null;
				payload_data = buffer.slice(10, 10 + payload_length);
				chunk.bytes  = 10 + payload_length;
			}

		}


		if (mask_data !== null) {

			payload_data = payload_data.map(function(value, index) {
				return value ^ mask_data[index % 4];
			});

		}


		// 0: Continuation Frame (Fragmentation)
		if (operator === 0x00) {

			if (fin === true) {

				var tmp0 = _JSON.decode(fragment.payload);
				if (tmp0 !== null) {
					chunk.headers = tmp0.headers || {};
					chunk.payload = tmp0.payload || null;
				}

				fragment.operator = 0x00;
				fragment.payload  = new Buffer(0);

			} else if (payload_data !== null) {

				var payload = new Buffer(fragment.payload.length + payload_length);

				fragment.payload.copy(payload, 0);
				payload_data.copy(payload, fragment.payload.length);

				fragment.payload = payload;

			}


		// 1: Text Frame
		} else if (operator === 0x01) {

			if (fin === true) {

				var tmp1 = _JSON.decode(payload_data);
				if (tmp1 !== null) {
					chunk.headers = tmp1.headers || {};
					chunk.payload = tmp1.payload || null;
				}

			} else {

				fragment.operator = operator;
				fragment.payload  = payload_data;

			}


		// 2: Binary Frame
		} else if (operator === 0x02) {

			if (fin === true) {

				var tmp2 = _JSON.decode(payload_data);
				if (tmp2 !== null) {
					chunk.headers = tmp2.headers || {};
					chunk.payload = tmp2.payload || null;
				}

			} else {

				fragment.operator = operator;
				fragment.payload  = payload_data;

			}


		// 8: Connection Close
		} else if (operator === 0x08) {

			chunk.payload = this.close(Class.STATUS.normal_closure);


		// 9: Ping Frame
		} else if (operator === 0x09) {

			chunk.payload = _on_ping_frame.call(this);


		// 10: Pong Frame
		} else if (operator === 0x0a) {

			chunk.payload = _on_pong_frame.call(this);


		// 3-7: Reserved Non-Control Frames, 11-15: Reserved Control Frames
		} else {

			chunk.payload = this.close(Class.STATUS.protocol_error);

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
		this.__fragment = { operator: 0x00, payload: new Buffer(0) };
		this.__isClosed = false;


		if (lychee.debug === true) {

			if (this.type === null) {
				console.error('lychee.net.protocol.WS: Invalid (lychee.net.protocol.WS.TYPE) type.');
			}

		}

	};


	// Class.FRAMESIZE = 32768; // 32kB
	Class.FRAMESIZE = 0x800000; // 8MiB


	Class.STATUS = {

		// IESG_HYBI
		normal_closure:  1000,
		protocol_error:  1002,
		message_too_big: 1009

		// IESG_HYBI
		// going_away:         1001,
		// unsupported_data:   1003,
		// no_status_received: 1005,
		// abnormal_closure:   1006,
		// invalid_payload:    1007,
		// policy_violation:   1008,
		// missing_extension:  1010,
		// internal_error:     1011,

		// IESG_HYBI Current
		// service_restart:    1012,
		// service_overload:   1013,

		// IESG_HYBI
		// tls_handshake:      1015

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

					chunks.push({
						payload: this.close(Class.STATUS.message_too_big)
					});

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

			status = typeof status === 'number' ? status : Class.STATUS.normal_closure;


			if (this.__isClosed === false) {

				var buffer = new Buffer(4);

				buffer[0]  = 128 + 0x08;
				buffer[1]  =   0 + 0x02;

				buffer.write(String.fromCharCode((status >> 8) & 0xff) + String.fromCharCode((status >> 0) & 0xff), 2, 'binary');

				this.__isClosed = true;


				return buffer;

			}


			return null;

		},



		/*
		 * CUSTOM API
		 */

		ping: function() {

			return _on_pong_frame.call(this);

		}

	};


	return Class;

});

