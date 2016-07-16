
lychee.define('harvester.net.remote.Library').requires([
	'harvester.mod.Server'
]).includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	var _CACHE   = {};
	var _MAIN    = null;
	var _Service = lychee.import('lychee.net.Service');
	var _Server  = lychee.import('harvester.mod.Server');



	/*
	 * HELPERS
	 */

	var _serialize = function(library) {

		var filesystem = null;
		var server     = null;

		if (library.filesystem !== null) {
			filesystem = library.filesystem.root;
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
			harvester:  library.harvester
		};

	};


	var _on_start = function(data) {

		var identifier = data.identifier || null;
		if (identifier !== null && _MAIN !== null) {

			var library = _MAIN._libraries[identifier] || null;
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

	var _on_stop = function(data) {

		var identifier = data.identifier || null;
		if (identifier !== null && _MAIN !== null) {

			var library = _MAIN._libraries[identifier] || null;
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



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(remote) {

		_Service.call(this, 'library', remote, _Service.TYPE.remote);


		_MAIN = lychee.import('MAIN');


		this.bind('start', _on_start, this);
		this.bind('stop',  _on_stop,  this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.remote.Library';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		index: function(data) {

			var tunnel = this.tunnel;
			if (tunnel !== null && _MAIN !== null) {

				var libraries = Object.values(_MAIN._libraries).filter(function(library) {
					return /cultivator/g.test(library.identifier) === false;
				}).map(_serialize);


				tunnel.send(libraries, {
					id:    this.id,
					event: 'sync'
				});

			}

		}

	};


	return Composite;

});

