
lychee.define('harvester.net.client.Harvester').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Service = lychee.import('lychee.net.Service');
	let   _ID      = null;



	/*
	 * HELPERS
	 */

	const _on_id = function(data) {

		if (typeof data.id === 'string') {
			_ID = data.id;
		}

	};

	const _serialize = function(harvester) {

		return {
			id:        _ID || null,
			networks:  harvester.getNetworks(),
			libraries: Object.keys(harvester._libraries),
			projects:  Object.keys(harvester._projects)
		};

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(client) {

		_Service.call(this, 'harvester', client, _Service.TYPE.client);

		this.bind('id', _on_id, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.client.Harvester';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		connect: function() {

			let main   = global.MAIN || null;
			let tunnel = this.tunnel;

			if (main !== null && tunnel !== null) {

				tunnel.send(_serialize(main), {
					id:    this.id,
					event: 'connect'
				});

			}

		},

		disconnect: function() {

			let main   = global.MAIN || null;
			let tunnel = this.tunnel;

			if (main !== null && tunnel !== null) {

				tunnel.send({
					id: _ID
				}, {
					id:    this.id,
					event: 'disconnect'
				});

			}

		}

	};


	return Composite;

});

