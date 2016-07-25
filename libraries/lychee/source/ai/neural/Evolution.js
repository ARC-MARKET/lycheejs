
lychee.define('lychee.ai.neural.Evolution').exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _get_genome = function(fitness) {

		var current = 0;
		var genome  = null;

		for (var p = 0; p < this.length; p++) {

			current += this[p].fitness;


			if (current >= fitness) {
				genome = this[p];
				break;
			}

		}


		return genome;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		var settings = Object.assign({}, data);


		this.fitness    = {
			total:   0,
			average: 0,
			best:    -Infinity,
			worst:   Infinity
		};
		this.population = 0;
		this.weights    = 0;


		this.__population = [];


		this.setWeights(settings.weights);

		this.setPopulation(settings.population);


		settings = null;

	};


	Composite.prototype = {

		/*
		 * LOGIC API
		 */

		update: function() {

			var oldpopulation = this.__population;
			var newpopulation = [];


			// 1. Sort Population by fitness

			oldpopulation.sort(function(a, b) {
				if (a.fitness < b.fitness) return -1;
				if (b.fitness > a.fitness) return  1;
				return 0;
			});


			// 2. Calculate Fitness statistics

			var fitness = this.fitness;

			fitness.total   = 0;
			fitness.average = 0;
			fitness.best    = -Infinity;
			fitness.worst   =  Infinity;

			oldpopulation.forEach(function(genome) {

				fitness.total += genome.fitness;
				fitness.best   = Math.max(fitness.best,  genome.fitness);
				fitness.worst  = Math.min(fitness.worst, genome.fitness);

			});

			fitness.average = fitness.total / oldpopulation.length;



			// 3. Fill the population with fittest genomes first

			var elite = (oldpopulation.length / 5) | 0;
			if (elite % 2 === 1) {
				elite++;
			}

			var survivors = oldpopulation.slice(oldpopulation.length - elite - 1, elite);
			if (survivors.length > 0) {
				newpopulation.push.apply(newpopulation, survivors);
			}


			// 4. Fill the population with random genome crossovers

			while (newpopulation.length < oldpopulation.length) {

				var zwgenome = _get_genome.call(oldpopulation, Math.random() * fitness.total);
				var zzgenome = _get_genome.call(oldpopulation, Math.random() * fitness.total);

				var babies = zwgenome.crossover(zzgenome);
				if (babies !== null) {

					babies[0].mutate();
					babies[1].mutate();

					newpopulation.push(babies[0]);
					newpopulation.push(babies[1]);

				}

			}


			this.__population = newpopulation;

		},



		/*
		 * CUSTOM API
		 */

		setPopulation: function(population) {

			population = typeof population === 'number' ? population : null;


			if (population !== null) {

				this.population   = population;
				this.__population = [];


				var weights = this.weights;

				for (var p = 0; p < population; p++) {
					this.__population.push(new _Genome(weights));
				}

				return true;

			}


			return false;

		},

		setWeights: function(weights) {

			weights = typeof weights === 'number' ? weights : null;


			if (weights !== null) {

				this.weights = weights;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

