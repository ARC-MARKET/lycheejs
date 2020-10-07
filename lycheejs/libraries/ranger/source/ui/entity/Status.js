
lychee.define('ranger.ui.entity.Status').includes([
	'lychee.ui.entity.Label'
]).exports((lychee, global, attachments) => {

	const _Label = lychee.import('lychee.ui.entity.Label');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		_Label.call(this, states);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Label.prototype.serialize.call(this);
			data['constructor'] = 'ranger.ui.entity.Status';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setValue: function(value) {

			value = typeof value === 'string' ? value : null;


			if (value !== null) {

				if (value === 'Online') {

					this.alpha = 1.0;
					this.value = value;

					return true;

				} else if (value === 'Offline') {

					this.alpha = 0.25;
					this.value = value;

					return true;

				}

			}


			return false;

		}

	};


	return Composite;

});

