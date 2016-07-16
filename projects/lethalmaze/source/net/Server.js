
lychee.define('game.net.Server').requires([
	'game.net.remote.Control'
]).includes([
	'lychee.net.Server'
]).exports(function(lychee, global, attachments) {

	var _Control = lychee.import('game.net.remote.Control');
	var _Server  = lychee.import('lychee.net.Server');



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		var settings = Object.assign({
		}, data);


		_Server.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function(remote) {

			console.log('game.net.Server: Remote connected (' + remote.host + ':' + remote.port + ')');

			remote.addService(new _Control(remote));

		}, this);

		this.bind('disconnect', function(remote) {

			console.log('game.net.Server: Remote disconnected (' + remote.host + ':' + remote.port + ')');

		}, this);


		this.connect();

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Server.prototype.serialize.call(this);
			data['constructor'] = 'game.net.Server';


			return data;

		}

	};


	return Composite;

});

