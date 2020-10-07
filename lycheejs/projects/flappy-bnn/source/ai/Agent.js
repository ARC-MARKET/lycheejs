
lychee.define('game.ai.Agent').requires([
	'lychee.ai.enn.Brain',
	'game.policy.Control',
	'game.policy.Position'
]).includes([
	'lychee.ai.enn.Agent'
]).exports((lychee, global, attachments) => {

	const _Agent    = lychee.import('lychee.ai.enn.Agent');
	const _Control  = lychee.import('game.policy.Control');
	const _Position = lychee.import('game.policy.Position');
	const _Brain    = lychee.import('lychee.ai.enn.Brain');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this._control = new _Control({
			entity: states.plane,
			target: states.goal
		});

		this._sensor = new _Position({
			entity: states.goal,
			limit:  states.limit
		});


		states.brain = new _Brain({
			sensors:  [
				new _Position({
					entity: states.plane,
					limit:  states.limit
				}),
				this._sensor
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
				outputs:    this._control.sensor()
			};

			return _Agent.prototype.reward.call(this, diff, training);

		},

		punish: function(diff) {

			diff = typeof diff === 'number' ? (diff | 0) : 1;


			let training = {
				iterations: diff,
				inputs:     this.brain._inputs.slice(0),
				outputs:    this._control.sensor()
			};

			return _Agent.prototype.punish.call(this, diff, training);

		}

	};


	return Composite;

});

