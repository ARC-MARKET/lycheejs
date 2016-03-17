
lychee.define('game.Main').requires([
	'game.net.Client',
	'game.net.Server',
	'game.state.Game'
]).includes([
	'lychee.app.Main'
]).exports(function(lychee, game, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({

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


		lychee.app.Main.call(this, settings);


		this.bind('load', function(oncomplete) {

			this.settings.gameclient = this.settings.client || null;
			this.settings.client     = null;

			this.settings.gameserver = this.settings.server || null;
			this.settings.server     = null;

			oncomplete(true);

		}, this, true);

		this.bind('init', function() {

			var gameclient = this.settings.gameclient;
			if (gameclient !== null) {

				this.client = new game.net.Client(gameclient, this);
				this.client.bind('connect', function() {
					this.changeState('game');
				}, this);

			}

			var gameserver = this.settings.gameserver;
			if (gameserver !== null) {
				this.server = new game.net.Server(gameserver, this);
			}


			this.viewport.unbind('show');
			this.viewport.unbind('hide');


			this.setState('game', new game.state.Game(this));

		}, this, true);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.app.Main.prototype.serialize.call(this);
			data['constructor'] = 'game.Main';

			var settings = data['arguments'][0] || {};
			var blob     = data['blob'] || {};


			if (this.settings.gameclient !== null) { settings.client = this.defaults.client; }
			if (this.settings.gameserver !== null) { settings.server = this.defaults.server; }


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		}

	};


	return Class;

});
