
lychee.define('app.net.Server').requires([
	'app.net.remote.Ping'
]).includes([
	'lychee.net.Server'
]).exports(function(lychee, global, attachments) {

	const _Ping   = lychee.import('app.net.remote.Ping');
	const _Server = lychee.import('lychee.net.Server');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({
		}, data);


		_Server.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function(remote) {

			console.log('app.net.Server: Remote connected (' + remote.id + ')');

			remote.addService(new _Ping(remote));

		}, this);

		this.bind('disconnect', function(remote) {

			console.log('app.net.Server: Remote disconnected (' + remote.id + ')');

		}, this);


		this.connect();

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Server.prototype.serialize.call(this);
			data['constructor'] = 'app.net.Server';


			return data;

		}

	};


	return Composite;

});

