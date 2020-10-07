
lychee.define('lychee.net.service.Stash').includes([
	'lychee.net.Service'
]).exports((lychee, global, attachments) => {

	const _Service = lychee.import('lychee.net.Service');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		_Service.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('sync', function(data) {

			let tunnel = this.tunnel;
			if (tunnel !== null && tunnel.type === 'remote') {

				this.broadcast(data, {
					event: 'sync'
				});

			}

		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.service.Stash';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		sync: function(assets) {

			assets = assets instanceof Object ? assets : null;


			if (assets !== null) {

				let data = {};

				for (let id in assets) {
					data[id] = lychee.serialize(assets[id]);
				}


				return this.send({
					timestamp: Date.now(),
					assets:    data
				}, {
					event: 'sync'
				});

			}


			return false;

		}

	};


	return Composite;

});

