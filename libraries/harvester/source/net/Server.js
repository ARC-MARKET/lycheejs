
lychee.define('harvester.net.Server').requires([
	'harvester.net.Remote',
	'harvester.net.server.File',
	'harvester.net.server.Redirect'
]).includes([
	'lychee.net.Server'
]).exports(function(lychee, global, attachments) {

	var _CODEC    = {
		encode: function(data) { return data; },
		decode: function(data) { return data; }
	};
	var _File     = lychee.import('harvester.net.server.File');
	var _Redirect = lychee.import('harvester.net.server.Redirect');
	var _Remote   = lychee.import('harvester.net.Remote');
	var _Server   = lychee.import('lychee.net.Server');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({
			codec:  _CODEC,
			remote: _Remote,
			type:   _Server.TYPE.HTTP
		}, data);


		_Server.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function(remote) {

			remote.bind('receive', function(payload, headers) {

				var method = headers['method'];
				if (method === 'OPTIONS') {

					this.send({}, {
						'status':                       '200 OK',
						'access-control-allow-headers': 'Content-Type',
						'access-control-allow-origin':  'http://localhost',
						'access-control-allow-methods': 'GET, POST',
						'access-control-max-age':       '3600'
					});

				} else {

					var redirect = _Redirect.receive.call({ tunnel: this }, payload, headers);
					if (redirect === false) {

						var file = _File.receive.call({ tunnel: this }, payload, headers);
						if (file === false) {

							this.send('File not found.', {
								'status':       '404 Not Found',
								'content-type': 'text/plain; charset=utf-8'
							});

						}

					}

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

