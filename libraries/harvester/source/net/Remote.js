
lychee.define('harvester.net.Remote').requires([
	'lychee.codec.BENCODE',
	'lychee.codec.BITON',
	'lychee.codec.JSON'
]).includes([
	'lychee.net.Tunnel'
]).exports(function(lychee, global, attachments) {

	const _Tunnel  = lychee.import('lychee.net.Tunnel');
	const _BENCODE = lychee.import('lychee.codec.BENCODE');
	const _BITON   = lychee.import('lychee.codec.BITON');
	const _JSON    = lychee.import('lychee.codec.JSON');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		_Tunnel.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Tunnel.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.Remote';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		receive: function(payload, headers) {

			payload = payload instanceof Buffer ? payload : null;
			headers = headers instanceof Object ? headers : {};


			let host = headers['host'] || null;
			if (host !== null && payload !== null) {

				let data = null;
				if (payload !== null) {
					data = this.codec.decode(payload);
				}

				if (data !== null) {
					data['@host'] = host;
					payload = this.codec.encode(data);
				}

			}


			return _Tunnel.prototype.receive.call(this, payload, headers);

		},

		send: function(data, headers) {

			headers = headers instanceof Object ? headers : {};


			if (data instanceof Object) {

				headers['access-control-allow-origin'] = '*';
				headers['content-control']             = 'no-transform';


				let codec = this.codec;
				if (codec === _BENCODE) {
					headers['content-type'] = 'application/bencode; charset=utf-8';
				} else if (codec === _BITON) {
					headers['content-type'] = 'application/biton; charset=binary';
				} else if (codec === _JSON) {
					headers['content-type'] = 'application/json; charset=utf-8';
				}


				let event = headers['event'] || null;
				if (event === 'error') {
					headers['status'] = '400 Bad Request';
				}


				if (/@plug|@unplug/g.test(headers.method) === false) {
					return _Tunnel.prototype.send.call(this, data, headers);
				}

			} else {

				let payload = null;

				if (typeof data === 'string') {
					payload = new Buffer(data, 'utf8');
				} else if (data instanceof Buffer) {
					payload = data;
				}


				if (payload instanceof Buffer) {

					this.trigger('send', [ payload, headers ]);

					return true;

				}

			}


			return false;

		}

	};


	return Composite;

});

