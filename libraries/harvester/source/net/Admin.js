
lychee.define('harvester.net.Admin').requires([
	'harvester.net.Remote',
	'harvester.net.remote.Console',
	'harvester.net.remote.Harvester',
	'harvester.net.remote.Library',
	'harvester.net.remote.Profile',
	'harvester.net.remote.Project',
	'harvester.net.remote.Server',
	'lychee.codec.JSON'
]).includes([
	'lychee.net.Server'
]).exports(function(lychee, global, attachments) {

	const _remote = lychee.import('harvester.net.remote');
	const _Remote = lychee.import('harvester.net.Remote');
	const _Server = lychee.import('lychee.net.Server');
	const _JSON   = lychee.import('lychee.codec.JSON');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({
			host:   'localhost',
			port:   4848,
			codec:  _JSON,
			remote: _Remote,
			type:   _Server.TYPE.HTTP
		}, data);


		_Server.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function(remote) {

			remote.addService(new _remote.Console(remote));
			remote.addService(new _remote.Harvester(remote));
			remote.addService(new _remote.Library(remote));
			remote.addService(new _remote.Profile(remote));
			remote.addService(new _remote.Project(remote));
			remote.addService(new _remote.Server(remote));


			remote.bind('receive', function(payload, headers) {

				let method = headers['method'];
				if (method === 'OPTIONS') {

					remote.send({}, {
						'status':                       '200 OK',
						'access-control-allow-headers': 'Content-Type, X-Service-Id, X-Service-Method, X-Service-Event',
						'access-control-allow-origin':  '*',
						'access-control-allow-methods': 'GET, POST',
						'access-control-max-age':       '3600'
					});

				} else {

					remote.send({
						'message': 'Please go away. 凸(｀⌒´メ)凸'
					}, {
						'status': '404 Not Found'
					});

				}

			});

		}, this);


		this.connect();

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Server.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.Admin';


			return data;

		}

	};


	return Composite;

});

