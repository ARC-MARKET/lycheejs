
lychee.define('lychee.ai.neat.Brain').exports((lychee, global, attachments) => {

	const _MAX_NODES = 8192;



	/*
	 * HELPERS
	 */

	const _validate_gene = function(gene) {

		if (gene instanceof Object) {

			if (
				typeof gene['in'] === 'number'
				&& typeof gene['out'] === 'number'
				&& typeof gene.enabled === 'boolean'
				&& typeof gene.innovation === 'number'
			) {

				return true;

			}

		}

		return false;

	};

	const _random = function() {
		return (Math.random() * 2) - 1;
	};

	const _sigmoid = function(value) {
		return (1 / (1 + Math.exp((-1 * value) / 1)));
	};

	const _init_network = function() {

		let input_size  = this.__sensors_map.reduce((a, b) => a + b, 0);
		let output_size = this.__controls_map.reduce((a, b) => a + b, 0);

		if (input_size === 0 || output_size === 0) {
			return;
		}


		let genes       = this.genes;
		let neurons     = {};
		let neuron_size = 0;

		for (let i = 0; i < input_size; i++) {

			neurons[i] = {
				incoming: [],
				value:    0.0
			};

			neuron_size++;

		}


		for (let o = 0; o < output_size; o++) {

			neurons[_MAX_NODES + o] = {
				incoming: [],
				value:    0.0
			};

			neuron_size++;

		}


		genes.sort((a, b) => {
			if (a.out < b.out) return -1;
			if (a.out > b.out) return  1;
			return 0;
		});


		for (let g = 0, gl = genes.length; g < gl; g++) {

			let gene = genes[g];
			if (gene.enabled === true) {

				let neuron1 = neurons[gene['out']] || null;
				if (neuron1 === null) {

					neuron1 = neurons[gene['out']] = {
						incoming: [],
						value:    0.0
					};

					neuron_size++;

				}

				let neuron2 = neurons[gene['in']] || null;
				if (neuron2 === null) {

					neuron1.incoming.push(gene);
					neuron2 = neurons[gene['in']] = {
						incoming: [],
						value:    0.0
					};

					neuron_size++;

				}

			}

		}


		this.__neurons     = neurons;
		this.__size.neuron = neuron_size;
		this.__size.input  = input_size;
		this.__size.output = output_size;


		this._inputs  = null;
		this._outputs = null;

		this._inputs  = new Array(input_size);
		this._outputs = new Array(output_size);

	};

	const _update_network = function(inputs, outputs) {

		let neurons = this.__neurons;


		for (let i = 0, il = inputs.length; i < il; i++) {
			neurons[i].value = inputs[i];
		}


		let neuron_ids = Object.keys(this.__neurons).sort();
		if (neuron_ids.length > 0) {

			for (let n = 0, nl = neuron_ids.length; n < nl; n++) {

				let neuron = neurons[neuron_ids[n]];
				if (neuron.incoming.length > 0) {

					let value = 0;

					for (let i = 0, il = neuron.incoming.length; i < il; i++) {

						let gene  = neuron.incoming[i];
						let other = neurons[gene['in']];

						value += gene.weight * other.value;

					}

					neuron.value = _sigmoid(value);

				}

			}

		}


		for (let o = 0, ol = outputs.length; o <= ol; o++) {

			let neuron = neurons[_MAX_NODES + o] || null;
			if (neuron !== null) {
				outputs[o] = neuron.value;
			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.controls = [];
		this.sensors  = [];
		this.genes    = [];

		this.__controls_map = [];
		this.__neurons      = {};
		this.__sensors_map  = [];

		// cache structures
		this._inputs  = [];
		this._outputs = [];
		this.__size   = {
			input:  0,
			output: 0,
			neuron: 0
		};


		this.setSensors(states.sensors);
		this.setControls(states.controls);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.neurons instanceof Object) {
				this.__neurons = lychee.deserialize(blob.neurons);
			}

			if (blob.size instanceof Object) {
				this.__size = lychee.deserialize(blob.size);
			}

		},

		serialize: function() {

			let states = {};
			let blob   = {};


			if (this.controls.length > 0) states.controls = lychee.serialize(this.controls);
			if (this.sensors.length > 0)  states.sensors  = lychee.serialize(this.sensors);


			if (Object.keys(this.__neurons).length > 0) {
				blob.neurons = lychee.serialize(this.__neurons);
			}

			if (this.__size.input !== 0 || this.__size.output !== 0) {
				blob.size = lychee.serialize(this.__size);
			}


			return {
				'constructor': 'lychee.ai.neat.Brain',
				'arguments':   [ states ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		update: function(clock, delta) {

			let controls     = this.controls;
			let controls_map = this.__controls_map;
			let sensors      = this.sensors;
			let inputs       = this._inputs;
			let outputs      = this._outputs;


			// 1. Transform Policies to Inputs
			for (let i = 0, s = 0, sl = sensors.length; s < sl; s++) {

				let sensor = sensors[s];
				let values = sensor.sensor();

				for (let v = 0, vl = values.length; v < vl; v++) {
					inputs[i++] = values[v];
				}

			}


			// 2. Update Network
			_update_network.call(this, inputs, outputs);


			// 3. Transform Outputs to Policies
			let offset = 0;

			for (let c = 0, cl = controls_map.length; c < cl; c++) {

				let control = controls[c];
				let length  = controls_map[c];
				let values  = outputs.slice(offset, length);

				if (values.length > 0) {
					control.control(values);
				}

				offset += length;

			}

		},



		/*
		 * CUSTOM API
		 */

		learn: function(inputs, outputs) {

			inputs  = inputs instanceof Array  ? inputs  : null;
			outputs = outputs instanceof Array ? outputs : null;


			if (inputs !== null && outputs !== null) {

				// TODO: Backpropagation

				return true;

			}


			return false;

		},

		setControls: function(controls) {

			controls = controls instanceof Array ? controls : null;


			if (controls !== null) {

				this.controls = controls;

				this.__controls_map = controls.map(control => (control.sensor() || [ 1 ]).length);

				let size = this.__controls_map.reduce((a, b) => a + b, 0);
				if (size !== this.__size.output) {
					_init_network.call(this);
				}


				return true;

			}


			return false;

		},

		setSensors: function(sensors) {

			sensors = sensors instanceof Array ? sensors : null;


			if (sensors !== null) {

				this.sensors = sensors;

				this.__sensors_map = sensors.map(sensor => (sensor.sensor() || [ 1 ]).length);

				let size = this.__sensors_map.reduce((a, b) => a + b, 0);
				if (size !== this.__size.input) {
					_init_network.call(this);
				}


				return true;

			}


			return false;

		},

		getGenes: function() {

			let genes = [];

			for (let g = 0, gl = this.genes.length; g < gl; g++) {
				genes.push(this.genes[g]);
			}

			return genes;

		},

		setGenes: function(genes) {

			genes = genes instanceof Array ? genes : null;


			if (genes !== null) {

				this.genes = genes.filter(gene => _validate_gene(gene));

				_init_network.call(this);


				return true;

			}


			return false;

		}

	};


	return Composite;

});

