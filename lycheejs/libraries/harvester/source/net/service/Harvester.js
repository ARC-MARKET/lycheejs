
lychee.define('harvester.net.service.Harvester').requires([
	'lychee.Storage'
]).includes([
	'lychee.net.Service'
]).exports((lychee, global, attachments) => {

	const _Service = lychee.import('lychee.net.Service');
	const _Storage = lychee.import('lychee.Storage');
	let   _ID      = null;
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
			id:        _ID || null,
			networks:  harvester.getNetworks(),
			libraries: Object.keys(harvester._libraries),
			projects:  Object.keys(harvester._projects)
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


			this.send({
				id: id
			}, {
				event: 'handshake'
			});

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

	const _on_handshake = function(data) {

		if (typeof data.id === 'string') {
			_ID = data.id;
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		_Service.call(this, states);

		states = null;



		/*
		 * INITIALIZATION: CLIENT
		 */

		this.bind('handshake', _on_handshake, this);



		/*
		 * INITIALIZATION: REMOTE
		 */

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
			data['constructor'] = 'harvester.net.service.Harvester';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		connect: function() {

			let main = global.MAIN || null;
			if (main !== null) {

				return this.send(_serialize(main), {
					event: 'connect'
				});

			}


			return false;

		},

		disconnect: function() {

			let main = global.MAIN || null;
			if (main !== null) {

				return this.send({
					id: _ID
				}, {
					event: 'disconnect'
				});

			}


			return false;

		},

		index: function() {

			return this.send(_storage.filter(_ => true), {
				event: 'sync'
			});

		},

		sync: function() {
			return this.index();
		}

	};


	return Composite;

});

