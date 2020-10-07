
lychee.define('strainer.event.flow.Simulate').requires([
	'lychee.Environment',
	'lychee.Package',
	'lychee.Simulation',
	'lychee.Stash',
	'lychee.event.Queue'
]).includes([
	'lychee.event.Flow'
]).exports((lychee, global, attachments) => {

	const _Environment = lychee.import('lychee.Environment');
	const _Flow        = lychee.import('lychee.event.Flow');
	const _Package     = lychee.import('lychee.Package');
	const _Queue       = lychee.import('lychee.event.Queue');
	const _Simulation  = lychee.import('lychee.Simulation');
	const _Stash       = lychee.import('lychee.Stash');



	/*
	 * HELPERS
	 */

	const _resolve = function(identifier) {

		let pointer   = this;
		let namespace = identifier.split('.');
		let id        = namespace.pop();

		for (let n = 0, nl = namespace.length; n < nl; n++) {

			let name = namespace[n];

			if (pointer[name] === undefined) {
				pointer[name] = {};
			}

			pointer = pointer[name];

		}


		let check = id.toLowerCase();
		if (check === id) {

			if (pointer[id] === undefined) {
				pointer[id] = {};
			}

			return pointer[id];

		} else {

			if (pointer[id] !== undefined) {
				return pointer[id];
			}

		}


		return null;

	};

	const _render_statistics = function(id, statistics) {

		let types = Object.keys(statistics);
		if (types.length > 0) {

			let is_valid = false;

			types.forEach(type => {

				let names = Object.keys(statistics[type]);
				if (names.length > 0) {

					// XXX: This will log the headline only when
					// it contains an actual statistics report
					if (is_valid === false) {
						console.log('strainer: CHECK-SIMULATIONS of "' + id + '":');
						is_valid = true;
					}


					names.forEach(name => {

						let obj   = statistics[type][name];
						let title = name;
						if (type === 'enums') {
							title = '#' + name;
						} else if (type === 'events') {
							title = '@' + name;
						} else if (type === 'methods') {
							title = name + '()';
						}


						let info  = title + ': ' + obj.results.ok + '/' + obj.results.all;

						if (obj._expect > 0) {
							info += ' (' + obj._expect + ' incomplete)';
						}

						if (obj.results.ok < obj.results.all || obj._expect > 0) {
							console.error('strainer: \t' + info);
						} else {
							console.log('strainer: \t' + info);
						}

					});

				}

			});

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.errors  = [];

		this.debug   = false;
		this.project = null;
		this.stash   = new _Stash({
			type: _Stash.TYPE.persistent
		});

		this.__namespace   = null;
		this.__packages    = {};
		this.__simulations = [];


		this.setDebug(states.debug);
		this.setProject(states.project);


		_Flow.call(this);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('read-package', function(oncomplete) {

			let project = this.project;
			if (project !== null) {

				console.log('strainer: SIMULATE/READ-PACKAGE "' + project + '"');


				let pkg = new _Package({
					url:  project + '/lychee.pkg',
					type: 'source'
				});

				console.log('strainer: -> Mapping ' + pkg.url + ' as "' + pkg.id + '"');

				setTimeout(_ => {
					this.__namespace        = pkg.id;
					this.__packages[pkg.id] = pkg;
					oncomplete(true);
				}, 200);

			}

		}, this);

		this.bind('trace-simulations', function(oncomplete) {

			let namespace = this.__namespace;
			let project   = this.project;

			if (namespace !== null && project !== null) {

				console.log('strainer: SIMULATE/TRACE-SIMULATIONS "' + project + '"');


				let pkg = this.__packages[namespace] || null;
				if (pkg !== null) {

					pkg.setType('review');

					let simulations = pkg.getSimulations();
					if (simulations.length > 0) {

						simulations.forEach(sim => {

							let settings = {
								id: sim.id
							};

							let env    = sim.environment || null;
							let target = sim.target || null;

							if (env !== null && target !== null) {

								let pkgs = sim.environment.packages || null;
								if (pkgs instanceof Object) {

									for (let ns in pkgs) {

										let url = pkgs[ns];
										if (url === './lychee.pkg') {
											url = project + '/lychee.pkg';
										}

										pkgs[ns] = url;

									}

								}

								settings.environment = new _Environment(sim.environment);
								settings.target      = target;

								this.__simulations.push(settings);

							}

						});

					}

					pkg.setType('source');


					oncomplete(true);

				} else {
					oncomplete(false);
				}

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('check-simulations', function(oncomplete) {

			let project     = this.project;
			let simulations = this.__simulations;

			if (project !== null && simulations.length > 0) {

				console.log('strainer: SIMULATE/CHECK-SIMULATIONS "' + project + '"');


				let default_env = lychee.environment;
				let queue       = new _Queue();

				queue.bind('update', (settings, oncomplete) => {

					console.log('strainer: CHECK-SIMULATIONS "' + settings.id + '"');


					let simulation = new _Simulation(settings);

					lychee.setEnvironment(settings.environment);
					lychee.setSimulation(simulation);

					lychee.init(simulation, {}, sandboxes => {

						let remaining      = 0;
						let specifications = Object.keys(simulation.specifications);
						if (specifications.length > 0) {

							specifications.map(sid => {

								return {
									id:      sid,
									sandbox: _resolve.call(sandboxes, sid)
								};

							}).filter(entry => {

								let sandbox = entry.sandbox || null;
								if (sandbox !== null && typeof sandbox.evaluate === 'function') {
									return true;
								}

								return false;

							}).forEach(entry => {

								remaining++;

								entry.sandbox.evaluate(statistics => {
									_render_statistics(entry.id, statistics);
									remaining--;
								});

							});

							setInterval(_ => {

								if (remaining === 0) {
									oncomplete(true);
								}

							}, 250);

						} else {
							oncomplete(true);
						}

					});

				}, this);

				queue.bind('complete', _ => {

					lychee.setEnvironment(default_env);
					lychee.setSimulation(null);

					oncomplete(true);

				}, this);

				queue.bind('error', _ => {

					lychee.setEnvironment(default_env);
					lychee.setSimulation(null);

					oncomplete(false);

				}, this);

				simulations.forEach(sim => queue.then(sim));

				queue.init();

			} else {
				oncomplete(true);
			}

		}, this);



		/*
		 * FLOW
		 */

		this.then('read-package');

		this.then('trace-simulations');
		this.then('check-simulations');

	};


	Composite.prototype = {

		deserialize: function(blob) {

			if (blob.simulations instanceof Array) {
				this.__simulations = blob.simulations.map(lychee.deserialize).filter(simulation => simulation !== null);
			}


			let stash = lychee.deserialize(blob.stash);
			if (stash !== null) {
				this.stash = stash;
			}

		},

		serialize: function() {

			let data = _Flow.prototype.serialize.call(this);
			data['constructor'] = 'strainer.event.flow.Simulate';


			let states = data['arguments'][0] || {};
			let blob   = data['blob'] || {};


			if (this.debug !== false)  states.debug   = this.debug;
			if (this.project !== null) states.project = this.project;


			if (this.stash !== null)           blob.stash       = lychee.serialize(this.stash);
			if (this.__simulations.length > 0) blob.simulations = this.__simulations.map(lychee.serialize);


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setDebug: function(debug) {

			debug = typeof debug === 'boolean' ? debug : null;


			if (debug !== null) {

				this.debug = debug;

				return true;

			}


			return false;

		},

		setProject: function(project) {

			project = typeof project === 'string' ? project : null;


			if (project !== null) {

				this.project = project;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

