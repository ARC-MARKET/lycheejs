
lychee.define('game.Main').requires([
	'game.net.Client',
	'game.net.Server',
	'game.state.Game'
]).includes([
	'lychee.app.Main'
]).exports((lychee, global, attachments) => {

	const _Client = lychee.import('game.net.Client');
	const _Game   = lychee.import('game.state.Game');
	const _Main   = lychee.import('lychee.app.Main');
	const _Server = lychee.import('game.net.Server');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({

			input: {
				delay:       0,
				key:         true,
				keymodifier: false,
				touch:       true,
				swipe:       true
			},

			jukebox: {
				music:  true,
				sound:  true,
				volume: 0.25
			},

			renderer: {
				id:         'lethalmaze',
				width:      null,
				height:     null,
				background: '#67b843'
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

			this.settings.gameclient = this.settings.client || null;
			this.settings.client     = null;

			this.settings.gameserver = this.settings.server || null;
			this.settings.server     = null;

			oncomplete(true);

		}, this, true);

		this.bind('init', function() {

			let gameclient = this.settings.gameclient;
			if (gameclient !== null) {

				this.client = new _Client(gameclient);
				this.client.bind('connect', function() {
					this.changeState('game');
				}, this);

			}

			let gameserver = this.settings.gameserver;
			if (gameserver !== null) {
				this.server = new _Server(gameserver);
			}


			this.viewport.unbind('show');
			this.viewport.unbind('hide');


			this.setState('game', new _Game(this));

		}, this, true);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Main.prototype.serialize.call(this);
			data['constructor'] = 'game.Main';

			let states = data['arguments'][0] || {};
			let blob   = data['blob'] || {};


			if (this.settings.gameclient !== null) states.client = this.defaults.client;
			if (this.settings.gameserver !== null) states.server = this.defaults.server;


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		}

	};


	return Composite;

});
