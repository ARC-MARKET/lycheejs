
lychee.define('game.net.Client').requires([
	'game.net.service.Control'
]).includes([
	'lychee.net.Client'
]).exports((lychee, global, attachments) => {

	const _Client  = lychee.import('lychee.net.Client');
	const _Control = lychee.import('game.net.service.Control');



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

			this.addService(new _Control({
				id: 'control',
				tunnel: this
			}));

			if (lychee.debug === true) {
				console.log('game.net.Client: Remote connected');
			}

		}, this);

		this.bind('disconnect', code => {

			if (lychee.debug === true) {
				console.log('game.net.Client: Remote disconnected (' + code + ')');
			}

		}, this);

		this.bind('receive', function(data) {

			let service = this.getService('control');
			if (service !== null) {
				service.setSid(data.sid);
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
			data['constructor'] = 'game.net.Client';


			return data;

		}

	};


	return Composite;

});

