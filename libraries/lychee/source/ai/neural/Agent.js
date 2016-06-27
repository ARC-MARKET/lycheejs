
lychee.define('lychee.ai.neural.Agent').requires([
	'lychee.ai.neural.Evolution',
	'lychee.ai.neural.Network'
]).exports(function(lychee, global, attachments) {

	var _instances  = {};
	var _evolutions = {};



	/*
	 * HELPERS
	 */

	var _connect = function() {

		var id = this.id;


		var instances = _instances[id] || null;
		if (instances === null) {

			instances = _instances[id] = [ this ];

		} else {

			if (instances.indexOf(this) === -1) {
				instances.push(this);
			}

		}


		var evolution = _evolutions[id] || null;
		if (evolution === null) {

			var network = this.__network;
			var weights = 0;

			if (network !== null) {
				weights = network.countWeights();
			}


			evolution = _evolutions[id] = new lychee.ai.neural.Evolution({
				population: instances.length,
				weights:    weights
			});

			this.__evolution = evolution;

		} else {

			if (evolution.population !== instances.length) {
				evolution.setPopulation(instances.length);
			}

			this.__evolution = evolution;

		}

	};

	var _disconnect = function() {

		var id = this.id;


		var instances = _instances[id] || null;
		if (instances !== null) {

			var index = instances.indexOf(this);
			if (index !== -1) {
				instances.splice(index, 1);
			}

		}


		var evolution = this.__evolution;
		if (evolution !== null) {
			this.__evolution = null;
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		this.id = 'lychee-ai-neural-Agent-' + _id++;

		this.__evolution = null;
		this.__network   = new lychee.ai.neural.Network({
			inputs:  4,
			outputs: 2,
			layers:  2,
			neurons: 6
		});
		this.__genome    = new lychee.ai.neural.Genome({
			weights: this.__network.countWeights()
		});


		this.setId(settings.id);


		_connect.call(this);

/*
 * this.network.putWeights(this.__evolution.population[_instances[this.id].indexOf(this)].weights);
 */

	};


	Class.prototype = {

		setId: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null) {

				_disconnect.call(this);
				this.id = id;
				_connect.call(this);

				return true;

			}


			return false;

		}

	};


	return Class;

});

