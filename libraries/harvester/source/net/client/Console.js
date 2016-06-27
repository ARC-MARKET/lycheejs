
lychee.define('harvester.net.client.Console').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	var _CACHE   = null;
	var _Service = lychee.import('lychee.net.Service');



	/*
	 * HELPERS
	 */

	var _on_sync = function(data) {

		if (data instanceof Object) {
			_CACHE = data;
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(client) {

		_Service.call(this, 'console', client, _Service.TYPE.client);


		this.bind('sync', _on_sync, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.client.Console';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		sync: function(data) {

			var tunnel = this.tunnel;
			if (tunnel !== null) {

				tunnel.send({}, {
					id:     this.id,
					method: 'index'
				});

			}

		}

	};


	return Class;

});

