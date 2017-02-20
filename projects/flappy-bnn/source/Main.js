
lychee.define('game.Main').requires([
	'game.state.Game'
]).includes([
	'lychee.app.Main'
]).exports(function(lychee, global, attachments) {

	const _game = lychee.import('game');
	const _Main = lychee.import('lychee.app.Main');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({

			client:  null,
			input:   null,
			server:  null,
			stash:   null,
			storage: null,

			jukebox: {
				music: false,
				sound: true
			},

			renderer: {
				width:  1024,
				height: 512
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
			oncomplete(true);
		}, this, true);

		this.bind('init', function() {

			let viewport = this.viewport || null;
			if (viewport !== null) {
				// viewport.unbind('hide');
				// viewport.unbind('show');
			}


			this.setState('game', new _game.state.Game(this));
			this.changeState('game');

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


			return data;

		}

	};


	return Composite;

});
