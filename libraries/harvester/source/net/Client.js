
lychee.define('harvester.net.Client').requires([
	'harvester.net.client.Console',
	'harvester.net.client.Harvester',
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

	const _client  = lychee.import('harvester.net.client');
	const _Client  = lychee.import('lychee.net.Client');
	const _Tunnel  = lychee.import('lychee.net.Tunnel');
	const _BENCODE = lychee.import('lychee.codec.BENCODE');
	const _BITON   = lychee.import('lychee.codec.BITON');
	const _JSON    = lychee.import('lychee.codec.JSON');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({
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

			this.addService(new _client.Console(this));
			this.addService(new _client.Harvester(this));
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


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Tunnel.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.Client';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		send: function(data, headers) {

			headers = headers instanceof Object ? headers : {};


			if (data instanceof Object) {

				let codec = this.codec;
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

