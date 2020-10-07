
lychee.define('game.Main').requires([
	'lychee.app.Flow',
	//	'game.state.Campaign',
	//	'game.state.Editor',
	'game.state.Game',
	'game.state.Menu'
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

			input: {
				delay:       0,
				key:         false,
				keymodifier: false,
				scroll:      false,
				swipe:       true,
				touch:       true
			},

			jukebox: {
				music: true,
				sound: true
			},

			renderer: {
				id:         'immune',
				width:      null,
				height:     null,
				background: '#444444'
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

			// this.setState('campaign', new _game.state.Campaign(this));
			// this.setState('editor',   new _game.state.Editor(this));
			this.setState('game',     new _game.state.Game(this));
			this.setState('menu',     new _game.state.Menu(this));


			this.changeState('menu');

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

