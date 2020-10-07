
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
			server:  null,
			stash:   null,
			storage: null,

			input: {
				delay:       0,
				key:         false,
				keymodifier: false,
				touch:       true,
				swipe:       false
			},

			jukebox: {
				music: true,
				sound: true
			},

			renderer: {
				width:  640,
				height: 480
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
		}, this);

		this.bind('init', function() {

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
