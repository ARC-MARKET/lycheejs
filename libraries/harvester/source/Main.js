
lychee.define('harvester.Main').requires([
	'lychee.Input',
	'harvester.net.Admin',
	'harvester.net.Server',
	'harvester.mod.Fertilizer',
	'harvester.mod.Package',
	'harvester.mod.Server'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	var _harvester = lychee.import('harvester');



	/*
	 * HELPERS
	 */

	var _LIBRARIES  = {};
	var _PROJECTS   = {};
	var _PUBLIC_IPS = (function() {

		var os = null;

		try {
			os = require('os');
		} catch(e) {
		}


		if (os !== null) {


			var candidates = [];


			Object.values(os.networkInterfaces()).forEach(function(iface) {

				iface.forEach(function(alias) {

					if (alias.internal === false) {

						if (alias.family === 'IPv6' && alias.scopeid === 0) {
							candidates.push(alias.address);
						} else if (alias.family === 'IPv4') {
							candidates.push(alias.address);
						}

					}

				});

			});


			return candidates.unique();

		}


		return [];

	})();



	/*
	 * FEATURE DETECTION
	 */

	var _defaults = {

		host:    null,
		port:    null,
		sandbox: false

	};


	(function(libraries, projects) {

		var filesystem = new _harvester.data.Filesystem();


		filesystem.dir('/libraries').filter(function(value) {
			return !value.match(/README\.md/);
		}).map(function(value) {
			return '/libraries/' + value;
		}).forEach(function(identifier) {

			var info1 = filesystem.info(identifier + '/lychee.pkg');
			if ((info1 !== null && info1.type === 'file')) {
				libraries[identifier] = new _harvester.data.Project(identifier);
			}

		});

		filesystem.dir('/projects').filter(function(value) {
			return !value.match(/cultivator|README\.md/);
		}).map(function(value) {
			return '/projects/' + value;
		}).forEach(function(identifier) {

			var info1 = filesystem.info(identifier + '/index.html');
			var info2 = filesystem.info(identifier + '/lychee.pkg');
			if ((info1 !== null && info1.type === 'file') || (info2 !== null && info2.type === 'file')) {
				projects[identifier] = new _harvester.data.Project(identifier);
			}

		});

		filesystem.dir('/projects/cultivator').filter(function(value) {
			return !value.match(/design|index\.html|robots\.txt/);
		}).map(function(value) {
			return '/projects/cultivator/' + value;
		}).forEach(function(identifier) {

			var info1 = filesystem.info(identifier + '/index.html');
			var info2 = filesystem.info(identifier + '/lychee.pkg');
			if ((info1 !== null && info1.type === 'file') || (info2 !== null && info2.type === 'file')) {
				projects[identifier] = new _harvester.data.Project(identifier);
			}

		});

	})(_LIBRARIES, _PROJECTS);



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings) {

		this.settings = lychee.extendunlink({}, _defaults, settings);
		this.defaults = lychee.extendunlink({}, this.settings);


		this.admin  = null;
		this.server = null;


		this._libraries = _LIBRARIES;
		this._projects  = _PROJECTS;


		settings.host    = typeof settings.host === 'string' ? settings.host       : null;
		settings.port    = typeof settings.port === 'number' ? (settings.port | 0) : 8080;
		settings.sandbox = settings.sandbox === true;


		lychee.event.Emitter.call(this);



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function() {

			this.admin  = new _harvester.net.Admin({
				host: 'localhost',
				port: 4848
			});

			this.server = new _harvester.net.Server({
				host: settings.host === 'localhost' ? null : settings.host,
				port: settings.port
			});

		}, this, true);

		this.bind('init', function() {

			this.admin.connect();
			this.server.connect();


			console.log('\n\n');
			console.log('Open your web browser and surf to one of the following hosts:');
			console.log('\n');
			this.getHosts().forEach(function(host) {
				console.log(host);
			});
			console.log('\n\n');

		}, this, true);



		if (settings.sandbox === true) {

			console.log('\n');
			console.info('harvester: SANDBOX mode active');
			console.log('harvester: harvester.mod.Fertilizer disabled');
			console.log('harvester: harvester.mod.Strainer disabled');
			console.log('\n');


			(function(libraries, projects) {

				libraries.forEach(function(library, l) {

					if (_harvester.mod.Package.can(library) === true) {
						_harvester.mod.Package.process(library);
					}

				});

				setTimeout(function() {

					projects.forEach(function(project, p) {

						if (_harvester.mod.Package.can(project) === true) {
							_harvester.mod.Package.process(project);
						}

						if (_harvester.mod.Server.can(project) === true) {
							_harvester.mod.Server.process(project);
						}

					});

				}, 3000);

			})(Object.values(_LIBRARIES), Object.values(_PROJECTS));

		} else {

			console.log('\n');
			console.info('harvester: SANDBOX mode inactive');
			console.log('harvester: harvester.mod.Fertilizer enabled');
			console.log('harvester: harvester.mod.Strainer enabled');
			console.log('\n');


			(function(libraries, projects) {

				libraries.forEach(function(library, l) {

					if (_harvester.mod.Package.can(library) === true) {
						_harvester.mod.Package.process(library);
					}

					if (_harvester.mod.Fertilizer.can(library) === true) {
						_harvester.mod.Fertilizer.process(library);
					}

				});

				setTimeout(function() {

					projects.forEach(function(project, p) {

						if (_harvester.mod.Package.can(project) === true) {
							_harvester.mod.Package.process(project);
						}

						if (_harvester.mod.Server.can(project) === true) {
							_harvester.mod.Server.process(project);
						}


						if (_harvester.mod.Fertilizer.can(project) === true) {

							setTimeout(function() {
								_harvester.mod.Fertilizer.process(project);
							}, p * 2000);

						}

					});

				}, 3000);

			})(Object.values(_LIBRARIES), Object.values(_PROJECTS));

		}



		setInterval(function() {

			Object.values(_LIBRARIES).forEach(function(library) {

				if (_harvester.mod.Package.can(library) === true) {
					_harvester.mod.Package.process(library);
				}

			});

			Object.values(_PROJECTS).forEach(function(project) {

				if (_harvester.mod.Package.can(project) === true) {
					_harvester.mod.Package.process(project);
				}

			});

		}.bind(this), 30000);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			var admin = lychee.deserialize(blob.admin);
			if (admin !== null) {
				this.admin = admin;
			}


			var server = lychee.deserialize(blob.server);
			if (server !== null) {
				this.server = server;
			}

		},

		serialize: function() {

			var data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'harvester.Main';


			var settings = lychee.extendunlink({}, this.settings);
			var blob     = data['blob'] || {};


			if (this.admin !== null)  blob.admin  = lychee.serialize(this.admin);
			if (this.server !== null) blob.server = lychee.serialize(this.server);


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * MAIN API
		 */

		init: function() {

			this.trigger('load');
			this.trigger('init');

		},

		destroy: function() {

			for (var identifier in _PROJECTS) {

				var project = _PROJECTS[identifier];
				if (project.server !== null) {

					if (typeof project.server.destroy === 'function') {
						project.server.destroy();
					}

				}

			}


			if (this.admin !== null) {
				this.admin.disconnect();
				this.admin = null;
			}

			if (this.server !== null) {
				this.server.disconnect();
				this.server = null;
			}


			this.trigger('destroy');

		},



		/*
		 * CUSTOM API
		 */

		getHosts: function() {

			var hosts  = [];
			var server = this.server;

			if (server !== null) {

				var host = server.host || null;
				var port = server.port;

				if (host === null) {
					hosts.push.apply(hosts, _PUBLIC_IPS);
					hosts.push('localhost');
				} else {
					hosts.push(host);
				}


				hosts = hosts.map(function(host) {

					if (host.indexOf(':') !== -1) {
						return 'http://[' + host + ']:' + port;
					} else {
						return 'http://' + host + ':' + port;
					}

				});

			}


			return hosts;

		}

	};


	return Class;

});

