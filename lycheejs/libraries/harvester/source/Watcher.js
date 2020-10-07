
lychee.define('harvester.Watcher').requires([
	'harvester.data.Filesystem',
	'harvester.data.Project',
	'harvester.mod.Beautifier',
	'harvester.mod.Fertilizer',
	'harvester.mod.Harvester',
	'harvester.mod.Packager',
	'harvester.mod.Server',
	'harvester.mod.Strainer'
]).exports((lychee, global, attachments) => {

	const _Filesystem = lychee.import('harvester.data.Filesystem');
	const _Project    = lychee.import('harvester.data.Project');
	const _mod        = {
		Beautifier: lychee.import('harvester.mod.Beautifier'),
		Fertilizer: lychee.import('harvester.mod.Fertilizer'),
		Harvester:  lychee.import('harvester.mod.Harvester'),
		Packager:   lychee.import('harvester.mod.Packager'),
		Server:     lychee.import('harvester.mod.Server'),
		Strainer:   lychee.import('harvester.mod.Strainer')
	};



	/*
	 * HELPERS
	 */

	const _update_cache = function(silent) {

		silent = silent === true;


		// Libraries
		let libraries = this.filesystem.dir('/libraries').filter(v => /README\.md/.test(v) === false).map(v => '/libraries/' + v);

		// Remove Libraries
		Object.keys(this.libraries).forEach(identifier => {

			let index = libraries.indexOf(identifier);
			if (index === -1) {

				if (silent === false) {
					console.log('harvester.Watcher: Remove Library "' + identifier + '"');
				}

				let server = this.libraries[identifier].server || null;
				if (server !== null) {
					server.destroy();
				}

				delete this.libraries[identifier];

			}

		});

		// Add Libraries
		libraries.forEach(identifier => {

			let check = this.libraries[identifier] || null;
			let info1 = this.filesystem.info(identifier + '/lychee.pkg');

			if (check === null && (info1 !== null && info1.type === 'file')) {

				if (silent === false) {
					console.log('harvester.Watcher: Add Library "' + identifier + '"');
				}

				this.libraries[identifier] = new _Project({
					identifier: identifier
				});

			}

		});



		// Projects
		let projects = this.filesystem.dir('/projects').filter(v => v !== 'README.md').map(v => '/projects/' + v);

		// Remove Projects
		Object.keys(this.projects).forEach(identifier => {

			let index = projects.indexOf(identifier);
			if (index === -1) {

				if (silent === false) {
					console.log('harvester.Watcher: Remove Project "' + identifier + '"');
				}

				let server = this.projects[identifier].server || null;
				if (server !== null) {
					server.destroy();
				}

				delete this.projects[identifier];

			}

		});

		// Add Projects
		projects.forEach(identifier => {

			let check = this.projects[identifier] || null;
			let info1 = this.filesystem.info(identifier + '/index.html');
			let info2 = this.filesystem.info(identifier + '/lychee.pkg');

			if (check === null && ((info1 !== null && info1.type === 'file') || (info2 !== null && info2.type === 'file'))) {

				if (silent === false) {
					console.log('harvester.Watcher: Add Project "' + identifier + '"');
				}

				this.projects[identifier] = new _Project({
					identifier: identifier
				});

			}

		});

	};

	const _update_harvester = function(silent) {

		silent = silent === true;


		let Harvester = _mod.Harvester;


		let sandbox = this.sandbox;
		if (sandbox === true) {
			Harvester = null;
		}


		if (Harvester !== null) {

			let branch = 'master';
			let check  = false;
			let status = _mod.Harvester.can();
			if (status !== null) {

				branch = status.branch || 'master';

				if (status.changes.length === 0 && status.ahead === 0) {
					check = true;
				}

			}


			if (check === true) {

				if (silent === false) {

					console.info('harvester.Watcher: Autonomous Software Updates enabled.');
					console.log('');

				}

				_mod.Harvester.process();

			} else {

				if (silent === false) {

					console.warn('harvester.Watcher: Autonomous Software Updates disabled.');

					if (status.ahead !== 0) {
						console.warn('harvester.Watcher: Local git branch "' + branch + '" is ahead of remote "upstream".');
					} else if (status.changes.length > 0) {
						console.warn('harvester.Watcher: Local uncommited changes cannot be transmitted to the cloud.');
					}

					console.log('');

				}

			}

		} else {

			if (silent === false) {
				console.warn('harvester.Watcher: Autonomous Software Updates disabled.');
				console.log('');
			}

		}

	};

	const _update_mods = function() {

		// XXX: Fertilizer disabled for performance reasons
		// let Fertilizer = _mod.Fertilizer;
		let Beautifier = _mod.Beautifier;
		let Fertilizer = null;
		let Packager   = _mod.Packager;
		let Server     = _mod.Server;
		let Strainer   = _mod.Strainer;


		let sandbox = this.sandbox;
		if (sandbox === true) {

			Fertilizer = null;
			Server     = null;
			Strainer   = null;

		}


		for (let lid in this.libraries) {

			let library = this.libraries[lid];
			let reasons = [];

			if (Packager !== null && Packager.can(library) === true) {
				reasons = Packager.process(library);
			}

			if (Beautifier !== null && Beautifier.can(library) === true) {
				Beautifier.process(library);
			}

			if (Server !== null && Server.can(library) === true) {
				Server.process(library);
			}


			if (reasons.length > 0) {

				let changed_source = reasons.find(p => p.startsWith('/source/files')) || null;
				if (changed_source !== null) {

					if (Strainer !== null && Strainer.can(library) === true) {
						Strainer.process(library);
					}

					if (Fertilizer !== null && Fertilizer.can(library) === true) {
						Fertilizer.process(library);
					}

				}

			}

		}

		for (let pid in this.projects) {

			let project = this.projects[pid];
			let reasons = [];

			if (Packager !== null && Packager.can(project) === true) {
				reasons = Packager.process(project);
			}

			if (Beautifier !== null && Beautifier.can(project) === true) {
				Beautifier.process(project);
			}

			if (Server !== null && Server.can(project) === true) {
				Server.process(project);
			}


			if (reasons.length > 0) {

				let changed_source = reasons.find(p => p.startsWith('/source/files')) || null;
				if (changed_source !== null) {

					if (Strainer !== null && Strainer.can(project) === true) {
						Strainer.process(project);
					}

					if (Fertilizer !== null && Fertilizer.can(project) === true) {
						Fertilizer.process(project);
					}

				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(main) {

		this.filesystem = new _Filesystem();
		this.libraries  = {};
		this.projects   = {};
		this.sandbox    = main.settings.sandbox === true;

		// Figure out if there's a cleaner way
		main._libraries = this.libraries;
		main._projects  = this.projects;

	};

	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'harvester.Watcher',
				'arguments':   []
			};

		},

		init: function() {

			_update_cache.call(this, true);
			_update_harvester.call(this);


			// XXX: Fertilizer disabled for performance reasons
			// let Fertilizer = _mod.Fertilizer;
			let Beautifier = _mod.Beautifier;
			let Packager   = _mod.Packager;
			let Server     = _mod.Server;
			let Strainer   = _mod.Strainer;


			let sandbox = this.sandbox;
			if (sandbox === true) {

				// Fertilizer = null;
				Server     = null;
				Strainer   = null;

			}


			for (let lid in this.libraries) {

				let library = this.libraries[lid];

				if (Packager !== null && Packager.can(library) === true) {
					Packager.process(library);
				}

				if (Beautifier !== null && Beautifier.can(library) === true) {
					Beautifier.process(library);
				}

				if (Server !== null && Server.can(library) === true) {
					Server.process(library);
				}

				if (Strainer !== null && Strainer.can(library) === true) {
					Strainer.process(library);
				}

			}

			for (let pid in this.projects) {

				let project = this.projects[pid];

				if (Packager !== null && Packager.can(project) === true) {
					Packager.process(project);
				}

				if (Beautifier !== null && Beautifier.can(project) === true) {
					Beautifier.process(project);
				}

				if (Server !== null && Server.can(project) === true) {
					Server.process(project);
				}

				if (Strainer !== null && Strainer.can(project) === true) {
					Strainer.process(project);
				}

			}


			return true;

		},

		update: function() {

			_update_cache.call(this);
			_update_mods.call(this);
			_update_harvester.call(this, true);

		}

	};


	return Composite;

});

