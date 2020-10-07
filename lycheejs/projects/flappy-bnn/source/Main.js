
lychee.define('game.Main').requires([
	'game.state.Game'
]).includes([
	'lychee.app.Main'
]).exports((lychee, global, attachments) => {

	const _game = lychee.import('game');
	const _Main = lychee.import('lychee.app.Main');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({

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


		_Main.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('load', oncomplete => {
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


			let states = data['arguments'][0] || {};
			let blob   = data['blob'] || {};


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		}

	};


	return Composite;

});
