
lychee.define('lychee.net.remote.Debugger').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Service = lychee.import('lychee.net.Service');
	const _TUNNELS = [];



	/*
	 * HELPERS
	 */

	const _bind_console = function(event) {

		this.bind(event, function(data) {

			if (this.tunnel !== null) {

				let receiver = data.tid || null;
				if (receiver !== null) {

					let tunnel = _TUNNELS.find(function(client) {
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

	const _bind_relay = function(event) {

		this.bind(event, function(data) {

			let sender   = null;
			let receiver = data.tid || null;

			if (this.tunnel !== null) {
				sender = this.tunnel.host + ':' + this.tunnel.port;
			}


			if (sender !== null && receiver !== null) {

				let tunnel = _TUNNELS.find(function(client) {
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

	let Composite = function(remote) {

		_Service.call(this, 'debugger', remote, _Service.TYPE.remote);



		/*
		 * INITIALIZATION
		 */

		this.bind('plug', function() {

			_TUNNELS.push(this.tunnel);

		}, this);

		this.bind('unplug', function() {

			let index = _TUNNELS.indexOf(this.tunnel);
			if (index !== -1) {
				_TUNNELS.splice(index, 1);
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

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'lychee.net.remote.Debugger';
			data['arguments']   = [];


			return data;

		}

	};


	return Composite;

});

