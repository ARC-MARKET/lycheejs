
lychee.define('lychee.ai.neat.Agent').includes([
	'lychee.ai.Agent'
]).requires([
	'lychee.ai.neat.Genome'
]).exports(function(lychee, global, attachments) {

	const _Agent  = lychee.import('lychee.ai.Agent');
	const _Genome = lychee.import('lychee.ai.neat.Genome');
	// const _Brain = lychee.import('lychee.ai.neat.Brain');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


//		settings.brain = settings.brain || new _Brain();

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
			data['constructor'] = 'lychee.ai.neat.Agent';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		crossover: function(agent) {

			agent = lychee.interfaceof(Composite, agent) ? agent : null;


			if (agent !== null) {

				let zw_genome = this.genome;
				let zz_genome = agent.genome;


				let genome1 = agent.fitness > this.fitness ? zz_genome : zw_genome;
				let genome2 = agent.fitness > this.fitness ? zw_genome : zz_genome;

				zz_genome = genome1;
				zw_genome = genome2;


				// TODO: zw0_brain
				let zw0_brain   = null;
				let genes       = [];
				let innovations = {};


				zw_genome.genes.forEach(function(gene2) {
					innovations[gene2.innovation] = gene2;
				});

				zz_genome.genes.forEach(function(gene1, g) {

					let gene2 = innovations[gene1.innovation] || null;
					let rand2 = Math.random();

					if (gene2 !== null && gene2.enabled === true && rand2 > 0.5) {
						genes.push(Object.assign({}, gene2));
					} else {
						genes.push(Object.assign({}, gene1));
					}

				});


				let max_neuron = Math.max(zz_genome.max_neuron, zw_genome.max_neuron);
				let zw0_agent  = new Composite({
					brain:  zw0_brain,
					genome: new _Genome({
						max_neuron: max_neuron,
						genes:      genes
					})
				});


				return zw0_agent;

			}

		}

	};


	return Composite;

});

