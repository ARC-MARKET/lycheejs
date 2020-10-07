
lychee.define('lychee.net.service.Storage').includes([
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
			data['constructor'] = 'lychee.net.service.Storage';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		sync: function(objects) {

			objects = objects instanceof Array ? objects : null;


			if (objects !== null) {

				return this.send({
					timestamp: Date.now(),
					objects:   objects
				}, {
					event: 'sync'
				});

			}


			return false;

		}

	};


	return Composite;

});

