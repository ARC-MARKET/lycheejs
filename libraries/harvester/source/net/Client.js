
lychee.define('harvester.net.Client').requires([
	'harvester.net.client.Library',
	'harvester.net.client.Profile',
	'harvester.net.client.Project',
	'lychee.codec.BENCODE',
	'lychee.codec.BITON',
	'lychee.codec.JSON',
	'lychee.net.Client'
]).includes([
	'lychee.net.Tunnel'
]).exports(function(lychee, global, attachments) {

	var _BENCODE = lychee.import('lychee.codec.BENCODE');
	var _BITON   = lychee.import('lychee.codec.BITON');
	var _JSON    = lychee.import('lychee.codec.JSON');
	var _Client  = lychee.import('lychee.net.Client');
	var _Tunnel  = lychee.import('lychee.net.Tunnel');
	var _client  = lychee.import('harvester.net.client');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({
			host:      'localhost',
			port:      4848,
			codec:     _JSON,
			type:      _Client.TYPE.HTTP,
			reconnect: 10000
		}, data);


		_Tunnel.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function() {

			this.addService(new _client.Library(this));
			this.addService(new _client.Profile(this));
			this.addService(new _client.Project(this));


			if (lychee.debug === true) {
				console.log('harvester.net.Client: Remote connected');
			}

		}, this);

		this.bind('disconnect', function(code) {

			if (lychee.debug === true) {
				console.log('harvester.net.Client: Remote disconnected (' + code + ')');
			}

		}, this);


		this.connect();

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = _Tunnel.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.Client';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		send: function(data, headers) {

			headers = headers instanceof Object ? headers : {};


			if (data instanceof Object) {

				var codec = this.codec;
				if (codec === _BENCODE) {
					headers['content-type'] = 'application/bencode; charset=utf-8';
				} else if (codec === _BITON) {
					headers['content-type'] = 'application/biton; charset=binary';
				} else if (codec === _JSON) {
					headers['content-type'] = 'application/json; charset=utf-8';
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


	return Class;

});

