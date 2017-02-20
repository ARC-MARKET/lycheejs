
lychee.define('lychee.ai.bnn.Brain').exports(function(lychee, global, attachments) {

	const _LEARNING_RATE     = 0.3;
	const _LEARNING_MOMENTUM = 0.9;



	/*
	 * HELPERS
	 */

	const _random = function() {
		return (Math.random() * 2) - 1;
	};

	const _sigmoid = function(value) {
		return (1 / (1 + Math.exp((-1 * value) / 1)));
	};

	const _init_network = function() {

		let input_size = this.__sensors_map.reduce(function(a, b) {
			return a + b;
		}, 0);

		let output_size = this.__controls_map.reduce(function(a, b) {
			return a + b;
		}, 0);


		if (input_size === 0 || output_size === 0) {
			return;
		}


		let layers_size = 3;
		let hidden_size = 1;
		let weight_size = 0;

		if (input_size > output_size) {
			hidden_size = input_size;
			layers_size = Math.max(input_size - output_size, 3);
		} else {
			hidden_size = output_size;
			layers_size = Math.max(output_size - input_size, 3);
		}


		for (let l = 0; l < layers_size; l++) {

			let prev = hidden_size;
			let size = hidden_size;

			if (l === 0) {
				prev = 0;
				size = input_size;
			} else if (l === 1) {
				prev = input_size;
				size = hidden_size;
			} else if (l === layers_size - 1) {
				prev = hidden_size;
				size = output_size;
			}


			let layer = new Array(size);

			for (let n = 0, nl = layer.length; n < nl; n++) {

				let neuron = {
					bias:    1,
					delta:   0,
					value:   _random(),
					history: [],
					weights: []
				};

				for (let p = 0; p < prev; p++) {
					neuron.history.push(0);
					neuron.weights.push(_random());
				}

				layer[n] = neuron;

			}

			this.__layers[l]  = layer;
			weight_size      += layer.length * 2;

		}


		this.__size.input  = input_size;
		this.__size.hidden = hidden_size;
		this.__size.output = output_size;
		this.__size.weight = weight_size;

		this._inputs  = null;
		this._outputs = null;

		this._inputs  = new Array(input_size);
		this._outputs = new Array(output_size);

	};

	const _update_network = function(inputs, outputs) {

		let layers = this.__layers;


		// Update Input Layer
		let input_layer = layers[0];

		for (let il = 0, ill = input_layer.length; il < ill; il++) {
			input_layer[il].value = inputs[il];
		}


		// Update Hidden Layers
		let prev_layer = layers[0];

		for (let l = 1, ll = layers.length; l < ll; l++) {

			let current_layer = layers[l];

			for (let n = 0, nl = current_layer.length; n < nl; n++) {

				let neuron = current_layer[n];
				let value  = 0;

				for (let p = 0, pl = prev_layer.length; p < pl; p++) {
					value += prev_layer[p].value * neuron.weights[p];
				}

				value        += neuron.bias;
				neuron.value  = _sigmoid(value);

			}

			prev_layer = current_layer;

		}


		// Update Output Layer
		let output_layer = layers[layers.length - 1];

		for (let o = 0, ol = output_layer.length; o < ol; o++) {
			outputs[o] = output_layer[o].value;
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.controls = [];
		this.sensors  = [];

		this.__controls_map = [];
		this.__layers       = [];
		this.__sensors_map  = [];

		// cache structures
		this._inputs  = [];
		this._outputs = [];
		this.__size   = {
			input:  0,
			hidden: 0,
			output: 0,
			weight: 0
		};


		this.setSensors(settings.sensors);
		this.setControls(settings.controls);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.layers instanceof Array) {
				this.__layers = lychee.deserialize(blob.layers);
			}

			if (blob.size instanceof Object) {
				this.__size = lychee.deserialize(blob.size);
			}

		},

		serialize: function() {

			let settings = {};
			let blob     = {};


			if (this.controls.length > 0) settings.controls = lychee.serialize(this.controls);
			if (this.sensors.length > 0)  settings.sensors  = lychee.serialize(this.sensors);


			if (this.__layers.length > 0) {
				blob.layers = lychee.serialize(this.__layers);
			}

			if (this.__size.input !== 0 || this.__size.output !== 0) {
				blob.size = lychee.serialize(this.__size);
			}


			return {
				'constructor': 'lychee.ai.bnn.Brain',
				'arguments':   [ settings ],
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
				let values  = [].slice.call(outputs, offset, length);

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

				let layers = this.__layers;


				// 1. Update Network
				_update_network.call(this, inputs, this._outputs);


				// 2. Calculate gradient for Output Layer
				let output_layer = layers[layers.length - 1];

				for (let o = 0, ol = output_layer.length; o < ol; o++) {

					let neuron = output_layer[o];
					let value  = neuron.value;

					neuron.delta = value * (1 - value) * (outputs[o] - value);

				}


				// 3. Calculate gradients for Hidden Layers and Input Layer
				for (let l = layers.length - 2; l >= 0; l--) {

					let current_layer = layers[l];
					let next_layer    = layers[l + 1];

					for (let c = 0, cl = current_layer.length; c < cl; c++) {

						let neuron = current_layer[c];
						let value  = neuron.value;
						let error  = 0.0;

						for (let n = 0, nl = next_layer.length; n < nl; n++) {
							let next_neuron = next_layer[n];
							error += next_neuron.weights[c] * next_neuron.delta;
						}

						neuron.delta = value * (1 - value) * error;

					}

				}


				// 4. Calculate weights for Input Layer
				let input_layer = layers[0];

				for (let i = 0, il = input_layer.length; i < il; i++) {

					let neuron = input_layer[i];

					neuron.bias += _LEARNING_RATE * neuron.delta;


					for (let w = 0, wl = neuron.weights.length; w < wl; w++) {
						let delta = _LEARNING_RATE * neuron.delta * inputs[w];
						neuron.weights[w] += delta + _LEARNING_MOMENTUM * neuron.history[w];
						neuron.history[w]  = delta;
					}

				}


				// 5. Calculate weights for Hidden Layers and Output Layer
				for (let l = 1, ll = layers.length; l < ll; l++) {

					let current_layer = layers[l];
					let prev_layer    = layers[l - 1];

					for (let c = 0, cl = current_layer.length; c < cl; c++) {

						let neuron = current_layer[c];

						neuron.bias += _LEARNING_RATE * neuron.delta;


						for (let w = 0, wl = neuron.weights.length; w < wl; w++) {
							let delta = _LEARNING_RATE * neuron.delta * prev_layer[w].value;
							neuron.weights[w] += delta + _LEARNING_MOMENTUM * neuron.history[w];
							neuron.history[w]  = delta;
						}

					}

				}


				return true;

			}


			return false;

		},

		setControls: function(controls) {

			controls = controls instanceof Array ? controls : null;


			if (controls !== null) {

				this.controls = controls;

				this.__controls_map = controls.map(function(control) {
					return (control.sensor() || [ 1 ]).length;
				});


				let size = this.__controls_map.reduce(function(a, b) {
					return a + b;
				}, 0);

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

				this.__sensors_map = sensors.map(function(sensor) {
					return (sensor.sensor() || [ 1 ]).length;
				});


				let size = this.__sensors_map.reduce(function(a, b) {
					return a + b;
				}, 0);

				if (size !== this.__size.input) {
					_init_network.call(this);
				}


				return true;

			}


			return false;

		},

		getWeights: function() {

			let layers  = this.__layers;
			let weights = [];


			for (let l = 0, ll = layers.length; l < ll; l++) {

				let layer = layers[l];

				for (let n = 0, nl = layer.length; n < nl; n++) {

					let neuron = layer[n];
					if (neuron.weights.length !== 0) {

						for (let w = 0, wl = neuron.weights.length; w < wl; w++) {
							weights.push(neuron.history[w]);
							weights.push(neuron.weights[w]);
						}

					}

				}

			}


			this.__size.weight = weights.length;


			return weights;

		},

		setWeights: function(weights) {

			weights = weights instanceof Array ? weights : null;


			if (weights !== null) {

				let size = this.__size.weight;
				if (size === weights.length) {

					let count  = 0;
					let layers = this.__layers;

					for (let l = 0, ll = layers.length; l < ll; l++) {

						let layer = layers[l];

						for (let n = 0, nl = layer.length; n < nl; n++) {

							let neuron = layer[n];
							if (neuron.weights.length !== 0) {

								for (let w = 0, wl = neuron.weights.length; w < wl; w++) {
									neuron.history[w] = weights[count++];
									neuron.weights[w] = weights[count++];
								}

							}

						}

					}


					return true;

				}

			}


			return false;

		}

	};


	return Composite;

});

