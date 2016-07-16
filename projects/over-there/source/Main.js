
lychee.define('app.Main').requires([
	'app.net.Client',
	'app.net.Server',
	'app.state.App'
]).includes([
	'lychee.app.Main'
]).exports(function(lychee, global, attachments) {

	var _lychee = lychee.import('lychee');
	var _app    = lychee.import('app');
	var _Main   = lychee.import('lychee.app.Main');


	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		var settings = Object.assign({

			input: {
				delay:       0,
				key:         false,
				keymodifier: false,
				touch:       true,
				swipe:       true
			},

			jukebox: {
				music: true,
				sound: true
			},

			renderer: {
				id:         'over-there',
				width:      null,
				height:     null,
				background: '#000000'
			},

			viewport: {
				fullscreen: false
			}

		}, data);


		_Main.call(this, settings);



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

			var appclient = this.settings.appclient || null;
			if (appclient !== null) {

				this.client = new _app.net.Client(appclient, this);
				this.client.bind('connect', function() {
					this.changeState('app');
				}, this);

			}

			var appserver = this.settings.appserver || null;
			if (appserver !== null) {
				this.server = new _app.net.Server(appserver, this);
			}


			this.setState('app', new _app.state.App(this));

		}, this, true);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = _Main.prototype.serialize.call(this);
			data['constructor'] = 'app.Main';

			var settings = data['arguments'][0] || {};
			var blob     = data['blob'] || {};


			if (this.settings.appclient !== null) { settings.client = this.settings.appclient; }
			if (this.settings.appserver !== null) { settings.server = this.settings.appserver; }


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		}

	};


	return Composite;

});
