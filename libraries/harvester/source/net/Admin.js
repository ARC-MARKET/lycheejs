
lychee.define('harvester.net.Admin').requires([
	'harvester.net.Remote',
	'harvester.net.remote.Library',
	'harvester.net.remote.Project',
	'harvester.net.remote.Server',
	'lychee.codec.JSON'
]).includes([
	'lychee.net.Server'
]).exports(function(lychee, global, attachments) {

	var _JSON   = lychee.import('lychee.codec.JSON');
	var _Remote = lychee.import('harvester.net.Remote');
	var _Server = lychee.import('lychee.net.Server');
	var _remote = lychee.import('harvester.net.remote');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({
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

			remote.addService(new _remote.Library(remote));
			remote.addService(new _remote.Project(remote));
			remote.addService(new _remote.Server(remote));


			remote.bind('receive', function(payload, headers) {

				var method = headers['method'];
				if (method === 'OPTIONS') {

					remote.send({}, {
						'status':                       '200 OK',
						'access-control-allow-headers': 'Content-Type',
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


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = _Server.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.Server';


			return data;

		}

	};


	return Class;

});

