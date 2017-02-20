
lychee.define('harvester.net.remote.Harvester').requires([
	'lychee.Storage'
]).includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Service = lychee.import('lychee.net.Service');
	const _Storage = lychee.import('lychee.Storage');
	const _storage = new _Storage({
		id:    'harvester',
		type:  _Storage.TYPE.persistent,
		model: {
			id:        '13371337',
			type:      'harvester',
			networks:  [ '[::ffff]:1337'         ],
			libraries: [ '/libraries/lychee'     ],
			projects:  [ '/projects/boilerplate' ]
		}
	});



	/*
	 * HELPERS
	 */

	const _generate_id = function() {
		return ((Math.random() * 0x07fffffff) | 0).toString(16);
	};

	const _serialize = function(harvester) {

		return {
			id:        harvester.id,
			type:      'harvester',
			networks:  harvester.networks  || [],
			libraries: harvester.libraries || [],
			projects:  harvester.projects  || []
		};

	};

	const _on_connect = function(data) {

		let id  = data.id || null;
		let obj = null;

		if (id !== null) {

			obj = _storage.read(id);

		} else if (id === null) {

			id     = _generate_id();
			obj    = _storage.create();
			obj.id = id;


			let tunnel = this.tunnel || null;
			if (tunnel !== null) {

				tunnel.send({
					id: id
				}, {
					id:    this.id,
					event: 'id'
				});

			}

		}


		if (id !== null && obj !== null) {

			obj.networks  = data.networks  || [];
			obj.libraries = data.libraries || [];
			obj.projects  = data.projects  || [];

			_storage.write(id, obj);

		}

	};

	const _on_disconnect = function(data) {

		let id  = data.id || null;
		let obj = _storage.read(id);
		if (obj !== null) {
			_storage.remove(id);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(remote) {

		_Service.call(this, 'harvester', remote, _Service.TYPE.remote);


		this.bind('connect',     _on_connect,    this);
		this.bind('disconnect',  _on_disconnect, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.remote.Harvester';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		index: function(data) {

			let main   = global.MAIN || null;
			let tunnel = this.tunnel;

			if (main !== null && tunnel !== null) {

				let harvesters = _storage.filter(function(harvester) {
					return true;
				});

				tunnel.send(harvesters, {
					id:    this.id,
					event: 'sync'
				});

			}

		},

		sync: function() {
			this.index();
		}

	};


	return Composite;

});

