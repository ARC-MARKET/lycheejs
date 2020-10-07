
lychee.define('harvester.net.service.Server').includes([
	'lychee.net.Service'
]).exports((lychee, global, attachments) => {

	const _Service = lychee.import('lychee.net.Service');



	/*
	 * HELPERS
	 */

	const _serialize_remotes = function(project) {

		let remotes = [];

		let info = project.filesystem.info('/lychee.store');
		if (info !== null) {

			let database = JSON.parse(project.filesystem.read('/lychee.store'));
			if (database instanceof Object) {

				if (database['server'] instanceof Object) {

					let objects = database['server']['@objects'] || null;
					if (objects instanceof Object) {

						remotes = Object.values(objects).map(remote => ({
							id:   remote.id,
							type: remote.type,
							host: remote.host,
							port: remote.port
						}));

					}

				}

			}

		}

		return remotes;

	};

	const _serialize = function(project) {

		project = project instanceof Object ? project : null;


		if (project !== null) {

			let main        = global.MAIN || null;
			let remotes     = _serialize_remotes(project);
			let server_host = null;
			let server_port = null;

			if (project.server !== null) {
				server_host = project.server.host;
				server_port = project.server.port;
			}


			if (main !== null && server_host === null) {
				server_host = main.server.host;
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

		}


		return null;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		_Service.call(this, states);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'harvester.net.service.Server';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		index: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				let host = data['@host'] || null;
				if (host !== null) {

					if (host.endsWith(':4848')) {
						host = host.substr(0, host.length - 5);
					}

				}


				let main = global.MAIN || null;
				if (main !== null) {

					let all       = [];
					let projects  = Object.values(main._projects);
					let libraries = Object.values(main._libraries);

					for (let p = 0, pl = projects.length; p < pl; p++) {
						all.push(projects[p]);
					}

					for (let l = 0, ll = libraries.length; l < ll; l++) {
						all.push(libraries[l]);
					}


					all.forEach(project => {
						project.host = project.host !== 'localhost' ? project.host : host;
					});


					return this.send(all.map(_serialize), {
						event: 'sync'
					});

				}

			}


			return false;

		},

		connect: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				let host = data['@host'] || null;
				if (host !== null) {

					if (host.endsWith(':4848')) {
						host = host.substr(0, host.length - 5);
					}

				}


				let identifier = data.identifier || null;
				let main       = global.MAIN     || null;
				if (identifier !== null && main !== null) {

					let project = _serialize(main._libraries[identifier] || main._projects[identifier]);
					if (project !== null) {

						project.host = project.host !== 'localhost' ? project.host : host;

						return this.send(project, {
							event: 'connect'
						});

					} else {

						this.reject('No Server ("' + identifier + '")');

					}

				} else {

					this.reject('No Identifier');

				}

			}


			return false;

		}

	};


	return Composite;

});

