
lychee.define('ranger.Main').requires([
	'ranger.state.Servers',
	'ranger.state.Profile',
	'ranger.state.Console',
	'harvester.net.Client'
]).includes([
	'lychee.app.Main'
]).exports((lychee, global, attachments) => {

	const _lychee = lychee.import('lychee');
	const _ranger = lychee.import('ranger');
	const _Client = lychee.import('harvester.net.Client');
	const _Main   = lychee.import('lychee.app.Main');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({
			client: {},
			server: null
		}, data);


		_Main.call(this, states);

		states = null;



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


			this.setState('servers', new _ranger.state.Servers(this));
			this.setState('profile', new _ranger.state.Profile(this));
			this.setState('console', new _ranger.state.Console(this));


			this.changeState('servers', 'servers');

		}, this, true);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Main.prototype.serialize.call(this);
			data['constructor'] = 'ranger.Main';

			let states = data['arguments'][0] || {};
			let blob   = data['blob'] || {};


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		}

	};


	return Composite;

});
