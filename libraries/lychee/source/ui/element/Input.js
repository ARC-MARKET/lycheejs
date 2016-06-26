
lychee.define('lychee.ui.element.Input').requires([
	'lychee.Input',
	'lychee.ui.entity.Slider',
	'lychee.ui.entity.Switch'
]).includes([
	'lychee.ui.Element'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _read = function() {

		var main = global.MAIN || null;
		if (main !== null) {

			var input = main.input || null;
			if (input !== null) {

				var delay       = input.delay;
				var key         = input.key;
				var keymodifier = input.keymodifier;
				var touch       = input.touch;
				var swipe       = input.swipe;


				this.getEntity('delay').setValue(delay);
				this.getEntity('key').setValue(key === true ? 'on' : 'off');
				this.getEntity('keymodifier').setValue(keymodifier === true ? 'on' : 'off');
				this.getEntity('touch').setValue(touch === true ? 'on' : 'off');
				this.getEntity('swipe').setValue(swipe === true ? 'on' : 'off');

			}

		}

	};

	var _save = function() {

		var main = global.MAIN || null;
		if (main !== null) {

			var input = main.input || null;
			if (input !== null) {

				var delay       = this.getEntity('delay').value;
				var key         = this.getEntity('key').value;
				var keymodifier = this.getEntity('keymodifier').value;
				var touch       = this.getEntity('touch').value;
				var swipe       = this.getEntity('swipe').value;


				input.setDelay(delay);
				input.setKey(key === 'on' ? true : false);
				input.setKeyModifier(keymodifier === 'on' ? true : false);
				input.setTouch(touch === 'on' ? true : false);
				input.setSwipe(swipe === 'on' ? true : false);

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		settings.label   = 'Input';
		settings.options = [ 'Save' ];


		lychee.ui.Element.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.setEntity('delay', new lychee.ui.entity.Slider({
			type:  lychee.ui.entity.Slider.TYPE.horizontal,
			min:   0,
			max:   1000,
			step:  100,
			value: 0
		}));

		this.setEntity('key', new lychee.ui.entity.Switch({
			value: 'on'
		}));

		this.setEntity('keymodifier', new lychee.ui.entity.Switch({
			value: 'on'
		}));

		this.setEntity('touch', new lychee.ui.entity.Switch({
			value: 'on'
		}));

		this.setEntity('swipe', new lychee.ui.entity.Switch({
			value: 'on'
		}));

		this.bind('change', function(action) {

			if (action === 'save') {
				_save.call(this);
			}

		}, this);


		_read.call(this);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.Element.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.element.Input';


			return data;

		}

	};


	return Class;

});

