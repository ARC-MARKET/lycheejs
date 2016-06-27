
lychee.define('lychee.net.Client').requires([
	'lychee.net.client.Debugger',
	'lychee.net.client.Stash',
	'lychee.net.client.Storage'
]).includes([
	'lychee.net.Tunnel'
]).exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		lychee.net.Tunnel.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		if (lychee.debug === true) {

			this.bind('connect', function() {
				this.addService(new lychee.net.client.Debugger(this));
			}, this);

		}


		this.bind('connect', function() {

			this.addService(new lychee.net.client.Stash(this));
			this.addService(new lychee.net.client.Storage(this));

		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.net.Tunnel.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.Client';


			return data;

		}

	};


	return Class;

});

