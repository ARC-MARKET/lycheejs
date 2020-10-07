
lychee.define('app.net.Client').requires([
	'lychee.net.service.Chat'
]).includes([
	'lychee.net.Client'
]).exports((lychee, global, attachments) => {

	const _Chat   = lychee.import('lychee.net.service.Chat');
	const _Client = lychee.import('lychee.net.Client');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({
			reconnect: 10000
		}, data);


		_Client.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function() {

			this.addService(new _Chat({
				id:     'chat',
				tunnel: this
			}));

			if (lychee.debug === true) {
				console.log('app.net.Client: Remote connected');
			}

		}, this);

		this.bind('disconnect', code => {

			if (lychee.debug === true) {
				console.log('app.net.Client: Remote disconnected (' + code + ')');
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

			let data = _Client.prototype.serialize.call(this);
			data['constructor'] = 'app.net.Client';


			return data;

		}

	};


	return Composite;

});

