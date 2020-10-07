
lychee.define('game.net.Server').requires([
	'game.net.service.Control'
]).includes([
	'lychee.net.Server'
]).exports((lychee, global, attachments) => {

	const _Control = lychee.import('game.net.service.Control');
	const _Server  = lychee.import('lychee.net.Server');



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

			remote.addService(new _Control({
				id: 'control',
				tunnel: remote
			}));

			console.log('game.net.Server: Remote connected (' + remote.id + ')');

		}, this);

		this.bind('disconnect', remote => {
			console.log('game.net.Server: Remote disconnected (' + remote.id + ')');
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
			data['constructor'] = 'game.net.Server';


			return data;

		}

	};


	return Composite;

});

