
lychee.define('lychee.ai.bnn.Agent').includes([
	'lychee.ai.Agent'
]).requires([
	'lychee.ai.bnn.Brain'
]).exports(function(lychee, global, attachments) {

	const _Agent = lychee.import('lychee.ai.Agent');
	const _Brain = lychee.import('lychee.ai.bnn.Brain');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		settings.brain = settings.brain || new _Brain();

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
			data['constructor'] = 'lychee.ai.bnn.Agent';


			return data;

		}

	};


	return Composite;

});

