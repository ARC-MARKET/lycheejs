
lychee.define('harvester.net.Server').requires([
	'harvester.net.Remote',
	'harvester.net.server.File',
	'harvester.net.server.Redirect'
]).includes([
	'lychee.net.Server'
]).exports((lychee, global, attachments) => {

	const _File     = lychee.import('harvester.net.server.File');
	const _Redirect = lychee.import('harvester.net.server.Redirect');
	const _Remote   = lychee.import('harvester.net.Remote');
	const _Server   = lychee.import('lychee.net.Server');
	const _CODEC    = {
		encode: data => data,
		decode: data => data
	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({
			codec:    _CODEC,
			protocol: _Server.PROTOCOL.HTTP,
			remote:   _Remote
		}, data);


		_Server.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', remote => {

			remote.bind('receive', function(payload, headers) {

				let method = headers['method'];
				if (method === 'OPTIONS') {

					this.send({}, {
						'status':                       '200 OK',
						'access-control-allow-headers': 'Content-Type',
						'access-control-allow-origin':  'http://localhost',
						'access-control-allow-methods': 'GET, POST',
						'access-control-max-age':       '3600'
					});

				} else {

					let redirect = _Redirect.receive.call({ tunnel: this }, payload, headers);
					if (redirect === false) {

						let file = _File.receive.call({ tunnel: this }, payload, headers);
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


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Server.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.Server';


			return data;

		}

	};


	return Composite;

});

