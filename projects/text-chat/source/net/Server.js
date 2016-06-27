
lychee.define('app.net.Server').requires([
	'lychee.net.remote.Chat'
]).includes([
	'lychee.net.Server'
]).exports(function(lychee, global, attachments) {

	var _Chat   = lychee.import('lychee.net.remote.Chat');
	var _Server = lychee.import('lychee.net.Server');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({
		}, data);


		_Server.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function(remote) {

			remote.addService(new _Chat('chat', remote, {
				limit: 64
			}));

			console.log('app.net.Server: Remote connected (' + remote.host + ':' + remote.port + ')');

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

