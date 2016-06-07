
lychee.define('app.net.Server').requires([
	'app.net.remote.Ping'
]).includes([
	'lychee.net.Server'
]).exports(function(lychee, global, attachments) {

	var _Ping   = lychee.import('app.net.remote.Ping');
	var _Server = lychee.import('lychee.net.Server');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({
		}, data);


		_Server.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function(remote) {

			console.log('app.net.Server: Remote connected (' + remote.host + ':' + remote.port + ')');

			remote.addService(new _Ping(remote));

		}, this);

		this.bind('disconnect', function(remote) {

			console.log('app.net.Server: Remote disconnected (' + remote.host + ':' + remote.port + ')');

		}, this);


		this.connect();

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = _Server.prototype.serialize.call(this);
			data['constructor'] = 'app.net.Server';


			return data;

		}

	};


	return Class;

});

