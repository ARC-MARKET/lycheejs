
lychee.define('fertilizer.Main').requires([
	'lychee.Package',
	'lychee.event.Queue',
	'fertilizer.event.Flow',
	'fertilizer.event.flow.Build',
	'fertilizer.event.flow.Configure',
	'fertilizer.event.flow.Fertilize',
	'fertilizer.event.flow.Package',
	'fertilizer.event.flow.Publish',
	'fertilizer.event.flow.html.Build',
	'fertilizer.event.flow.html-nwjs.Build',
	'fertilizer.event.flow.html-webview.Build',
	'fertilizer.event.flow.nidium.Build',
	'fertilizer.event.flow.node.Build',
	'fertilizer.event.flow.html-nwjs.Package',
	'fertilizer.event.flow.nidium.Package',
	'fertilizer.event.flow.node.Package'
]).includes([
	'lychee.event.Emitter'
]).exports((lychee, global, attachments) => {

	const _flow      = lychee.import('fertilizer.event.flow');
	const _lychee    = lychee.import('lychee');
	const _Build     = lychee.import('fertilizer.event.flow.Build');
	const _Configure = lychee.import('fertilizer.event.flow.Configure');
	const _Emitter   = lychee.import('lychee.event.Emitter');
	const _Flow      = lychee.import('fertilizer.event.Flow');
	const _Fertilize = lychee.import('fertilizer.event.flow.Fertilize');
	const _Package   = lychee.import('fertilizer.event.flow.Package');
	const _Publish   = lychee.import('fertilizer.event.flow.Publish');
	const _Queue     = lychee.import('lychee.event.Queue');



	/*
	 * HELPERS
	 */

	const _self_check = function(flows) {

		flows = flows instanceof Array ? flows : null;


		if (flows !== null) {

			console.log('fertilizer: self-check');

			let result = true;

			for (let f = 0, fl = flows.length; f < fl; f++) {

				let flow   = flows[f];
				let events = Object.keys(flow.___events);
				let stacks = Object.values(flow.___events);

				let check = stacks.map(stack => stack.length).find(val => val > 1) || null;
				if (check !== null) {

					console.warn('fertilizer: -> Invalid Flow "' + flow.displayName + '".');
					result = false;

					events.forEach((event, e) => {

						let length = stacks[e].length;
						if (length > 1) {
							console.warn('fertilizer: -> Event "' + event + '" has ' + length + ' bindings.');
						}

					});

				}

			}


			if (result === true) {
				console.info('fertilizer: -> SUCCESS');
			} else {
				console.warn('fertilizer: -> FAILURE');
			}

		}

	};

	const _create_flow = function(data) {

		let platform = data.target.split('/').shift() || null;
		if (platform !== null) {

			let Configure = _Configure;
			let Build     = _Build;
			let Package   = _Package;
			let Fertilize = _Fertilize;
			let Publish   = _Publish;

			if (_flow[platform] !== undefined) {

				if (_flow[platform].Configure !== undefined) Configure = _flow[platform].Configure;
				if (_flow[platform].Build !== undefined)     Build     = _flow[platform].Build;
				if (_flow[platform].Package !== undefined)   Package   = _flow[platform].Package;

			} else if (platform.includes('-') === true) {

				let major = platform.split('-')[0];
				let minor = platform.split('-')[1];

				if (_flow[major] !== undefined) {
					if (_flow[major].Configure !== undefined) Configure = _flow[major].Configure;
					if (_flow[major].Build !== undefined)     Build     = _flow[major].Build;
					if (_flow[major].Package !== undefined)   Package   = _flow[major].Package;
				}

				if (_flow[major + '-' + minor] !== undefined) {
					if (_flow[major + '-' + minor].Configure !== undefined) Configure = _flow[major + '-' + minor].Configure;
					if (_flow[major + '-' + minor].Build !== undefined)     Build     = _flow[major + '-' + minor].Build;
					if (_flow[major + '-' + minor].Package !== undefined)   Package   = _flow[major + '-' + minor].Package;
				}

			}


			let action = data.action;
			if (action === 'fertilize') {

				let flow_fertilize = new Fertilize(data);
				let flow_configure = new Configure(data);
				let flow_build     = new Build(data);
				let flow_package   = new Package(data);

				if (Configure !== _Configure) {

					flow_fertilize.unbind('configure-project');

					flow_configure.transfer('configure-project', flow_fertilize);

				}

				if (Build !== _Build) {

					flow_fertilize.unbind('read-package');
					flow_fertilize.unbind('read-assets');
					flow_fertilize.unbind('read-assets-crux');
					flow_fertilize.unbind('build-environment');
					flow_fertilize.unbind('build-assets');
					flow_fertilize.unbind('write-assets');
					flow_fertilize.unbind('build-project');

					flow_build.transfer('read-package',      flow_fertilize);
					flow_build.transfer('read-assets',       flow_fertilize);
					flow_build.transfer('read-assets-crux',  flow_fertilize);
					flow_build.transfer('build-environment', flow_fertilize);
					flow_build.transfer('build-assets',      flow_fertilize);
					flow_build.transfer('write-assets',      flow_fertilize);
					flow_build.transfer('build-project',     flow_fertilize);

				}

				if (Package !== _Package) {

					flow_fertilize.unbind('package-runtime');
					flow_fertilize.unbind('package-project');

					flow_package.transfer('package-runtime', flow_fertilize);
					flow_package.transfer('package-project', flow_fertilize);

				}

				_self_check([
					flow_configure,
					flow_build,
					flow_package
				]);

				return flow_fertilize;

			} else if (action === 'configure') {

				let flow = new Configure(data);

				_self_check([
					flow
				]);

				return flow;

			} else if (action === 'build') {

				let flow = new Build(data);

				_self_check([
					flow
				]);

				return flow;

			} else if (action === 'package') {

				let flow = new Package(data);

				_self_check([
					flow
				]);

				return flow;

			} else if (action === 'publish') {

				let flow = new Publish(data);

				_self_check([
					flow
				]);

				return flow;

			}

		}


		return null;

	};

	const _create_flow_thirdparty = function(data) {

		let action = data.action;
		let flow   = new _Flow(data);

		flow.reset();

		if (action === 'configure' || action === 'fertilize') {
			flow.then('configure-project');
		}

		if (action === 'build' || action === 'fertilize') {
			flow.then('build-project');
		}

		if (action === 'package' || action === 'fertilize') {
			flow.then('package-project');
		}

		return flow;

	};

	const _init_queue = function(queue) {

		let autofixed = false;
		let haderrors = false;

		queue.bind('update', function(flow, oncomplete) {

			console.log('');
			console.log('');
			console.info('fertilizer: ' + flow.action + ' "' + flow.project + '" "' + flow.target + '"');

			flow.bind('complete', _ => {

				console.info('fertilizer: SUCCESS');

				if (flow._autofixed === true) {
					autofixed = true;
				}

				oncomplete(true);

			}, this);

			flow.bind('error', event => {

				console.error('fertilizer: FAILURE at "' + event + '" event.');

				haderrors = true;
				oncomplete(true);

			}, this);

			flow.init();

		}, this);

		queue.bind('complete', _ => {

			if (autofixed === true) {
				process.exit(2);
			} else if (haderrors === true) {
				process.exit(1);
			} else {
				process.exit(0);
			}

		}, this);

		queue.bind('error', _ => {
			process.exit(1);
		}, this);

		queue.init();

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.settings = _lychee.assignunlink({
			action:  null,
			debug:   false,
			project: null,
			target:  null
		}, states);

		this.defaults = _lychee.assignunlink({
			action:  null,
			debug:   false,
			project: null,
			target:  null
		}, this.settings);


		let debug = this.settings.debug;
		if (debug === true) {
			console.log('fertilizer.Main: Parsed settings are ...');
			console.log(this.settings);
		}


		this.__package = null;


		_Emitter.call(this);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function() {

			let project = this.settings.project || null;
			if (project !== null) {

				lychee.ROOT.project                           = _lychee.ROOT.lychee + project;
				lychee.environment.global.lychee.ROOT.project = _lychee.ROOT.lychee + project;


				let pkg = new _lychee.Package({
					url:  project + '/lychee.pkg',
					type: 'build'
				});

				setTimeout(_ => {

					this.__package = pkg;

					if (pkg.config !== null && pkg.config.buffer !== null) {

						console.info('fertilizer: Valid Package at "' + project + '/lychee.pkg".');
						console.info('fertilizer: Initializing lychee.js Mode.');

						this.trigger('init');

					} else {

						console.warn('fertilizer: Invalid Package at "' + project + '/lychee.pkg".');
						console.warn('fertilizer: Initializing Third-Party Mode.');

						this.trigger('init-thirdparty');

					}

				}, 200);

			} else {

				console.error('fertilizer: FAILURE ("' + project + '") at "load" event.');

				this.destroy(1);

			}

		}, this, true);

		this.bind('init', function() {

			let action  = this.settings.action  || null;
			let debug   = this.settings.debug   || false;
			let project = this.settings.project || null;
			let target  = this.settings.target  || null;

			if (action !== null && project !== null && target !== null) {

				let queue = new _Queue();
				let flow  = _create_flow({
					action:  action,
					debug:   debug,
					project: project,
					target:  target
				});

				if (flow !== null) {
					queue.then(flow);
				}

				_init_queue.call(this, queue);

			} else if (action !== null && project !== null) {

				let pkg = this.__package;
				if (pkg !== null) {

					let targets = pkg.getEnvironments().map(env => env.id);
					if (targets.length > 0) {

						let queue = new _Queue();

						targets.forEach(target => {

							if (debug === true) {
								console.log('fertilizer: -> Queueing Flow "lycheejs-fertilizer ' + action + ' ' + project + ' ' + target + '"');
							}

							let flow = _create_flow({
								action:  action,
								debug:   debug,
								project: project,
								target:  target
							});

							if (flow !== null) {
								queue.then(flow);
							}

						});

						_init_queue.call(this, queue);

					} else {
						this.destroy(0);
					}

				} else {

					console.error('fertilizer: FAILURE ("' + project + '") at "init" event.');

					this.destroy(1);

				}

			}

		}, this, true);

		this.bind('init-thirdparty', function() {

			let action  = this.settings.action  || null;
			let project = this.settings.project || null;
			let target  = this.settings.target  || null;

			if (action !== null && project !== null) {

				let queue = new _Queue();
				let flow  = _create_flow_thirdparty({
					action:  action,
					debug:   debug,
					project: project,
					target:  target || '*'
				});

				if (flow !== null) {
					queue.then(flow);
				}

				_init_queue(queue);

			} else {

				console.error('fertilizer: FAILURE ("' + project + '") at "init-thirdparty" event.');

				this.destroy(1);

			}

		}, this, true);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'fertilizer.Main';


			let states = _lychee.assignunlink({}, this.settings);
			let blob   = data['blob'] || {};


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * MAIN API
		 */

		init: function() {

			let action  = this.settings.action  || null;
			let project = this.settings.project || null;

			if (action !== null && project !== null) {

				this.trigger('load');

				return true;

			}


			return false;

		},

		destroy: function(code) {

			code = typeof code === 'number' ? code : 0;


			this.trigger('destroy', [ code ]);

			return true;

		}

	};


	return Composite;

});

