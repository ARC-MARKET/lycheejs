
lychee.define('lychee.ai.Agent').exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	const _validate_brain = function(brain) {

		if (brain instanceof Object) {

			if (typeof brain.update === 'function' && typeof brain.setControls === 'function' && typeof brain.setSensors === 'function') {

				return true;

			}

		}


		return false;

	};

	const _train_brain = function() {

		let brain = this.brain;
		if (brain !== null) {

			let trainings = this.trainings;

			for (let t = 0, tl = trainings.length; t < tl; t++) {

				let training   = trainings[t];
				let iterations = training.iterations || 1;

				for (let i = 0; i < iterations; i++) {
					brain.learn(training.inputs, training.outputs);
				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.alive     = true;
		this.brain     = null;
		this.fitness   = 0;
		this.trainings = [];


		this.setAlive(settings.alive);
		this.setBrain(settings.brain);
		this.setFitness(settings.fitness);


		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			let brain = lychee.deserialize(blob.brain);
			if (brain !== null) {
				this.setBrain(brain);
			}

			if (blob.trainings instanceof Array) {
				this.trainings = blob.trainings.map(lychee.deserialize);
			}

		},

		serialize: function() {

			let settings = {};
			let blob     = {};


			if (this.fitness !== 0) settings.fitness = this.fitness;


			if (this.brain !== null)       blob.brain     = lychee.serialize(this.brain);
			if (this.trainings.length > 0) blob.trainings = this.trainings.map(lychee.serialize);


			return {
				'constructor': 'lychee.ai.Agent',
				'arguments':   [ settings ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		update: function(clock, delta) {

			let brain = this.brain;
			if (brain !== null) {
				brain.update(clock, delta);
			}

		},



		/*
		 * CUSTOM API
		 */

		crossover: function(agent) {

			agent = agent instanceof Composite ? agent : null;


			if (agent !== null) {

				// XXX: This is implemented by AI Agents

				let zw_agent = lychee.deserialize(lychee.serialize(this));
				let zz_agent = lychee.deserialize(lychee.serialize(agent));

				return [ zw_agent, zz_agent ];

			}


			return null;

		},

		reward: function(diff, training) {

			diff     = typeof diff === 'number'   ? Math.abs(diff | 0) : 1;
			training = training instanceof Object ? training           : null;


			this.fitness += diff;


			if (training !== null) {

				training.iterations = diff;
				this.trainings.push(training);
				_train_brain.call(this);

			}

		},

		punish: function(diff, training) {

			diff     = typeof diff === 'number'   ? Math.abs(diff | 0) : 1;
			training = training instanceof Object ? training           : null;


			this.fitness -= diff;


			if (training !== null) {

				training.iterations = diff;
				this.trainings.push(training);
				_train_brain.call(this);

			}

		},

		setAlive: function(alive) {

			if (alive === true || alive === false) {

				this.alive = alive;

				return true;

			}


			return false;

		},

		setBrain: function(brain) {

			brain = _validate_brain(brain) === true ? brain : null;


			if (brain !== null) {

				this.brain = brain;

				return true;

			}


			return false;

		},

		setFitness: function(fitness) {

			fitness = typeof fitness === 'number' ? (fitness | 0) : null;


			if (fitness !== null) {

				this.fitness = fitness;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

