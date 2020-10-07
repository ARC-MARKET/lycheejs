
lychee.define('app.Main').requires([
	'app.net.Client',
	'app.net.Server',
	'app.state.Welcome'
]).includes([
	'lychee.app.Main'
]).exports((lychee, global, attachments) => {

	const _app  = lychee.import('app');
	const _Main = lychee.import('lychee.app.Main');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({

			input: {
				delay:       0,
				key:         true,
				keymodifier: false,
				scroll:      true,
				swipe:       true,
				touch:       true
			},

			jukebox: {
				music: true,
				sound: true
			},

			renderer: {
				id:     'app',
				width:  null,
				height: null
			},

			viewport: {
				fullscreen: false
			}

		}, data);


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
				this.client = new _app.net.Client(appclient);
			}

			let appserver = this.settings.appserver || null;
			if (appserver !== null) {
				this.server = new _app.net.Server(appserver);
			}


			this.setState('welcome', new _app.state.Welcome(this));


			this.changeState('welcome', 'welcome');

		}, this, true);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Main.prototype.serialize.call(this);
			data['constructor'] = 'app.Main';


			let states = data['arguments'][0] || {};
			let blob   = data['blob'] || {};


			if (this.settings.appclient !== null) states.client = this.defaults.client;
			if (this.settings.appserver !== null) states.server = this.defaults.server;


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		}

	};


	return Composite;

});
