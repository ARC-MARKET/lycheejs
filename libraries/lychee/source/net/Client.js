
lychee.define('lychee.net.Client').requires([
	'lychee.net.client.Debugger',
	'lychee.net.client.Stash',
	'lychee.net.client.Storage'
]).includes([
	'lychee.net.Tunnel'
]).exports(function(lychee, global, attachments) {

	const _Debugger = lychee.import('lychee.net.client.Debugger');
	const _Stash    = lychee.import('lychee.net.client.Stash');
	const _Storage  = lychee.import('lychee.net.client.Storage');
	const _Tunnel   = lychee.import('lychee.net.Tunnel');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		_Tunnel.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		if (lychee.debug === true) {

			this.bind('connect', function() {
				this.addService(new _Debugger(this));
			}, this);

		}


		this.bind('connect', function() {

			this.addService(new _Stash(this));
			this.addService(new _Storage(this));

		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Tunnel.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.Client';


			return data;

		}

	};


	return Composite;

});

