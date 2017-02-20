
lychee.define('app.net.Server').requires([
]).includes([
	'lychee.net.Server'
]).exports(function(lychee, global, attachments) {

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

		serialize: function() {

			let data = _Server.prototype.serialize.call(this);
			data['constructor'] = 'app.net.Server';


			return data;

		}

	};


	return Composite;

});

