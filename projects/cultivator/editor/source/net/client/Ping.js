
lychee.define('app.net.client.Ping').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _on_pong = function(data) {

		data.pung = Date.now();

		var ping = (data.pong - data.ping).toFixed(0);
		var pong = (data.pung - data.pong).toFixed(0);


		this.trigger('statistics', [ ping, pong ]);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(client) {

		lychee.net.Service.call(this, 'ping', client, lychee.net.Service.TYPE.client);


		this.bind('pong', _on_pong, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.net.Service.prototype.serialize.call(this);
			data['constructor'] = 'app.net.client.Ping';
			data['arguments']   = [ '#MAIN.client' ];


			return data;

		},



		/*
		 * CUSTOM API
		 */

		ping: function() {

			if (this.tunnel !== null) {

				this.tunnel.send({
					ping: Date.now()
				}, {
					id:    this.id,
					event: 'ping'
				});

				return true;

			}


			return false;

		}

	};


	return Class;

});

