
lychee.define('fork.Main').includes([
	'app.Main'
]).exports((lychee, global, attachments) => {

	const _Main = lychee.import('app.Main');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({

			/* CUSTOM SETTINGS */

		}, data);


		_Main.call(this, states);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Main.prototype.serialize.call(this);
			data['constructor'] = 'fork.Main';


			return data;

		}

	};


	return Composite;

});
