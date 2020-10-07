
lychee.define('lychee.ui.element.Search').requires([
	'lychee.ui.entity.Input',
	'lychee.ui.entity.Select'
]).includes([
	'lychee.ui.Element'
]).exports((lychee, global, attachments) => {

	const _Element = lychee.import('lychee.ui.Element');
	const _Input   = lychee.import('lychee.ui.entity.Input');
	const _Select  = lychee.import('lychee.ui.entity.Select');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.data  = [];
		this.value = '';


		states.label    = 'Search';
		states.options  = [];
		states.relayout = true;


		_Element.call(this, states);



		/*
		 * INITIALIZATION
		 */

		let input = new _Input({
			type:  _Input.TYPE.text,
			value: ''
		});

		input.bind('change', function(value) {

			let select = this.getEntity('select');
			if (select !== null) {

				let filtered = this.data.filter(other => other.includes(value));
				if (filtered.length === 0) {

					select.setOptions([ '- No matches -' ]);
					select.height = 32;
					this.trigger('relayout');

					this.value = value;
					this.trigger('change', [ value ]);

				} else {

					select.setOptions(filtered);
					select.height = Math.min(32 * filtered.length, this.height - 128);
					this.trigger('relayout');

				}

			}

		}, this);

		let select = new _Select({
			options: this.data,
			value:   this.data[0],
			height:  this.height - 128
		});

		select.bind('change', function(value) {

			if (value !== '- No matches -') {
				this.value = value;
				this.trigger('change', [ value ]);
			}

		}, this);


		this.addEntity(input);
		this.addEntity(select);


		this.setData(states.data);
		delete states.data;

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Element.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.element.Search';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		getEntity: function(id, position) {

			id        = typeof id === 'string'    ? id       : null;
			position = position instanceof Object ? position : null;


			if (id === 'search') {
				return this.entities[3] || null;
			} else if (id === 'select') {
				return this.entities[5] || null;
			}


			return _Element.prototype.getEntity.call(this, id, position);

		},

		setData: function(data) {

			data = data instanceof Array ? data : null;


			if (data !== null) {

				this.data = data.map(value => '' + value).sort();


				let select = this.getEntity('select');
				if (select !== null) {
					select.setOptions(this.data);
					select.height = Math.min(32 * this.data.length, this.height - 128);
					this.trigger('relayout');
				}


				return true;

			}


			return false;

		},

		setValue: function(value) {

			value = typeof value === 'string' ? value : null;


			if (value !== null) {

				this.value = value;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

