
lychee.define('studio.ui.entity.input.Font').includes([
	'lychee.ui.entity.Input'
]).exports((lychee, global, attachments) => {

	const _Input = lychee.import('lychee.ui.entity.Input');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		_Input.call(this, states);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Input.prototype.serialize.call(this);
			data['constructor'] = 'studio.ui.entity.input.Font';


			return data;

		}

	};


	return Composite;

});

