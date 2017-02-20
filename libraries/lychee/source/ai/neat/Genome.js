
lychee.define('lychee.ai.neat.Genome').exports(function(lychee, global, attachments) {

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


	let Composite = function(data) {

		this.genes   = [];
		this.fitness = 0;
		this.adjustFitness = 0;
		this.network = {}; // XXX: What is this?
		this.maxneuron = 0;
		this.globalRank = 0;


	};


	Composite.prototype = {

		copyGenome: function() {

			let clone = new Composite();

			clone.genes     = this.genes.map(gene => gene.copyGene());
			clone.maxneuron = this.maxneuron;


			return clone;

		},

		crossoverGenome: function(other) {

			// XXX: Implemented as agent.crossover(other)

		},

		generateNetwork: function(inputs, outputs) {

			let network = {};

			network.neurons = {};

			inputs.forEach(function(input, i) {
				network.neurons[i] = new _Neuron();
			});

			outputs.forEach(function(output, o) {
				network.neurons[_MAX_NODES + o] = new _Neuron();
			});


			this.genes.sort(function(a, b) {

				// XXX: Min values are first

				if (a.out < b.out) return -1;
				if (a.out > b.out) return  1;
				return 0;

			});

			this.genes.forEach(function(gene) {

				if (gene.enabled === true) {

					let neuron = network.neurons[gene.out] || null;
					if (neuron === null) {
						neuron = network.neurons[gene.out] = new _Neuron();
					}

					let neuron2 = network.neurons[gene.into] || null;
					if (neuron2 === null) {
						neuron.incoming.push(gene);
						neuron2 = network.neurons[gene.into] = new _Neuron();
					}

				}

			});

			this.network = network;

		},

		evaluateNetwork: function(inputs, outputs) {


			/*
			 * relative position to player perspective
			 * (input is a matrix array)
			 *
			 * input value = -1 for sprites
			 * input value =  1 for tiles (colliding objects)
			 * input value =  0 for free tiles
			 */


			let network = this.network;

			// XXX: WHAT THE FUCK?
			inputs.push(1);

			inputs.forEach(function(input, i) {
				network.neurons[i].value = input;
			});

			network.neurons.forEach(function(neuron, n) {

				let sum = 0;

				neuron.incoming.forEach(function(incoming) {
					let other = network.neurons[incoming.into];
					sum = sum + incoming.weight * other.value;
				});

				if (neuron.incoming.length > 0) {
					neuron.value = _sigmoid(sum);
				}

			});


			outputs.forEach(function(output, o) {

				let neuron = network.neurons[_MAX_NODES + o] || null;
				if (neuron !== null) {
					outputs.push(neuron.value);
				}

			});

			return outputs;

		},

		randomNeuron: function(nonInput, inputs, outputs) {

			let neurons = [];

			if (nonInput === false) {

				inputs.forEach(function(input, i) {
					neurons.push(i);
				});

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

			outputs.forEach(function(output, o) {
				neurons.push(_MAX_NODES + o);
			});


			let neuron = neurons[(Math.random() * neurons.length) | 0] || null;
			if (neuron === null) {
				return neurons[0];
			}

			return neuron;

		}

	};


	return Composite;

});

