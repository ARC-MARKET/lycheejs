
lychee.define('harvester.net.Client').requires([
	'harvester.net.service.Console',
	'harvester.net.service.Harvester',
	'harvester.net.service.Library',
	'harvester.net.service.Profile',
	'harvester.net.service.Project',
	'harvester.net.service.Server',
	'lychee.codec.BENCODE',
	'lychee.codec.BITON',
	'lychee.codec.JSON',
	'lychee.net.Client'
]).includes([
	'lychee.net.Tunnel'
]).exports((lychee, global, attachments) => {

	const _Client  = lychee.import('lychee.net.Client');
	const _Tunnel  = lychee.import('lychee.net.Tunnel');
	const _BENCODE = lychee.import('lychee.codec.BENCODE');
	const _BITON   = lychee.import('lychee.codec.BITON');
	const _JSON    = lychee.import('lychee.codec.JSON');
	const _service = lychee.import('harvester.net.service');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({
			codec:     _JSON,
			host:      'localhost',
			port:      4848,
			protocol:  _Tunnel.PROTOCOL.HTTP,
			reconnect: 10000
		}, data);


		states.type = 'client';

		_Tunnel.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function() {

			this.addService(new _service.Console({
				id: 'console',
				tunnel: this
			}));

			this.addService(new _service.Harvester({
				id: 'harvester',
				tunnel: this
			}));

			this.addService(new _service.Library({
				id: 'library',
				tunnel: this
			}));

			this.addService(new _service.Profile({
				id: 'profile',
				tunnel: this
			}));

			this.addService(new _service.Project({
				id: 'project',
				tunnel: this
			}));

			this.addService(new _service.Server({
				id: 'server',
				tunnel: this
			}));


			if (lychee.debug === true) {
				console.log('harvester.net.Client: Remote connected');
			}

		}, this);

		this.bind('disconnect', code => {

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

			// XXX: data can be Object, Buffer or String

			data    = data !== undefined        ? data    : null;
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

					let result = _Tunnel.prototype.send.call(this, data, headers);
					if (result === true) {
						return true;
					}

				}

			} else {

				let payload = null;

				if (typeof data === 'string') {
					payload = Buffer.from(data, 'utf8');
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

