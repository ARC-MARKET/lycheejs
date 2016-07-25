
lychee.define('harvester.net.Remote').requires([
	'lychee.codec.BENCODE',
	'lychee.codec.BITON',
	'lychee.codec.JSON'
]).includes([
	'lychee.net.Tunnel'
]).exports(function(lychee, global, attachments) {

	var _BENCODE = lychee.import('lychee.codec.BENCODE');
	var _BITON   = lychee.import('lychee.codec.BITON');
	var _JSON    = lychee.import('lychee.codec.JSON');
	var _Tunnel  = lychee.import('lychee.net.Tunnel');



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		var settings = Object.assign({}, data);


		_Tunnel.call(this, settings);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = _Tunnel.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.Remote';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		send: function(data, headers) {

			headers = headers instanceof Object ? headers : {};


			if (data instanceof Object) {

				headers['access-control-allow-origin'] = '*';
				headers['content-control']             = 'no-transform';


				var codec = this.codec;
				if (codec === _BENCODE) {
					headers['content-type'] = 'application/bencode; charset=utf-8';
				} else if (codec === _BITON) {
					headers['content-type'] = 'application/biton; charset=binary';
				} else if (codec === _JSON) {
					headers['content-type'] = 'application/json; charset=utf-8';
				}


				var event = headers['event'] || null;
				if (event === 'error') {
					headers['status'] = '400 Bad Request';
				}


				if (/@plug|@unplug/g.test(headers.method) === false) {
					return _Tunnel.prototype.send.call(this, data, headers);
				}

			} else {

				var payload = null;

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

