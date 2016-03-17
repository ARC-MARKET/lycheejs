
lychee.define('app.ui.entity.Status').includes([
	'lychee.ui.entity.Label'
]).exports(function(lychee, app, global, attachments) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		lychee.ui.entity.Label.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.entity.Label.prototype.serialize.call(this);
			data['constructor'] = 'app.ui.entity.Status';


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


	return Class;

});

