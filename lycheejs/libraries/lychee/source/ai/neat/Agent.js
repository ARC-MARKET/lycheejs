
lychee.define('lychee.ai.neat.Agent').requires([
	'lychee.ai.neat.Brain',
	'lychee.ai.neat.Genome'
]).includes([
	'lychee.ai.Agent'
]).exports((lychee, global, attachments) => {

	const _Agent            = lychee.import('lychee.ai.Agent');
	const _Genome           = lychee.import('lychee.ai.neat.Genome');
	const _Brain            = lychee.import('lychee.ai.neat.Brain');
	const _MUTATION_BIAS    = 0.40;
	const _MUTATION_LINK    = 0.50;
	const _MUTATION_NODE    = 0.50;
	const _MUTATION_ENABLE  = 0.30;
	const _MUTATION_DISABLE = 0.40;



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		states.brain = states.brain || new _Brain();

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
			data['constructor'] = 'lychee.ai.neat.Agent';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		crossover: function(agent) {

			agent = lychee.interfaceof(Composite, agent) ? agent : null;


			if (agent !== null) {

				let zw_brain = null;
				let zz_brain = null;

				if (agent.fitness > this.fitness) {
					zw_brain = this.brain;
					zz_brain = agent.brain;
				} else {
					zw_brain = agent.brain;
					zz_brain = this.brain;
				}


				let zw_genes    = zw_brain.getGenes();
				let zz_genes    = zz_brain.getGenes();
				let zw0_genes   = [];
				let innovations = {};


				for (let z = 0, zl = zw_genes.length; z < zl; z++) {

					let gene2 = zw_genes[z];
					innovations[gene2.innovation] = gene2;

				}

				for (let z = 0, zl = zz_genes.length; z < zl; z++) {

					let gene1 = zz_genes[z];
					let gene2 = innovations[gene1.innovation] || null;
					let rand2 = Math.random();

					if (gene2 !== null && gene2.enabled === true && rand2 > 0.5) {
						zw0_genes.push(Object.assign({}, gene2));
					} else {
						zw0_genes.push(Object.assign({}, gene1));
					}

				}


				let zw0_agent = new Composite({
					brain: new _Brain({
						genes: zw0_genes
					})
				});


				return zw0_agent;

			}


			return null;

		},

		mutate: function() {

			for (let mid in this.__mutation) {

				if (Math.random() > 0.5) {
					this.__mutation[mid] *= 0.95;
				} else {
					this.__mutation[mid] *= 1.05263;
				}

			}


			if (Math.random() > 0.25) {
				// TODO: pointMutate(genome);
			}

			if (Math.random() > _MUTATION_LINK) {
				// TODO: linkMutate(genome, false);
			}

			if (Math.random() > _MUTATION_BIAS) {
				// TODO: linkMutate(genome, true);
			}


			if (Math.random() > _MUTATION_NODE) {
				// TODO: nodeMutate(genome);
			}

			if (Math.random() > _MUTATION_ENABLE) {
				// TODO: Find an enabled gene and disable it
			}

			if (Math.random() > _MUTATION_DISABLE) {
				// TODO: Find a disabled gene and enable it
			}


			return false;

		},

		reward: function(diff, training) {

			diff     = typeof diff === 'number'   ? Math.abs(diff | 0) : 1;
			training = training instanceof Object ? training           : null;


			this.fitness += diff;

			if (training !== null) {

				// XXX: No Reinforcement Learning

				return true;

			}


			return false;

		},

		punish: function(diff, training) {

			diff     = typeof diff === 'number'   ? Math.abs(diff | 0) : 1;
			training = training instanceof Object ? training           : null;


			this.fitness -= diff;

			if (training !== null) {

				// XXX: No Reinforcement Learning

				return true;

			}


			return false;

		}

	};


	return Composite;

});

