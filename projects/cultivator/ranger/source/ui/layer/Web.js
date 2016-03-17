
lychee.define('app.ui.layer.Web').includes([
	'lychee.ui.Layer'
]).requires([
	'lychee.ui.entity.Helper'
]).exports(function(lychee, app, global, attachments) {



	/*
	 * HELPERS
	 */

	var _on_relayout = function() {

		var label = this.label;
		var value = this.value;

		if (label.length === value.length) {

			if (this.entities.length !== label.length) {

				this.entities = [];

				for (var l = 0, ll = label.length; l < ll; l++) {
					this.entities.push(new lychee.ui.entity.Helper());
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

		var settings = lychee.extend({}, data);


		this.label = [];
		this.value = [];


		settings.relayout = false;


		lychee.ui.Layer.call(this, settings);

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

			var data = lychee.ui.Layer.prototype.serialize.call(this);
			data['constructor'] = 'app.ui.layer.Web';


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

