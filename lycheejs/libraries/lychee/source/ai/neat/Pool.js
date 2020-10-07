
lychee.define('lychee.ai.neat.Pool').exports((lychee, global, attachments) => {

	// XXX: Only a Cache Struct
	const _Species = function() {

		this.topFitness = 0;
		this.staleness = 0;
		this.genomes = [];
		this.averageFitness = 0;

	};

	const Composite = function(data) {

		let states = Object.assign({}, data);

		this.species = [];
		this.generation = 0;
		this.innovation = 1000000;
		this.currentSpecies = 1;
		this.currentGenome = 1;
		this.currentFrame = 0;
		this.maxFitness = 0;

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'lychee.ai.neat.Pool',
				'arguments':   []
			};

		}

	};


	return Composite;

});

