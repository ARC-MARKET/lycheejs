
lychee.define('lychee.ai.enn.Agent').requires([
	'lychee.ai.enn.Brain',
	'lychee.ai.enn.Genome'
]).includes([
	'lychee.ai.Agent'
]).exports((lychee, global, attachments) => {

	const _Agent          = lychee.import('lychee.ai.Agent');
	const _Brain          = lychee.import('lychee.ai.enn.Brain');
	const _Genome         = lychee.import('lychee.ai.enn.Genome');
	const _MUTATION_RANGE = 0.25;
	const _MUTATION_RATE  = 0.1;



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.genome = null;


		states.brain  = states.brain  || new _Brain();
		states.genome = states.genome || new _Genome();

		_Agent.call(this, states);


		this.setGenome(states.genome);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Agent.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ai.enn.Agent';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		crossover: function(agent) {

			agent = lychee.interfaceof(Composite, agent) ? agent : null;


			if (agent !== null) {

				let zw_brain  = this.brain;
				let zw_genome = this.genome;
				let zz_brain  = agent.brain;
				let zz_genome = agent.genome;


				if (zw_brain !== null && zz_brain !== null) {
					zw_genome.setGene('weights', zw_brain.getWeights());
					zz_genome.setGene('weights', zz_brain.getWeights());
				}


				let zw_dna = zw_genome.getGene('weights');
				let zz_dna = zz_genome.getGene('weights');

				if (zw_dna.length === zz_dna.length) {

					let zw0_dna   = [];
					let zw1_dna   = [];
					let dna_split = (Math.random() * zw_dna.length) | 0;


					for (let d = 0, dl = zw_dna.length; d < dl; d++) {

						if (d <= dna_split) {
							zw0_dna.push(zw_dna[d]);
							zw1_dna.push(zz_dna[d]);
						} else {
							zw0_dna.push(zz_dna[d]);
							zw1_dna.push(zw_dna[d]);
						}


						if (Math.random() <= _MUTATION_RATE) {
							zw0_dna[d] += (Math.random() * _MUTATION_RANGE * 2) - _MUTATION_RANGE;
						}

						if (Math.random() <= _MUTATION_RATE) {
							zw1_dna[d] += (Math.random() * _MUTATION_RANGE * 2) - _MUTATION_RANGE;
						}

					}


					let zw0_brain = null;
					let zw1_brain = null;

					if (zw_brain !== null && zz_brain !== null) {

						zw0_brain = lychee.deserialize(lychee.serialize(zw_brain));
						zw0_brain.setWeights(zw0_dna);

						zw1_brain = lychee.deserialize(lychee.serialize(zz_brain));
						zw1_brain.setWeights(zw1_dna);

					}


					let zw0_genome = lychee.deserialize(lychee.serialize(zw_genome));
					let zw1_genome = lychee.deserialize(lychee.serialize(zz_genome));

					zw0_genome.setGene('weights', zw0_dna);
					zw1_genome.setGene('weights', zw1_dna);

					let zw0_baby = new Composite({ brain: zw0_brain, genome: zw0_genome });
					let zw1_baby = new Composite({ brain: zw1_brain, genome: zw1_genome });


					return [ zw0_baby, zw1_baby ];

				}

			}


			return null;

		},

		setGenome: function(genome) {

			genome = genome instanceof _Genome ? genome : null;


			if (genome !== null) {

				this.genome = genome;


				let brain = this.brain;
				if (brain !== null) {

					let gene = genome.getGene('weights');
					if (gene !== null && gene.length > 0) {

						brain.setWeights(gene);

					} else {

						genome.setGene('weights', brain.getWeights());

					}

				}


				return true;

			}


			return false;

		}


	};


	return Composite;

});

