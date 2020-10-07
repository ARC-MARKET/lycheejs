
lychee.define('app.net.service.Ping').includes([
	'lychee.net.Service'
]).exports((lychee, global, attachments) => {

	const _Service = lychee.import('lychee.net.Service');



	/*
	 * HELPERS
	 */

	const _on_ping = function(data) {

		let tunnel = this.tunnel;
		if (tunnel !== null && tunnel.type === 'remote') {

			this.send({
				ping: data.ping,
				pong: Date.now()
			}, {
				event: 'pong'
			});

		}

	};

	const _on_pong = function(data) {

		let tunnel = this.tunnel;
		if (tunnel !== null && tunnel.type === 'client') {

			data.pung = Date.now();

			let ping = (data.pong - data.ping).toFixed(0);
			let pong = (data.pung - data.pong).toFixed(0);

			this.trigger('statistics', [ ping, pong ]);

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		_Service.call(this, states);

		states = null;



		/*
		 * INITIALIZATION: CLIENT
		 */

		this.bind('pong', _on_pong, this);

		/*
		 * INITIALIZATION: REMOTE
		 */

		this.bind('ping', _on_ping, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'app.net.service.Ping';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		ping: function() {

			return this.send({
				ping: Date.now()
			}, {
				event: 'ping'
			});

		}

	};


	return Composite;

});

