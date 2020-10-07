
lychee.define('game.ai.Agent').requires([
	'lychee.ai.bnn.Brain',
	'game.policy.Ball',
	'game.policy.Paddle'
]).includes([
	'lychee.ai.Agent'
]).exports((lychee, global, attachments) => {

	const _Agent  = lychee.import('lychee.ai.Agent');
	const _Ball   = lychee.import('game.policy.Ball');
	const _Brain  = lychee.import('lychee.ai.bnn.Brain');
	const _Paddle = lychee.import('game.policy.Paddle');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this._control = new _Paddle({
			entity: states.paddle,
			limit:  states.limit
		});

		this._sensor = new _Ball({
			entity: states.ball,
			limit:  states.limit
		});


		states.brain = new _Brain({
			sensors:  [
				this._sensor,
				this._control
			],
			controls: [
				this._control
			]
		});


		_Agent.call(this, states);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Agent.prototype.serialize.call(this);
			data['constructor'] = 'game.ai.Agent';

		},



		/*
		 * CUSTOM API
		 */

		reward: function(diff) {

			diff = typeof diff === 'number' ? (diff | 0) : 1;

			let training = {
				iterations: diff,
				inputs:     this.brain._inputs.slice(0),
				outputs:    this._sensor.sensor()
			};

			return _Agent.prototype.reward.call(this, diff, training);

		},

		punish: function(diff) {

			diff = typeof diff === 'number' ? (diff | 0) : 1;

			let training = {
				iterations: diff,
				inputs:     this.brain._inputs.slice(0),
				outputs:    this._sensor.sensor()
			};

			return _Agent.prototype.punish.call(this, diff, training);

		}

	};


	return Composite;

});

