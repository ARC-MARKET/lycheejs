
lychee.define('game.Main').requires([
	'lychee.Font',
	'lychee.Input',
	'lychee.Viewport',
	'game.Jukebox',
	'game.Renderer',
	'game.state.GameBoard',
	'game.state.Menu',
	'game.state.Result',
	'game.DeviceSpecificHacks'
]).includes([
	'lychee.game.Main'
]).exports(function(lychee, global) {

	var Class = function(settings) {

		lychee.game.Main.call(this, settings);

		this.fonts = {};

		this.load();

	};


	Class.prototype = {

		defaults: {
			title: 'Jewelz',
			base: './asset',
			sound: true,
			music: true,
			fullscreen: true,
			play: {
				hits:  3,
				intro: 5000,
				hint:  2000,
				time:  30000
			},
			renderFps: 60,
			updateFps: 60,
			width:     896,
			height:    384,
			tile:      64
		},

		load: function() {

			var base = this.settings.base;
			var tile = this.settings.tile;

			var urls = [
				base + '/img/font_48_white.png',
				base + '/img/font_32_white.png',
				base + '/img/font_16_white.png',
				base + '/img/deco_64.png',
				base + '/json/deco_64.json',
				base + '/img/jewel_64.png',
				base + '/json/jewel_64.json',
				base + '/json/map_01.json'
			];


			this.preloader = new lychee.Preloader({
				timeout: Infinity
			});

			this.preloader.bind('ready', function(assets) {

				this.assets = assets;


				this.fonts.headline = new lychee.Font(assets[urls[0]], {
					baseline: 4,
					kerning: -2,
					spacing: 14,
					map: [14,18,22,34,26,62,46,14,18,22,29,34,17,30,16,18,38,20,37,34,36,35,37,31,36,33,16,18,28,34,28,29,52,39,41,34,47,39,29,35,37,17,29,32,29,44,35,40,29,39,37,40,29,37,28,50,31,32,35,18,19,21,27,33,25,25,26,21,26,25,17,25,25,15,15,25,15,36,25,25,24,25,22,21,17,25,22,32,24,25,24,21,14,21,30]
				});


				this.fonts.normal = new lychee.Font(assets[urls[1]], {
					baseline: 4,
					kerning: 0,
					spacing: 12,
					map: [11,14,16,24,19,43,32,11,13,16,21,24,13,21,12,14,27,15,26,24,26,25,26,22,26,24,12,13,20,24,20,21,36,28,29,24,33,27,21,25,26,13,21,23,21,31,25,28,21,28,26,28,21,26,20,35,22,23,25,13,14,15,19,23,18,18,19,16,19,18,13,18,18,12,11,18,11,25,18,18,18,18,16,15,13,18,16,23,17,18,18,16,11,16,22]
				});

				this.fonts.small = new lychee.Font(assets[urls[2]], {
					baseline: 2,
					kerning: 0,
					spacing: 14,
					map: [8,9,10,14,12,24,18,8,9,10,13,14,9,13,8,9,16,10,15,14,15,15,15,13,15,14,8,9,12,14,12,13,20,16,17,14,19,16,13,15,15,9,13,14,13,18,15,16,13,16,15,16,13,15,12,20,13,14,15,9,9,10,12,14,11,11,12,10,12,11,9,11,11,8,8,11,8,15,11,11,11,11,10,10,9,11,10,14,11,11,11,10,8,10,13]
				});


				this.config = {
					deco:  assets[urls[4]],
					jewel: assets[urls[6]]
				};

				this.config.deco.image  = assets[urls[3]];
				this.config.jewel.image = assets[urls[5]];

				this.config.maps = {
					'01': assets[urls[7]]
				};


				this.init();

			}, this);

			this.preloader.bind('error', function(urls) {
				if (lychee.debug === true) {
					console.warn('Preloader error for these urls: ', urls);
				}
			}, this);

			this.preloader.load(urls);

		},

		reset: function(width, height) {

			game.DeviceSpecificHacks.call(this);


			var env = this.renderer.getEnvironment();

			if (
				typeof width === 'number'
				&& typeof height === 'number'
			) {
				env.screen.width  = width;
				env.screen.height = height;
			}


			if (this.settings.fullscreen === true) {
				this.settings.width = env.screen.width;
				this.settings.height = env.screen.height;
			} else {
				this.settings.width = this.defaults.width;
				this.settings.height = this.defaults.height;
			}


			this.settings.ui = {};
			this.settings.ui.width  = (Math.floor(this.settings.width / this.settings.tile) * 0.2 * this.settings.tile) | 0;
			this.settings.ui.height = this.settings.height;
			this.settings.ui.tile = this.settings.tile;
			this.settings.ui.position = {
				x: (this.settings.width - this.settings.ui.width / 2) | 0,
				y: (this.settings.height / 2) | 0
			};


			this.settings.game = {};
			this.settings.game.width = (Math.floor(this.settings.width / this.settings.tile) * 0.8 * this.settings.tile) | 0;
			this.settings.game.height = this.settings.height;
			this.settings.game.hits = this.settings.play.hits;
			this.settings.game.tile = this.settings.tile;
			this.settings.game.position = {
				x: (this.settings.game.width / 2) | 0,
				y: (this.settings.game.height / 2) | 0
			};



			this.renderer.reset(
				this.settings.width,
				this.settings.height,
				true
			);


			this.__offset = env.offset; // Linked

		},

		init: function() {

			// Remove Preloader Progress Bar
			lychee.Preloader.prototype._progress(null, null);


			lychee.game.Main.prototype.init.call(this);

			this.renderer = new game.Renderer('game');
			this.renderer.reset(
				this.settings.width,
				this.settings.height,
				true
			);
			this.renderer.setBackground("#222222");


			this.viewport = new lychee.Viewport();
			this.viewport.bind('reshape', function(orientation, rotation, width, height) {

				this.reset(width, height);

				for (var id in this.states) {
					this.states[id].reset();
				}

				var state = this.getState();
				state.leave && state.leave();
				state.enter && state.enter();

			}, this);
			this.viewport.bind('hide', function() {

				if (
					this.jukebox
					&& this.jukebox.isPlaying('music') === true
				) {
					this.jukebox.stop('music');
				}

				this.stop();

			}, this);
			this.viewport.bind('show', function() {

				if (
					this.jukebox
					&& this.jukebox.isPlaying('music')
				) {
					this.jukebox.play('music');
				}

				this.start();

			}, this);


			this.reset();


			this.jukebox = new game.Jukebox(this);

			this.input = new lychee.Input({
				delay:        0,
				fireKey:      false, // change to true for NodeJS support
				fireModifier: false,
				fireTouch:    true,
				fireSwipe:    false
			});


			// This is apparently a one-time HACK
			/*
			this.input.bind('touch', function() {
				if (this.settings.fullscreen === true) {
					this.viewport.enterFullscreen();
				}
			}, this, true);
			*/


			this.states.gameboard  = new game.state.GameBoard(this);
			this.states.result     = new game.state.Result(this);
			this.states.menu       = new game.state.Menu(this);

			this.setState('menu');

			this.start();

		},

		getOffset: function(reset) {
			return this.__offset;
		}

	};


	return Class;

});
