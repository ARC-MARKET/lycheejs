
lychee.define('ranger.ui.layer.Control').requires([
	'lychee.ui.entity.Helper'
]).includes([
	'lychee.ui.Layer'
]).exports((lychee, global, attachments) => {

	const _Helper = lychee.import('lychee.ui.entity.Helper');
	const _Layer  = lychee.import('lychee.ui.Layer');



	/*
	 * HELPERS
	 */

	const _on_change = function(value) {

		let action   = value.split('=')[0];
		let resource = value.split('=')[1];

		if (action === 'start') {

			this.setLabel('Stop');
			this.setValue('stop=' + resource);

		} else if (action === 'stop') {

			this.setLabel('Start');
			this.setValue('start=' + resource);

		}

	};

	const _on_relayout = function() {

		let label = this.label;
		let value = this.value;

		if (label.length === value.length) {

			if (this.entities.length !== label.length) {

				for (let e = 0, el = this.entities.length; e < el; e++) {
					this.entities[e].unbind('change');
				}


				this.entities = [];


				for (let l = 0, ll = label.length; l < ll; l++) {

					let helper = new _Helper();

					helper.bind('change', _on_change, helper);

					this.entities.push(helper);
				}

			}


			let x1         = -1 / 2 * this.width;
			let y1         = -1 / 2 * this.height;
			let horizontal = this.width > this.height;
			let offset     = 0;


			for (let v = 0, vl = value.length; v < vl; v++) {

				let entity = this.entities[v];

				entity.setLabel(label[v]);
				entity.setValue(value[v]);


				if (horizontal === true) {

					entity.width      = 48;
					entity.position.x = x1 + offset + entity.width / 2;
					entity.position.y = 0;
					offset += entity.width + 8;

				} else {

					entity.width      = 48;
					entity.position.x = 0;
					entity.position.y = y1 + offset + entity.height / 2;
					offset += entity.height + 8;

				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.label = [];
		this.value = [];


		states.relayout = false;


		_Layer.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.unbind('relayout');
		this.bind('relayout', _on_relayout, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Layer.prototype.serialize.call(this);
			data['constructor'] = 'ranger.ui.layer.Control';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setLabel: function(label) {

			label = label instanceof Array ? label : null;


			if (label !== null) {

				this.label = label.map(val => '' + val);
				this.trigger('relayout');


				return true;

			}


			return false;

		},

		setValue: function(value) {

			value = value instanceof Array ? value : null;


			if (value !== null) {

				this.value = value.map(val => '' + val);
				this.trigger('relayout');


				return true;

			}


			return false;

		}

	};


	return Composite;

});

