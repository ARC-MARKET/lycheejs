
lychee.define('breeder.Main').requires([
	'breeder.event.flow.Fork',
	'breeder.event.flow.Init',
	'breeder.event.flow.Pull'
]).includes([
	'lychee.event.Emitter'
]).exports((lychee, global, attachments) => {

	const _lychee  = lychee.import('lychee');
	const _Emitter = lychee.import('lychee.event.Emitter');
	const _Fork    = lychee.import('breeder.event.flow.Fork');
	const _Init    = lychee.import('breeder.event.flow.Init');
	const _Pull    = lychee.import('breeder.event.flow.Pull');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.settings = _lychee.assignunlink({
			action:     null,
			debug:      false,
			identifier: null,
			project:    null,
			library:    null
		}, states);

		this.defaults = _lychee.assignunlink({
			action:     null,
			debug:      false,
			identifier: null,
			project:    null,
			library:    null
		}, this.settings);


		let debug = this.settings.debug;
		if (debug === true) {
			console.log('breeder.Main: Parsed settings are ...');
			console.log(this.settings);
		}


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

				this.trigger('init');

			} else {

				console.error('breeder: FAILURE at "load" event.');

				this.destroy(1);

			}

		}, this, true);

		this.bind('init', function() {

			let debug      = this.settings.debug      || false;
			let action     = this.settings.action     || null;
			let library    = this.settings.library    || null;
			let project    = this.settings.project    || null;
			let identifier = this.settings.identifier || null;

			if (action !== null && project !== null) {

				let flow = null;

				if (action === 'init') {

					flow = new _Init({
						debug:      debug,
						identifier: identifier,
						project:    project
					});

				} else if (action === 'fork') {

					flow = new _Fork({
						debug:   debug,
						library: library,
						project: project
					});

				} else if (action === 'pull') {

					flow = new _Pull({
						debug:   debug,
						library: library,
						project: project
					});

				} else if (action === 'push') {

					// TODO: breeder.event.flow.Push

				}


				if (flow !== null) {

					flow.bind('complete', function() {

						console.info('breeder: SUCCESS');

						this.destroy(0);

					}, this);

					flow.bind('error', function(event) {

						console.error('breeder: FAILURE at "' + event + '" event.');

						this.destroy(1);

					}, this);

					flow.init();

				}

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
			data['constructor'] = 'breeder.Main';


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

