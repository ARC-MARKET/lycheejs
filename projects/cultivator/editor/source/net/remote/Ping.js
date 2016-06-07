
lychee.define('app.net.remote.Ping').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _on_ping = function(data) {

		if (this.tunnel !== null) {

			this.tunnel.send({
				ping: data.ping,
				pong: Date.now()
			}, {
				id:    this.id,
				event: 'pong'
			});

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(remote) {

		lychee.net.Service.call(this, 'ping', remote, lychee.net.Service.TYPE.remote);


		this.bind('ping', _on_ping, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.net.Service.prototype.serialize.call(this);
			data['constructor'] = 'app.net.remote.Ping';
			data['arguments']   = [ null ];


			return data;

		}

	};


	return Class;

});

