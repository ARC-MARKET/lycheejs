
lychee.define('studio.Main').requires([
	'lychee.app.Flow',
	'studio.codec.FONT',
	'studio.data.Project',
	'studio.net.Client',
	'studio.net.Server',
	'studio.event.flow.Font',
	'studio.event.flow.Sprite',
	'studio.state.Asset',
	'studio.state.Project',
	'studio.state.Scene',
	'harvester.net.Client'
]).includes([
	'lychee.app.Main'
]).exports((lychee, global, attachments) => {

	const _studio  = lychee.import('studio');
	const _lychee  = lychee.import('lychee');
	const _Client  = lychee.import('harvester.net.Client');
	const _Main    = lychee.import('lychee.app.Main');
	const _Project = lychee.import('studio.data.Project');



	/*
	 * HELPERS
	 */

	const _parse_arguments = function(states) {

		let argv = null;

		// platform: html-nwjs
		try {
			argv = global.require('nw.gui').App.argv;
		} catch (err) {
			argv = null;
		}

		// platform: node
		if (argv === null) {

			try {
				argv = process.argv.slice(2);
			} catch (err) {
				argv = null;
			}

		}


		if (argv !== null) {

			argv.forEach(arg => {

				let tmp = arg.trim();
				if (tmp.startsWith('/libraries') || tmp.startsWith('/projects')) {
					states.project = tmp;
				} else if (tmp === '--debug') {
					lychee.debug = true;
					states.debug = true;
				}

			});

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({

			input: {
				delay:       0,
				key:         true,
				keymodifier: true,
				touch:       true,
				scroll:      true,
				swipe:       true
			},

			jukebox: {
				music: true,
				sound: true
			},

			project: null,
			// project: '/projects/boilerplate',

			renderer: {
				id:     'studio',
				width:  null,
				height: null
			},

			viewport: {
				fullscreen: false
			}

		}, data);


		this.api     = null;
		this.project = null;


		// XXX: nwjs and node-sdl integration
		_parse_arguments(states);

		_Main.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function(oncomplete) {

			this.settings.appclient = this.settings.client;
			this.settings.client    = null;

			this.settings.appserver = this.settings.server;
			this.settings.server    = null;

			oncomplete(true);

		}, this, true);

		this.bind('init', function() {

			let appclient = this.settings.appclient || null;
			if (appclient !== null) {
				this.client = new _studio.net.Client(appclient);
				this.api    = new _Client({
					host: this.client.host
				}, this);
			}

			let appserver = this.settings.appserver || null;
			if (appserver !== null) {
				appserver.main = this;
				this.server = new _studio.net.Server(appserver);
			}


			this.setState('project', new _studio.state.Project(this));
			this.setState('asset',   new _studio.state.Asset(this));
			this.setState('scene',   new _studio.state.Scene(this));


			this.changeState('project', 'Project');


			let project = this.settings.project;
			if (project !== null) {

				this.loop.setTimeout(1000, function() {

					let entity = this.state.query('ui > project > select > search');
					if (entity !== null) {
						entity.setValue(project);
						entity.trigger('change', [ entity.value ]);
					}

				}, this);

			}

		}, this, true);


		let Flow = _studio.event.flow[this.settings.flow] || null;
		if (Flow !== null) {

			this.bind('init', function() {

				this.loop.setTimeout(1000, function() {

					let project = this.settings.project;
					let flow    = new Flow({
						main: this
					});

					flow.bind('complete', _ => {
						console.info('studio: SUCCESS ("' + project + '")');
					}, this);

					flow.bind('error', event => {
						console.error('studio: FAILURE ("' + project + '") at "' + event + '" event.');
					}, this);

					flow.init();

				}, this);

			}, this, true);

		}

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Main.prototype.serialize.call(this);
			data['constructor'] = 'studio.Main';


			let states = data['arguments'][0] || {};
			let blob   = data['blob'] || {};


			if (this.settings.appclient !== null) states.client = this.defaults.client;
			if (this.settings.appserver !== null) states.server = this.defaults.server;


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setProject: function(project) {

			project = project instanceof _Project ? project : null;


			if (project !== null) {

				this.project = project;

				return true;

			}


			return false;

		}

	};


	return Composite;

});
