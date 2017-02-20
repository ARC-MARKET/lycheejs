
lychee.define('game.ai.Agent').requires([
	'lychee.ai.bnn.Brain',
	'game.policy.Ball',
	'game.policy.Paddle'
]).includes([
	'lychee.ai.Agent'
]).exports(function(lychee, global, attachments) {

	const _Agent  = lychee.import('lychee.ai.Agent');
	const _Ball   = lychee.import('game.policy.Ball');
	const _Brain  = lychee.import('lychee.ai.bnn.Brain');
	const _Paddle = lychee.import('game.policy.Paddle');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		let sensors  = [];
		let controls = [];
		let ball     = new _Ball({
			entity: settings.ball,
			limit:  settings.limit
		});
		let paddle   = new _Paddle({
			entity: settings.paddle,
			limit:  settings.limit
		});


		sensors.push(ball);
		sensors.push(paddle);
		controls.push(paddle);
		this.__expected = ball;


		settings.brain = new _Brain({
			sensors:  sensors,
			controls: controls
		});


		_Agent.call(this, settings);

		settings = null;

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
				outputs:    this.__expected.sensor()
			};

			return _Agent.prototype.reward.call(this, diff, training);

		},

		punish: function(diff) {

			diff = typeof diff === 'number' ? (diff | 0) : 1;

			let training = {
				iterations: diff,
				inputs:     this.brain._inputs.slice(0),
				outputs:    this.__expected.sensor()
			};

			return _Agent.prototype.punish.call(this, diff, training);

		}

	};


	return Composite;

});

