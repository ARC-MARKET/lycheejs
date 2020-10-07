
lychee.define('harvester.net.service.Library').requires([
	'harvester.mod.Server'
]).includes([
	'lychee.net.Service'
]).exports((lychee, global, attachments) => {

	const _Service = lychee.import('lychee.net.Service');
	const _Server  = lychee.import('harvester.mod.Server');
	const _CACHE   = {};



	/*
	 * HELPERS
	 */

	const _serialize = function(library) {

		let filesystem = null;
		let server     = null;
		let web        = false;

		if (library.filesystem !== null) {

			filesystem = library.filesystem.root;

			let check = library.filesystem.info('/index.html');
			if (check !== null && check.type === 'file') {
				web = true;
			}

		}

		if (library.server !== null) {

			server = {
				host: library.server.host,
				port: library.server.port
			};

		}


		return {
			identifier: library.identifier,
			details:    library.details || null,
			filesystem: filesystem,
			server:     server,
			harvester:  library.harvester,
			web:        web
		};

	};

	const _on_start = function(data) {

		let identifier = data.identifier || null;
		let main       = global.MAIN     || null;

		if (identifier !== null && main !== null) {

			let library = main._libraries[identifier] || null;
			if (library !== null && library.server === null) {

				_Server.process(library);

				this.accept('Server started ("' + identifier + '")');

			} else {

				this.reject('No server ("' + identifier + '")');

			}

		} else {

			this.reject('No Identifier');

		}

	};

	const _on_stop = function(data) {

		let identifier = data.identifier || null;
		let main       = global.MAIN     || null;

		if (identifier !== null && main !== null) {

			let library = main._libraries[identifier] || null;
			if (library !== null && library.server !== null) {

				library.server.destroy();
				library.server = null;

				this.accept('Server stopped ("' + identifier + '")');

			} else {

				this.reject('No Server ("' + identifier + '")');

			}

		} else {

			this.reject('No Identifier');

		}

	};

	const _on_sync = function(data) {

		if (data instanceof Array) {

			data.forEach(object => {
				_CACHE[object.identifier] = object;
			});

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

		this.bind('sync', _on_sync, this);



		/*
		 * INITIALIZATION: REMOTE
		 */

		this.bind('start', _on_start, this);
		this.bind('stop',  _on_stop,  this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.service.Library';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		index: function() {

			let main = global.MAIN || null;
			if (main !== null) {

				return this.send(Object.values(main._libraries).map(_serialize), {
					event: 'sync'
				});

			}


			return false;

		},

		sync: function() {

			let tunnel = this.tunnel;
			if (tunnel !== null) {

				if (tunnel.type === 'client') {

					return this.send({}, {
						method: 'index'
					});

				} else if (tunnel.type === 'remote') {

					return this.index();

				}

			}


			return false;

		}

	};


	return Composite;

});

