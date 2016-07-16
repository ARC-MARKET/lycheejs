
lychee.define('lychee.ui.element.Search').requires([
	'lychee.ui.entity.Button',
	'lychee.ui.entity.Input',
	'lychee.ui.entity.Select'
]).includes([
	'lychee.ui.Element'
]).exports(function(lychee, global, attachments) {



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		var settings = Object.assign({}, data);


		this.data     = [];
		this.value    = '';

		this.__search = null;
		this.__select = null;


		this.setData(settings.data);

		delete settings.data;


		settings.label   = 'Search';
		settings.options = [ 'Open', 'Clear' ];


		lychee.ui.Element.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.__search = new lychee.ui.entity.Input({
			type:  lychee.ui.entity.Input.TYPE.text,
			value: ''
		});

		this.__search.bind('change', function(value) {

			var filtered = this.data.filter(function(other) {
				return other.indexOf(value) !== -1;
			});


			if (filtered.length === 0) {
				filtered.push('- No matches -');
			}


			this.__select.setOptions(filtered);
			this.trigger('relayout');

		}, this);

		this.__select = new lychee.ui.entity.Select({
			options: this.data,
			value:   this.data[0]
		});

		this.__select.bind('change', function(value) {
			this.value = value;
		}, this);

		this.addEntity(this.__search);
		this.addEntity(this.__select);


		this.bind('change', function(action) {

			if (action === 'clear') {
				this.__search.setValue('');
				this.__search.trigger('change', [ '' ]);
			}

		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.Element.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.element.Search';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setData: function(data) {

			data = data instanceof Array ? data : null;


			if (data !== null) {

				this.data = data.map(function(value) {
					return '' + value;
				}).sort();


				var select = this.__select;
				if (select !== null) {
					select.setOptions(this.data);
				}


				return true;

			}


			return false;

		}

	};


	return Composite;

});

