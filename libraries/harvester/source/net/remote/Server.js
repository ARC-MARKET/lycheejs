
lychee.define('harvester.net.remote.Server').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	var _MAIN    = null;
	var _Service = lychee.import('lychee.net.Service');



	/*
	 * HELPERS
	 */

	var _serialize_remotes = function(project) {

		var remotes = [];

		var info = project.filesystem.info('/lychee.store');
		if (info !== null) {

			var database = JSON.parse(project.filesystem.read('/lychee.store'));
			if (database instanceof Object) {

				if (database['server'] instanceof Object) {

					if (database['server']['@objects'] instanceof Array) {

						remotes.push.apply(remotes, database['server']['@objects'].map(function(remote) {

							return {
								id:   remote.host + ':' + remote.port,
								host: remote.host,
								port: remote.port
							};

						}));

					}

				}

			}

		}

		return remotes;

	};

	var _serialize = function(project) {

		var remotes     = _serialize_remotes(project);
		var server_host = null;
		var server_port = null;

		if (project.server !== null) {
			server_host = project.server.host;
			server_port = project.server.port;
		}


		if (server_host === null) {
			server_host = _MAIN.server.host;
		}

		if (server_host === null) {
			server_host = 'localhost';
		}


		return {
			identifier: project.identifier,
			host:       server_host,
			port:       server_port,
			remotes:    remotes
		};

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(remote) {

		_Service.call(this, 'server', remote, _Service.TYPE.remote);


		_MAIN = lychee.import('MAIN');

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.remote.Server';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		index: function(data) {

			var tunnel = this.tunnel;

			if (tunnel !== null && _MAIN !== null) {

				var projects = Object.values(_MAIN._projects).filter(function(project) {
					return /cultivator/g.test(project.identifier) === false;
				}).map(_serialize);


				tunnel.send(projects, {
					id:    this.id,
					event: 'sync'
				});

			}

		},

		connect: function(data) {

			var identifier = data.identifier || null;
			var tunnel     = this.tunnel;

			if (tunnel !== null && identifier !== null && _MAIN !== null) {

				var project = _MAIN._projects[identifier] || null;
				if (project !== null) {

					tunnel.send(_serialize(project), {
						id:    this.id,
						event: 'connect'
					});

				} else {

					this.report('FAILURE: No server ("' + identifier + '")');

				}

			} else {

				this.report('FAILURE: No identifier');

			}

		}

	};


	return Class;

});

