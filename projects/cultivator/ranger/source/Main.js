
lychee.define('app.Main').requires([
	'app.state.Welcome',
	'app.state.Profile',
//	'app.state.Console',
//	'app.state.Remote,'
	'harvester.net.Client'
]).includes([
	'lychee.app.Main'
]).exports(function(lychee, global, attachments) {

	var _lychee = lychee.import('lychee');
	var _app    = lychee.import('app');
	var _Client = lychee.import('harvester.net.Client');
	var _Main   = lychee.import('lychee.app.Main');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({

			client: {},
			server: null

		}, data);


		this.config  = null;


		_Main.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function(oncomplete) {

			this.settings.apiclient = this.settings.client;
			this.settings.client    = null;

			oncomplete(true);

		}, this, true);

		this.bind('init', function() {

			var apiclient = this.settings.apiclient || null;
			if (apiclient !== null) {
				this.client = new _Client(apiclient, this);
			}


			this.setState('welcome', new _app.state.Welcome(this));
			this.setState('profile', new _app.state.Profile(this));
			// this.setState('console', new _app.state.Console(this));
			// this.setState('remote',  new _app.state.Remote(this));


			this.changeState('welcome', 'welcome');

		}, this, true);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = _Main.prototype.serialize.call(this);
			data['constructor'] = 'app.Main';

			var settings = data['arguments'][0] || {};
			var blob     = data['blob'] || {};


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		reload: function(callback, scope) {

			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			var that    = this;
			var config  = new Config('http://localhost:4848/api/project/index?timestamp=' + Date.now());


			config.onload = function(result) {

				if (this.buffer !== null) {
					that.config = this;
				}

				callback.call(scope, that.config);

			};

			config.load();

		}

	};


	return Class;

});
