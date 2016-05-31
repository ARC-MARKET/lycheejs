
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
		var tunnel     = this.tunnel;

		if (_MAIN !== null && tunnel !== null && identifier !== null) {

			var project = _MAIN._projects[identifier] || null;
			if (project !== null && project.server === null) {

				_Server.process(project);


				tunnel.send({
					message: 'SUCCESS: Started server ("' + identifier + '")'
				}, {
					status: '200 OK'
				});

			} else {

				tunnel.send({
					message: 'FAILURE: No server ("' + identifier + '")'
				}, {
					status: '404 Not Found'
				});

			}

		}

	};

	var _on_stop = function(data) {

		var identifier = data.identifier || null;
		var tunnel     = this.tunnel;

		if (_MAIN !== null && tunnel !== null && identifier !== null) {

			var project = _MAIN._projects[identifier] || null;
			if (project !== null && project.server !== null) {

				project.server.destroy();
				project.server = null;


				tunnel.send({
					message: 'SUCCESS: Stopped server ("' + identifier + '")'
				}, {
					status: '200 OK'
				});

			} else {

				tunnel.send({
					message: 'FAILURE: No server ("' + identifier + '")'
				}, {
					status: '404 Not Found'
				});

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(remote) {

		_Service.call(this, 'project', remote, _Service.TYPE.remote);


		_MAIN = lychee.import('MAIN');


		this.bind('start', _on_start, this);
		this.bind('stop',  _on_stop,  this);

	};


	Class.prototype = {

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

			var main   = lychee.import('MAIN');
			var tunnel = this.tunnel;

			if (main !== null && tunnel !== null) {

				var projects = Object.values(main._projects).filter(function(project) {
					return /cultivator/g.test(project.identifier) === false;
				}).map(_serialize);


				tunnel.send(projects, {
					id:    this.id,
					event: 'index'
				});

			}

		}

	};


	return Class;

});

