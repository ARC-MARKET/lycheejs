
lychee.define('harvester.net.service.Console').includes([
	'lychee.net.Service'
]).exports((lychee, global, attachments) => {

	const _Service = lychee.import('lychee.net.Service');
	const _CACHE   = {};



	/*
	 * HELPERS
	 */

	const _on_sync = function(data) {

		if (data instanceof Object) {

			for (let prop in data) {
				_CACHE[prop] = data[prop];
			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		_Service.call(this, states);

		states = null;



		/*
		 * INITIALIZATION: CLIENT
		 */

		this.bind('sync', _on_sync, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.service.Console';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		index: function() {

			return this.send(lychee.serialize(console), {
				event: 'sync'
			});

		},

		sync: function() {

			let tunnel = this.tunnel;
			if (tunnel !== null) {

				if (tunnel.type === 'client') {

					return this.send({}, {
						method: 'index'
					});

				} else if (tunnel.type === 'remote') {

					return this.index();

				}

			}


			return false;

		}

	};


	return Composite;

});

