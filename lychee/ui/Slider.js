
lychee.define('lychee.ui.Slider').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.__drag  = { x: 0, y: 0 };
		this.__range = { from: 0, to: 0, delta: 0 };
		this.__value = 0;


		if (settings.range !== undefined) {
			this.setRange(settings.range);
		}


		settings.radius = typeof settings.radius === 'number' ? settings.radius : 50;
		settings.shape  = lychee.ui.Entity.SHAPE.circle;

		delete settings.range;

		lychee.ui.Entity.call(this, 'ui-slider', settings);


		/*
		 * INITIALIZATION
		 */

		if (settings.value !== undefined) {
			this.setValue(settings.value);
		} else {
			this.setValue(this.__range.from);
		}


		this.bind('focus', function() {
			this.setState('active');
		}, this);

		this.bind('blur', function() {
			this.setState('default');
		}, this);


		this.bind('swipe', function(id, type, position, delta, swipe) {

			console.log(position);

		}, this);


		settings = null;

	};


	Class.prototype = {

		/*
		 * PUBLIC API
		 */

		getDrag: function() {
			return this.__drag;
		},

		setRange: function(range) {

			if (range instanceof Object) {

				this.__range.from  = typeof range.from === 'number'  ? range.from  : this.__range.from;
				this.__range.to    = typeof range.to === 'number'    ? range.to    : this.__range.to;
				this.__range.delta = typeof range.delta === 'number' ? range.delta : this.__range.delta;

				return true;

			}


			return true;

		},

		getValue: function() {
			return this.__value;
		},

		setValue: function(value) {

			value = typeof value === 'number' ? value : null;

			if (value !== null) {

				var range = this.__range;

				value %= range.to;


				var index  = value / (range.to - range.from);
				var radius = this.radius;

				this.__drag.x = Math.sin(index * 2 * Math.PI) * (radius - 24);
				this.__drag.y = Math.cos(index * 2 * Math.PI) * (radius - 24);

				this.__value = value;


				return true;

			}


			return false;

		}

	};


	return Class;

});

