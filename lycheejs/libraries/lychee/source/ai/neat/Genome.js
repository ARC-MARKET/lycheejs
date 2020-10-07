
lychee.define('lychee.ai.neat.Genome').exports((lychee, global, attachments) => {

	const _MAX_NODES     = 1000000;
	const _MUTATION_RATE = {
		bias:        0.4,
		connections: 0.25,
		links:       2.0,
		nodes:       0.5,
		steps:       0.1,
		// XXX: WTF?
		enable:      0.5,
		disable:     0.2
	};

	const _sigmoid = function(x) {
		return 2 / (1 + Math.exp(-4.9 * x)) - 1;
	};

	const _Neuron = function() {

		this.incoming = [];
		this.value    = 0.0;

	};


	const Composite = function(data) {

		let states = Object.assign({}, data);

		this.genes   = [];
		this.fitness = 0;
		// this.network = {};
		this.globalRank = 0;


		this.setGenes(states.genes);
		this.setFitness(states.fitness);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'constructor': 'lychee.ai.neat.Genome',
				'arguments':   []
			};

		},



		/*
		 * CUSTOM API
		 */

		clone: function() {

			return new Composite({
				genes: this.genes.map(lychee.serialize)
			});

		},

		randomNeuron: function(input, inputs, outputs) {

			input   = input === true;
			inputs  = inputs instanceof Array  ? inputs  : null;
			outputs = outputs instanceof Array ? outputs : null;


			let neurons = [];

			if (input === true) {

				inputs.forEach((input, i) => neurons.push(i));

				this.genes.forEach(gene => {

					if (neurons.indexOf(gene.into) === -1) {
						neurons.push(gene.into);
					}

					if (neurons.indexOf(gene.out) === -1) {
						neurons.push(gene.out);
					}

				});

			} else {

				this.genes.forEach(gene => {

					if (neurons.indexOf(gene.into) === -1 && gene.into > inputs.length) {
						neurons.push(gene.into);
					}

					if (neurons.indexOf(gene.out) === -1 && gene.out > inputs.length) {
						neurons.push(gene.out);
					}

				});

			}

			outputs.forEach((output, o) => neurons.push(_MAX_NODES + o));


			let neuron = neurons[(Math.random() * neurons.length) | 0] || null;
			if (neuron === null) {
				return neurons[0];
			}

			return neuron;

		}

	};


	return Composite;

});

