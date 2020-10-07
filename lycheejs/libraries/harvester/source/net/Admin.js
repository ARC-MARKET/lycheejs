
lychee.define('harvester.net.Admin').requires([
	'harvester.net.Remote',
	'harvester.net.service.Console',
	'harvester.net.service.Harvester',
	'harvester.net.service.Library',
	'harvester.net.service.Profile',
	'harvester.net.service.Project',
	'harvester.net.service.Server',
	'lychee.codec.JSON'
]).includes([
	'lychee.net.Server'
]).exports((lychee, global, attachments) => {

	const _service = lychee.import('harvester.net.service');
	const _Remote  = lychee.import('harvester.net.Remote');
	const _Server  = lychee.import('lychee.net.Server');
	const _JSON    = lychee.import('lychee.codec.JSON');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({
			codec:    _JSON,
			host:     'localhost',
			port:     4848,
			protocol: _Server.PROTOCOL.HTTP,
			remote:   _Remote
		}, data);


		_Server.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', remote => {

			remote.addService(new _service.Console({
				id: 'console',
				tunnel: remote
			}));

			remote.addService(new _service.Harvester({
				id: 'harvester',
				tunnel: remote
			}));

			remote.addService(new _service.Library({
				id: 'library',
				tunnel: remote
			}));

			remote.addService(new _service.Profile({
				id: 'profile',
				tunnel: remote
			}));

			remote.addService(new _service.Project({
				id: 'project',
				tunnel: remote
			}));

			remote.addService(new _service.Server({
				id: 'server',
				tunnel: remote
			}));


			remote.bind('receive', (payload, headers) => {

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
