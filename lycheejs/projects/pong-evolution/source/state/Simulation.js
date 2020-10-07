
lychee.define('game.state.Simulation').requires([
	'lychee.ui.entity.Button',
	'lychee.ui.entity.Label',
	'game.ai.Agent',
	'game.ai.Evolution',
	'game.app.sprite.Ball',
	'game.app.sprite.Paddle',
	'game.ui.sprite.Background'
]).includes([
	'lychee.app.State'
]).exports((lychee, global, attachments) => {

	const _Agent     = lychee.import('game.ai.Agent');
	const _Evolution = lychee.import('game.ai.Evolution');
	const _State     = lychee.import('lychee.app.State');
	const _BLOB      = attachments['json'].buffer;



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(main) {

		_State.call(this, main);


		this.__evolution = new _Evolution({
			population: 16
		});


		this.deserialize(_BLOB);


		// TODO: viewport reshape event

	};


	Composite.prototype = {

		/*
		 * STATE API
		 */

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			let renderer = this.renderer;
			let layer    = this.getLayer('ai');

			if (renderer !== null && layer !== null) {

				let evolution  = this.__evolution;
				let template   = this.getLayer('game-template');
				let population = evolution.cycle();


				console.log(population);

			}

		},

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'game.state.Simulation';


			return data;

		},

		enter: function(oncomplete) {

			return _State.prototype.enter.call(this, oncomplete);

		},

		leave: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			return _State.prototype.leave.call(this, oncomplete);

		},

		update: function(clock, delta) {

			_State.prototype.update.call(this, clock, delta);

		}

	};


	return Composite;

});

