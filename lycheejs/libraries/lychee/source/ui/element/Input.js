
lychee.define('lychee.ui.element.Input').requires([
	'lychee.Input',
	'lychee.ui.entity.Slider',
	'lychee.ui.entity.Switch'
]).includes([
	'lychee.ui.Element'
]).exports((lychee, global, attachments) => {

	const _Element = lychee.import('lychee.ui.Element');
	const _Slider  = lychee.import('lychee.ui.entity.Slider');
	const _Switch  = lychee.import('lychee.ui.entity.Switch');



	/*
	 * HELPERS
	 */

	const _read = function() {

		let main = global.MAIN || null;
		if (main !== null) {

			let input = main.input || null;
			if (input !== null) {

				let delay       = input.delay;
				let key         = input.key;
				let keymodifier = input.keymodifier;
				let touch       = input.touch;
				let swipe       = input.swipe;


				this.getEntity('delay').setValue(delay);
				this.getEntity('key').setValue(key === true ? 'on' : 'off');
				this.getEntity('keymodifier').setValue(keymodifier === true ? 'on' : 'off');
				this.getEntity('touch').setValue(touch === true ? 'on' : 'off');
				this.getEntity('swipe').setValue(swipe === true ? 'on' : 'off');

			}

		}

	};

	const _save = function() {

		let main = global.MAIN || null;
		if (main !== null) {

			let input = main.input || null;
			if (input !== null) {

				let delay       = this.getEntity('delay').value;
				let key         = this.getEntity('key').value;
				let keymodifier = this.getEntity('keymodifier').value;
				let touch       = this.getEntity('touch').value;
				let swipe       = this.getEntity('swipe').value;


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

	const Composite = function(data) {

		let states = Object.assign({}, data);


		states.label    = 'Input';
		states.options  = [ 'Save' ];
		states.relayout = true;


		_Element.call(this, states);



		/*
		 * INITIALIZATION
		 */

		this.setEntity('delay', new _Slider({
			type:  _Slider.TYPE.horizontal,
			min:   0,
			max:   1000,
			step:  100,
			value: 0
		}));

		this.setEntity('key', new _Switch({
			value: 'on'
		}));

		this.setEntity('keymodifier', new _Switch({
			value: 'on'
		}));

		this.setEntity('touch', new _Switch({
			value: 'on'
		}));

		this.setEntity('swipe', new _Switch({
			value: 'on'
		}));

		this.bind('change', function(action) {

			if (action === 'save') {
				_save.call(this);
			}

		}, this);


		_read.call(this);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Element.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.element.Input';


			return data;

		}

	};


	return Composite;

});

