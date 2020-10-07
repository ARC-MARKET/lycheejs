
lychee.define('studio.ui.element.select.Scene').requires([
	'lychee.ui.entity.Button',
	'lychee.ui.entity.Select',
	'lychee.ui.entity.List'
]).includes([
	'lychee.ui.Element'
]).exports((lychee, global, attachments) => {

	const _Element = lychee.import('lychee.ui.Element');



	/*
	 * HELPERS
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.value = null;

		this.__buffer  = null;


		this.setValue(states.value);


		_Element.call(this, states);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Element.prototype.serialize.call(this);
			data['constructor'] = 'studio.ui.element.select.Scene';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;

		},



		/*
		 * CUSTOM API
		 */

		setValue: function(value) {

			value = value instanceof Object ? value : null;


			if (value !== null) {

				// TODO: Validate value JSON structure
				// JSON structure is /<state>/layers/<id> = Layer blob
				// TODO: Recursively parse Layer blobs


				return true;

			}


			return false;

		}

	};


	return Composite;

});

