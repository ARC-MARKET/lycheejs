
lychee.define('lychee.ai.bnn.Layer').requires([
	'lychee.ai.bnn.Agent'
]).includes([
	'lychee.ai.Layer'
]).exports((lychee, global, attachments) => {

	const _Agent = lychee.import('lychee.ai.bnn.Agent');
	const _Layer = lychee.import('lychee.ai.Layer');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		_Layer.call(this, states);

		states = null;

	};


	Composite.prototype = {

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Layer.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ai.bnn.Layer';

			let states = {};
			let blob   = (data['blob'] || {});


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		}

	};


	return Composite;

});

