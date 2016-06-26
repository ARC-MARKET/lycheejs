
lychee.define('app.net.Client').requires([
	'lychee.net.client.Chat'
]).includes([
	'lychee.net.Client'
]).exports(function(lychee, global, attachments) {

	var _Chat   = lychee.import('lychee.net.client.Chat');
	var _Client = lychee.import('lychee.net.Client');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({
			reconnect: 10000
		}, data);


		_Client.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function() {

			this.addService(new _Chat('chat', this));

			if (lychee.debug === true) {
				console.log('app.net.Client: Remote connected');
			}

		}, this);

		this.bind('disconnect', function(code) {

			if (lychee.debug === true) {
				console.log('app.net.Client: Remote disconnected (' + code + ')');
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

			var data = _Client.prototype.serialize.call(this);
			data['constructor'] = 'app.net.Client';


			return data;

		}

	};


	return Class;

});

