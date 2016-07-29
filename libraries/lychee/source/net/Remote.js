
lychee.define('lychee.net.Remote').requires([
	'lychee.net.remote.Debugger',
	'lychee.net.remote.Stash',
	'lychee.net.remote.Storage'
]).includes([
	'lychee.net.Tunnel'
]).exports(function(lychee, global, attachments) {

	const _Debugger = lychee.import('lychee.net.remote.Debugger');
	const _Stash    = lychee.import('lychee.net.remote.Stash');
	const _Storage  = lychee.import('lychee.net.remote.Storage');
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
			data['constructor'] = 'lychee.net.Remote';


			return data;

		}

	};


	return Composite;

});

