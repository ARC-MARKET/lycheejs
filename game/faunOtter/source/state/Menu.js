
lychee.define('game.state.Menu').includes([
	'lychee.game.State'
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.game.State.call(this, game, 'menu');

		this.__input = this.game.input;
		this.__renderer = this.game.renderer;

		this.__cache  = { x: 0, y: 0 };
		this.__locked = true;

		this.__root     = null;
		this.__welcome  = null;
		this.__settings = null;

		this.reset();

	};


	Class.prototype = {

		reset: function() {

			var width   = this.game.settings.width;
			var height  = this.game.settings.height;
			var entity  = null;


			this.__root = new lychee.ui.Area({
				width:  width,
				height: height,
				scrollable: true,
				position: {
					x: width / 2, y: height / 2
				}
			});


			this.__welcome = new lychee.ui.Area({
				width:  width,
				height: height,
				scrollable: false,
				position: {
					x: 0, y: 0
				}
			});

			this.__root.add(this.__welcome);

			this.__settings = new lychee.ui.Area({
				width:  width,
				height: height,
				scrollable: false,
				position: {
					x: width, y: 0
				}
			});

			this.__root.add(this.__settings);



			/*
			 * WELCOME
			 */

			entity = new lychee.ui.Button({
				label: this.game.settings.title,
				font:  this.game.fonts.headline,
				position: {
					x: 0, y: -1 * height / 2 + 80
				}
			});

			this.__welcome.add(entity);

			entity = new lychee.ui.Button({
				label: 'powered by lycheeJS',
				font:  this.game.fonts.small,
				position: {
					x: 0, y: height / 2 - 30
				}
			});

			this.__welcome.add(entity);

			entity = new lychee.ui.Button({
				label: 'New Game',
				font:  this.game.fonts.normal,
				position: {
					x: 0, y: -24
				}
			});

			entity.bind('touch', function(entity) {
				this.game.setState('game');
			}, this);

			this.__welcome.add(entity);

			entity = new lychee.ui.Button({
				label: 'Settings',
				font:  this.game.fonts.normal,
				position: {
					x: 0, y: 24
				}
			});

			entity.bind('touch', function(entity) {
				var cache = this.__cache;
				this.__cache.x = -1 * width;
				this.__cache.y = 0;
				this.__root.scrollBy(500, cache);
			}, this);

			this.__welcome.add(entity);



			/*
			 * SETTINGS
			 */

			var settings = this.game.settings;


			entity = new lychee.ui.Button({
				label: 'Settings',
				font:  this.game.fonts.headline,
				position: {
					x: 0, y: -1 * height / 2 + 80
				}
			});

			entity.bind('touch', function(entity) {
				var cache = this.__cache;
				this.__cache.x = 1 * width;
				this.__cache.y = 0;
				this.__root.scrollBy(500, cache);
			}, this);

			this.__settings.add(entity);

			entity = new lychee.ui.Button({
				label: 'powered by lycheeJS',
				font:  this.game.fonts.small,
				position: {
					x: 0, y: height / 2 - 30
				}
			});

			this.__settings.add(entity);

			entity = new lychee.ui.Button({
				label: 'Fullscreen: ' + (settings.fullscreen === true ? 'On' : 'Off'),
				font:  this.game.fonts.normal,
				position: {
					x: 0, y: -24
				}
			});

			entity.bind('touch', function(entity) {

				settings.fullscreen = settings.fullscreen === true ? false : true;
				entity.setLabel('Fullscreen: ' + (settings.fullscreen === true ? 'On' : 'Off'));

				this.game.reset();
				this.reset();

			}, this);

			this.__settings.add(entity);

			entity = new lychee.ui.Button({
				label: 'Music: ' + (settings.music === true ? 'On' : 'Off'),
				font:  this.game.fonts.normal,
				position: {
					x: 0, y: 24
				}
			});

			entity.bind('touch', function(entity) {
				settings.music = settings.music === true ? false : true;
				entity.setLabel('Music: ' + (settings.music === true ? 'On' : 'Off'));
			}, this);

			this.__settings.add(entity);

			entity = new lychee.ui.Button({
				label: 'Sound: ' + (settings.sound === true ? 'On' : 'Off'),
				font:  this.game.fonts.normal,
				position: {
					x: 0, y: 72
				}
			});

			entity.bind('touch', function(entity) {
				settings.sound = settings.sound === true ? false : true;
				entity.setLabel('Sound: ' + (settings.sound === true ? 'On' : 'Off'));
			}, this);

			this.__settings.add(entity);

		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);

			this.__locked = false;


			var width   = this.game.settings.width;
			var height  = this.game.settings.height;

			var cache = this.__cache;
			cache.x = width / 2;
			cache.y = height / 2;
			this.__root.setPosition(cache);


			this.__input.bind('touch', this.__processTouch, this);
			this.__renderer.start();

		},

		leave: function() {

			this.__renderer.stop();
			this.__input.unbind('touch', this.__processTouch);

			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

			if (this.__root !== null) {
				this.__root.update(clock, delta);
			}

		},

		render: function(clock, delta) {

			this.__renderer.clear();

			if (this.__root !== null) {
				this.__renderer.renderUIArea(this.__root);
			}

			this.__renderer.flush();

		},

		__processTouch: function(id, position, delta) {

			if (this.__locked === true) return;


			var gameOffset = this.game.getOffset();

			position.x -= gameOffset.x;
			position.y -= gameOffset.y;


			this.__root.triggerChildren('touch', position);

		}

	};


	return Class;

});

