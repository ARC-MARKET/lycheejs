
lychee.define('studio.ui.element.preview.Sound').requires([
	'lychee.ui.Layer',
	'lychee.ui.entity.Button'
]).includes([
	'lychee.ui.Element'
]).exports((lychee, global, attachments) => {

	const _Button  = lychee.import('lychee.ui.entity.Button');
	const _Element = lychee.import('lychee.ui.Element');
	const _Layer   = lychee.import('lychee.ui.Layer');



	/*
	 * HELPERS
	 */



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.value = null;

		this.__button = null;


		states.label   = 'Preview';
		states.options = [];


		_Element.call(this, states);



		/*
		 * INITIALIZATION
		 */

		_Layer.prototype.setEntity.call(this, '@button', new _Button({
			label: 'Play Sound',
			value: 'play'
		}));


		this.__button = _Layer.prototype.getEntity.call(this, '@button');
		this.__button.bind('touch', function(id, position, delta) {

			let value = this.value;
			if (value !== null) {

				if (value.isIdle === true) {
					this.__button.setLabel('Stop Sound');
					value.play();
				} else {
					this.__button.setLabel('Play Sound');
					value.stop();
				}

			}

		}, this);

		this.bind('relayout', function() {

			let button = this.__button;
			let value  = this.value;

			if (button !== null) {

				if (value !== null && value.buffer !== null) {
					button.setVisible(true);
				} else {
					button.setVisible(false);
				}

			}

		}, this);


		this.setValue(states.value);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Element.prototype.serialize.call(this);
			data['constructor'] = 'studio.ui.element.preview.Sound';


			return data;

		},

		update: function(clock, delta) {

			let button = this.__button;
			let value  = this.value;

			if (button !== null && value !== null) {

				if (value.isIdle === true) {
					button.setLabel('Play Sound');
				}

			}


			return _Element.prototype.update.call(this, clock, delta);

		},



		/*
		 * CUSTOM API
		 */

		setValue: function(value) {

			value = value instanceof Sound ? value : null;


			if (value !== null && value.buffer !== null) {

				this.value = value;
				this.setOptions([ 'Save' ]);

				return true;

			} else {

				this.value = null;
				this.setOptions([]);

				return false;

			}

		}

	};


	return Composite;

});

