
lychee.define('app.Main').requires([
	'app.state.Welcome',
	'app.state.Profile',
	'app.state.Console',
	'harvester.net.Client'
]).includes([
	'lychee.app.Main'
]).exports(function(lychee, global, attachments) {

	const _lychee = lychee.import('lychee');
	const _app    = lychee.import('app');
	const _Client = lychee.import('harvester.net.Client');
	const _Main   = lychee.import('lychee.app.Main');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({

			client: {},
			server: null

		}, data);


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

			let apiclient = this.settings.apiclient || null;
			if (apiclient !== null) {
				this.client = new _Client(apiclient, this);
			}


			this.setState('welcome', new _app.state.Welcome(this));
			this.setState('profile', new _app.state.Profile(this));
			this.setState('console', new _app.state.Console(this));


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

			let settings = data['arguments'][0] || {};
			let blob     = data['blob'] || {};


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		}

	};


	return Composite;

});
