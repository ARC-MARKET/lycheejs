
lychee.define('harvester.net.client.Profile').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	var _CACHE   = {};
	var _Service = lychee.import('lychee.net.Service');



	/*
	 * HELPERS
	 */

	var _on_sync = function(data) {

		if (data instanceof Array) {

			data.forEach(function(object) {
				_CACHE[object.identifier] = object;
			});

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(client) {

		_Service.call(this, 'profile', client, _Service.TYPE.client);


		this.bind('sync', _on_sync, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.client.Profile';


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

