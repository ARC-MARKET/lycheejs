
lychee.define('game.ai.Evolution').requires([
	'game.ai.Agent'
]).exports((lychee, global, attachments) => {

	const _Agent = lychee.import('game.ai.Agent');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.generations = [];
		this.history     = 4;
		this.population  = 16;


		this.setGenerations(states.generations);
		this.setHistory(states.history);
		this.setPopulation(states.population);

		states = null;

	};


	Composite.prototype = {

		// deserialize: function(blob) {},

		serialize: function() {

			let states = {};


			if (this.generations.length === 0) states.generations = this.generations;
			if (this.history !== 4)            states.history     = this.history;
			if (this.population !== 16)        states.population  = this.population;


			return {
				'constructor': 'game.ai.Evolution',
				'arguments':   [ states ],
				'blob':        null
			};

		},



		/*
		 * CUSTOM API
		 */

		cycle: function() {

			let generations  = this.generations;
			let population   = [];
			let s_history    = this.history;
			let s_population = this.population;


			// No Generations available
			// - fast route, just generate a new plain one

			if (generations.length === 0) {

				for (let p = 0; p < s_population; p++) {

					// New Population
					// - each Agent's brain is random by default

					population.push(new _Agent());

				}

			} else {

				// Sort the current Population
				// - Higher fitness first (to 0)
				// - Lower fitness last (to length - 1)

				let current        = generations[generations.length - 1];
				let old_population = current.sort((agent_a, agent_b) => {
					if (agent_a.fitness > agent_b.fitness) return -1;
					if (agent_a.fitness < agent_b.fitness) return  1;
					return 0;
				});


				let amount = (0.25 * s_population);

				// 25% Mutant Population
				// - new Agent() leads to randomized Brain
				for (let m = 0; m < amount; m++) {
					population.push(new _Agent());
				}


				// 25% Survivor Population
				// - Agent.clone() leads to unlinked clone
				// - this avoids coincidence of 1 Agent leading to multiple Entities

				for (let s = 0; s < amount; s++) {

					let agent = current[s];
					let clone = agent.clone();

					population.push(clone);

				}


				// 50% Breed Population
				// - best Agent by fitness can now breed
				// - Babies are the ones from dominant population

				for (let b = 0; b < amount; b++) {

					let mum = old_population[b];
					let dad = old_population[b + 1];


					let babies = mum.crossover(dad);

					population.push(babies[0]);
					population.push(babies[1]);

				}

			}


			// Track the Population
			// - just for the sake of Debugging, tbh.

			generations.push(population);


			// Optionally track more Generations
			// - in case something goes wrong
			// - set settings.history to higher value

			if (generations.length > s_history) {
				generations.splice(0, generations.length - s_history);
			}


			return population;

		},

		setGenerations: function(generations) {

			generations = generations instanceof Array ? generations : null;


			if (generations !== null) {

				this.generations = generations.map(population => population.filter(agent => agent instanceof _Agent));

				return true;

			}


			return false;

		},

		setHistory: function(history) {

			history = typeof history === 'number' ? history : null;


			if (history !== null) {

				this.history = history;

				return true;

			}


			return false;

		},

		setPopulation: function(population) {

			population = typeof population === 'number' ? population : null;


			if (population !== null) {

				this.population = population;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

