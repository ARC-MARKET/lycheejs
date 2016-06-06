
lychee.define('harvester.net.Client').requires([
	'harvester.net.client.Library',
	'harvester.net.client.Profile',
	'harvester.net.client.Project',
	'lychee.codec.JSON'
]).includes([
	'lychee.net.Client'
]).exports(function(lychee, global, attachments) {

	var _JSON   = lychee.import('lychee.codec.JSON');
	var _Client = lychee.import('lychee.net.Client');
	var _remote = lychee.import('harvester.net.remote');



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


		_Client.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function() {

			this.addService(new _remote.Library(this));
			this.addService(new _remote.Profile(this));
			this.addService(new _remote.Project(this));


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

			var data = _Client.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.Client';


			return data;

		}

	};


	return Class;

});

