
lychee.define('lychee.ai.neural.Network').exports(function(lychee, global, attachments) {

	var _BIAS                = -1;
	var _ACTIVATION_RESPONSE =  1;



	/*
	 * HELPERS
	 */

	var _Neuron = function(weights) {

		weights = typeof weights === 'number' ? weights : 1;


		this.weights = [];

		for (var i = 0; i < weights; i++) {
			this.weights.push(Math.random() - Math.random());
		}

		// Threshold (bias) that is multiplied by -1
		this.weights.push(Math.random() - Math.random());

	};

	var _Layer = function(neurons, weights) {

		neurons = typeof neurons === 'number' ? neurons : 1;
		weights = typeof weights === 'number' ? weights : 1;


		this.neurons = [];

		for (var n = 0; n < neurons; n++) {
			this.neurons.push(new _Neuron(weights));
		}

	};

	var _sigmoid = function(input, response) {
		return (1 / (1 + Math.exp(-1 * input / response)));
	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.assignsafe({
			inputs:  2,
			outputs: 2,
			layers:  1,
			neurons: 4
		}, data);


		this.layers = [];


		// Input Layer
		this.layers.push(new _Layer(settings.neurons, settings.inputs));

		// Processing Layers
		for (var l = 0; l < layers - 1; l++) {
			this.layers.push(new _Layer(settings.neurons, settings.neurons));
		}

		// Output Layer
		this.layers.push(new _Layer(settings.outputs, settings.inputs));

	};


	Class.prototype = {

		update: function(inputs) {

			var outputs = [];

			for (var l = 0; l < this.layers.length; l++) {

				var layer = this.layers[l];

				if (l > 0) {
					inputs  = outputs;
					outputs = [];
				}


				for (var n = 0; n < layer.neurons.length; n++) {

					var count  = 0;
					var neuron = layer.neurons[n];

					var netinput = 0;
					var wl       = neuron.weights.length;

					for (var w = 0; w < wl - 1; w++) {
						netinput += neuron.weights[w] * inputs[count++];
					}

					netinput += neuron.weights[wl - 1] * _BIAS;

					outputs.push(_sigmoid(netinput, _ACTIVATION_RESPONSE));

				}

			}


			return outputs;

		},

		countWeights: function() {

			var amount = 0;


			var layers = this.layers;
			if (layers.length > 0) {

				layers.forEach(function(layer) {

					layer.neurons.forEach(function(neuron) {
						amount += neuron.weights.length;
					});

				});

			}


			return amount;

		},

		getWeights: function() {

			var layers = this.layers;
			if (layers.length > 0) {

				var weights = [];


				layers.forEach(function(layer) {

					layer.neurons.forEach(function(neuron) {

						neuron.weights.forEach(function(weight, w) {
							weights.push(weight);
						});

					});

				});


				return weights;

			}


			return null;

		},

		setWeights: function(weights) {

			var layers = this.layers;
			if (layers.length > 0) {

				var index = 0;


				layers.forEach(function(layer) {

					layer.neurons.forEach(function(neuron) {

						neuron.weights.forEach(function(weight, w) {
							neuron.weights[w] = weights[index++];
						});

					});

				});


				return true;

			}


			return false;

		}

	};


	return Class;

});

