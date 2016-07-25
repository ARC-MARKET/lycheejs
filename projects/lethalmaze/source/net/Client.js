
lychee.define('game.net.Client').requires([
	'game.net.client.Control'
]).includes([
	'lychee.net.Client'
]).exports(function(lychee, global, attachments) {

	var _Client  = lychee.import('lychee.net.Client');
	var _Control = lychee.import('game.net.client.Control');



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data, main) {

		var settings = Object.assign({
			reconnect: 10000
		}, data);


		_Client.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function() {

			this.addService(new _Control(this));

			if (lychee.debug === true) {
				console.log('game.net.Client: Remote connected');
			}

		}, this);

		this.bind('disconnect', function(code) {

			if (lychee.debug === true) {
				console.log('game.net.Client: Remote disconnected (' + code + ')');
			}

		}, this);

		this.bind('receive', function(data) {

			var service = this.getService('control');
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

		serialize: function() {

			var data = _Client.prototype.serialize.call(this);
			data['constructor'] = 'game.net.Client';


			return data;

		}

	};


	return Composite;

});

