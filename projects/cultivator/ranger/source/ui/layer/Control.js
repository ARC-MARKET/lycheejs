
lychee.define('app.ui.layer.Control').includes([
	'lychee.ui.Layer'
]).requires([
	'lychee.ui.entity.Helper'
]).exports(function(lychee, global, attachments) {

	var _Helper = lychee.import('lychee.ui.entity.Helper');
	var _Layer  = lychee.import('lychee.ui.Layer');



	/*
	 * HELPERS
	 */

	var _on_change = function(value) {

		var action   = value.split('=')[0];
		var resource = value.split('=')[1];

		if (action === 'start') {

			this.setLabel('Stop');
			this.setValue('stop=' + resource);

		} else if (action === 'stop') {

			this.setLabel('Start');
			this.setValue('start=' + resource);

		}

	};

	var _on_relayout = function() {

		var label = this.label;
		var value = this.value;

		if (label.length === value.length) {

			if (this.entities.length !== label.length) {

				for (var e = 0, el = this.entities.length; e < el; e++) {
					this.entities[e].unbind('change');
				}


				this.entities = [];


				for (var l = 0, ll = label.length; l < ll; l++) {

					var helper = new _Helper();

					helper.bind('change', _on_change, helper);

					this.entities.push(helper);
				}

			}


			var x1         = -1/2 * this.width;
			var y1         = -1/2 * this.height;
			var horizontal = this.width > this.height;
			var offset     = 0;


			for (var v = 0, vl = value.length; v < vl; v++) {

				var entity = this.entities[v];

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

	var Class = function(data) {

		var settings = Object.assign({}, data);


		this.label = [];
		this.value = [];


		settings.relayout = false;


		_Layer.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.unbind('relayout');
		this.bind('relayout', _on_relayout, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Layer.prototype.serialize.call(this);
			data['constructor'] = 'app.ui.layer.Control';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setLabel: function(label) {

			label = label instanceof Array ? label : null;


			if (label !== null) {

				this.label = label.filter(function(val) {
					return '' + val;
				});
				this.trigger('relayout');


				return true;

			}


			return false;

		},

		setValue: function(value) {

			value = value instanceof Array ? value : null;


			if (value !== null) {

				this.value = value.filter(function(val) {
					return '' + val;
				});
				this.trigger('relayout');


				return true;

			}


			return false;

		}

	};


	return Class;

});

