
lychee.define('studio.net.Client').includes([
	'lychee.net.Client'
]).exports((lychee, global, attachments) => {

	const _Client = lychee.import('lychee.net.Client');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({
			reconnect: 10000
		}, data);


		_Client.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', _ => {

			if (lychee.debug === true) {
				console.log('studio.net.Client: Remote connected');
			}

		}, this);

		this.bind('disconnect', code => {

			if (lychee.debug === true) {
				console.log('studio.net.Client: Remote disconnected (' + code + ')');
			}

		}, this);


		this.connect();

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Client.prototype.serialize.call(this);
			data['constructor'] = 'studio.net.Client';


			return data;

		}

	};


	return Composite;

});

