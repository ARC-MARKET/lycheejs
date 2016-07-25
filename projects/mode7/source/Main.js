
lychee.define('game.Main').requires([
	'lychee.Viewport',
	'game.Camera',
	'game.Compositor',
	'game.Renderer',
	'game.state.Game'
]).includes([
	'lychee.app.Main'
]).exports(function(lychee, global, attachments) {

	var _lychee    = lychee.import('lychee');
	var _game      = lychee.import('game');
	var _Main      = lychee.import('lychee.app.Main');
	var _Viewport  = lychee.import('lychee.Viewport');
	var _instances = [];



	/*
	 * FEATURE DETECTION
	 */

	(function(viewport) {

		viewport.bind('reshape', function(orientation, rotation, width, height) {

			if (_instances.length > 1) {

				var vp_width  = width / _instances.length;
				var vp_height = height;


				for (var i = 0, il = _instances.length; i < il; i++) {

					var main = _instances[i];
					if (main.viewport !== null) {

						main.renderer.setWidth(vp_width);
						main.renderer.setHeight(vp_height);

					}

				}

			}

		}, this);

	})(new _Viewport());



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		var settings = Object.assign({

			client: null,
			server: null,

			input:  {
				delay:       0,
				key:         false,
				keymodifier: false,
				touch:       false,
				swipe:       false
			},

			jukebox: {
				music: false,
				sound: false
			},

			renderer: {
				id:         'mode7-' + _instances.length,
				background: '#436026',
				width:      null,
				height:     null
			},

			viewport: {
				fullscreen: true
			}

		}, data);


		_Main.call(this, settings);

		_instances.push(this);



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function(oncomplete) {

			this.settings.gamerenderer = this.settings.renderer;
			this.settings.renderer     = null;

			oncomplete(true);

		}, this);

		this.bind('init', function() {

			var gamerenderer = this.settings.gamerenderer || null;
			if (gamerenderer !== null) {
				this.renderer = new _game.Renderer(gamerenderer);
			}

			this.camera     = new _game.Camera(this);
			this.compositor = new _game.Compositor(this);
			this.viewport.unbind('reshape');

			this.renderer.setCamera(this.camera);
			this.renderer.setCompositor(this.compositor);

			this.setState('game', new _game.state.Game(this));


			this.viewport.bind('reshape', function() {

				this.camera.reshape();
				this.compositor.reshape();

			}, this);


			this.changeState('game', { track: this.settings.track || 'valley' });

		}, this, true);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Main.prototype.serialize.call(this);
			data['constructor'] = 'game.Main';


			return data;

		}

	};


	return Composite;

});
