
lychee.define('lychee.net.remote.Debugger').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	var _tunnels = [];



	/*
	 * HELPERS
	 */

	var _bind_console = function(event) {

		this.bind(event, function(data) {

			if (this.tunnel !== null) {

				var receiver = data.tid || null;
				if (receiver !== null) {

					var tunnel = _tunnels.find(function(client) {
						return (client.host + ':' + client.port) === receiver;
					}) || null;

					if (tunnel !== null) {

						tunnel.send(data, {
							id:    'debugger',
							event: 'console'
						});

					}

				}

			}

		}, this);

	};

	var _bind_relay = function(event) {

		this.bind(event, function(data) {

			var sender   = null;
			var receiver = data.tid || null;

			if (this.tunnel !== null) {
				sender = this.tunnel.host + ':' + this.tunnel.port;
			}


			if (sender !== null && receiver !== null) {

				var tunnel = _tunnels.find(function(client) {
					return (client.host + ':' + client.port) === receiver;
				}) || null;

				if (tunnel !== null) {

					data.receiver = sender;

					tunnel.send(data, {
						id:    'debugger',
						event: event
					});

				}

			}

		}, this);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(remote) {

		lychee.net.Service.call(this, 'debugger', remote, lychee.net.Service.TYPE.remote);



		/*
		 * INITIALIZATION
		 */

		this.bind('plug', function() {

			_tunnels.push(this.tunnel);

		}, this);

		this.bind('unplug', function() {

			var index = _tunnels.indexOf(this.tunnel);
			if (index !== -1) {
				_tunnels.splice(index, 1);
			}

		}, this);


		// Relay events to proper tunnel (data.tid)
		_bind_relay.call(this, 'define');
		_bind_relay.call(this, 'execute');
		_bind_relay.call(this, 'expose');
		_bind_relay.call(this, 'serialize');

		// Relay events to proper tunnel (data.receiver > data.tid)
		_bind_console.call(this, 'define-value');
		_bind_console.call(this, 'execute-value');
		_bind_console.call(this, 'expose-value');
		_bind_console.call(this, 'serialize-value');

	};


	Composite.prototype = {

	};


	return Composite;

});

