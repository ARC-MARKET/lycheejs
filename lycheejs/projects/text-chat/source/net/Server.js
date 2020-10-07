
lychee.define('app.net.Server').requires([
	'lychee.net.service.Chat'
]).includes([
	'lychee.net.Server'
]).exports((lychee, global, attachments) => {

	const _Chat   = lychee.import('lychee.net.service.Chat');
	const _Server = lychee.import('lychee.net.Server');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		_Server.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', remote => {

			remote.addService(new _Chat({
				id:     'chat',
				limit:  64,
				tunnel: remote
			}));

			console.log('app.net.Server: Remote connected (' + remote.id + ')');

		}, this);

		this.bind('disconnect', remote => {
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

