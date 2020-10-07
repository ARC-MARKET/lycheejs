
lychee.define('lychee.net.Client').requires([
	'lychee.net.service.Debugger',
	'lychee.net.service.Stash',
	'lychee.net.service.Storage'
]).includes([
	'lychee.net.Tunnel'
]).exports((lychee, global, attachments) => {

	const _Debugger = lychee.import('lychee.net.service.Debugger');
	const _Stash    = lychee.import('lychee.net.service.Stash');
	const _Storage  = lychee.import('lychee.net.service.Storage');
	const _Tunnel   = lychee.import('lychee.net.Tunnel');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		states.type = 'client';

		_Tunnel.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		if (lychee.debug === true) {

			this.bind('connect', function() {

				this.addService(new _Debugger({
					id: 'debugger',
					tunnel: this
				}));

			}, this);

		}


		this.bind('connect', function() {

			this.addService(new _Stash({
				id: 'stash',
				tunnel: this
			}));

			this.addService(new _Storage({
				id: 'storage',
				tunnel: this
			}));

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

