
lychee.define('harvester.net.remote.Project').requires([
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

	var _serialize_web = function(project) {

		var cache = _CACHE[project.identifier] || null;
		if (cache === null) {

			cache = _CACHE[project.identifier] = [];


			if (_MAIN !== null) {

				var hosts = _MAIN.getHosts();
				if (hosts.length > 0) {
					cache.push.apply(cache, hosts);
				}

			}

		}


		return cache;

	};

	var _serialize = function(project) {

		var filesystem = null;
		var server     = null;

		if (project.filesystem !== null) {
			filesystem = project.filesystem.root;
		}

		if (project.server !== null) {

			server = {
				host: project.server.host,
				port: project.server.port
			};

		}


		return {
			identifier: project.identifier,
			details:    project.details || null,
			filesystem: filesystem,
			server:     server,
			web:        _serialize_web(project),
			harvester:  project.harvester
		};

	};


	var _on_start = function(data) {

		var identifier = data.identifier || null;
		if (identifier !== null && _MAIN !== null) {

			var project = _MAIN._projects[identifier] || null;
			if (project !== null && project.server === null) {

				_Server.process(project);

				this.accept('Server started ("' + identifier + '")');

			} else {

				this.reject('No Server ("' + identifier + '")');

			}

		} else {

			this.reject('No Identifier');

		}

	};

	var _on_stop = function(data) {

		var identifier = data.identifier || null;
		if (identifier !== null && _MAIN !== null) {

			var project = _MAIN._projects[identifier] || null;
			if (project !== null && project.server !== null) {

				project.server.destroy();
				project.server = null;

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

		_Service.call(this, 'project', remote, _Service.TYPE.remote);


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
			data['constructor'] = 'harvester.net.remote.Project';


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

		sync: function() {
			this.index();
		}

	};


	return Composite;

});

