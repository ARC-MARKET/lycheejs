
lychee.define('lychee.ui.element.Viewport').requires([
	'lychee.Renderer',
	'lychee.Viewport',
	'lychee.ui.entity.Input',
	'lychee.ui.entity.Select'
]).includes([
	'lychee.ui.Element'
]).exports(function(lychee, global, attachments) {

	const _Element = lychee.import('lychee.ui.Element');
	const _Input   = lychee.import('lychee.ui.entity.Input');
	const _Select  = lychee.import('lychee.ui.entity.Select');



	/*
	 * HELPERS
	 */

	const _read = function() {

		let main = global.MAIN || null;
		if (main !== null) {

			let renderer = main.renderer || null;
			let viewport = main.viewport || null;

			if (renderer !== null && viewport !== null) {

				let background = renderer.background;
				let fullscreen = viewport.fullscreen;
				let width      = renderer.width;
				let height     = renderer.height;


				if (width  === viewport.width)  width  = null;
				if (height === viewport.height) height = null;


				this.getEntity('background').setValue(background);


				if (fullscreen === true) {

					this.getEntity('mode').setValue('fullscreen');

				} else if (width === null && height === null) {

					this.getEntity('mode').setValue('dynamic');

				} else {

					this.getEntity('mode').setValue('static');
					this.getEntity('width').setValue(width);
					this.getEntity('height').setValue(height);

				}

			}

		}

	};

	const _save = function() {

		let main = global.MAIN || null;
		if (main !== null) {

			let renderer = main.renderer || null;
			let viewport = main.viewport || null;

			if (renderer !== null && viewport !== null) {

				let background = this.getEntity('background').value;
				let mode       = this.getEntity('mode').value;
				let width      = this.getEntity('width').value;
				let height     = this.getEntity('height').value;


				if (mode === 'fullscreen') {

					renderer.setBackground(background);
					renderer.setWidth(null);
					renderer.setHeight(null);

					viewport.setFullscreen(true);

				} else if (mode === 'dynamic') {

					renderer.setBackground(background);
					renderer.setWidth(null);
					renderer.setHeight(null);

					viewport.setFullscreen(false);

				} else if (mode === 'static') {

					renderer.setBackground(background);
					renderer.setWidth(width);
					renderer.setHeight(height);

					viewport.setFullscreen(false);

				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		settings.label   = 'Viewport';
		settings.options = [ 'Save' ];


		_Element.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.setEntity('mode', new _Select({
			options: [ 'fullscreen', 'dynamic', 'static' ],
			value:   'dynamic'
		}));

		this.setEntity('width', new _Input({
			type:    _Input.TYPE.number,
			value:   1024,
			visible: false
		}));

		this.setEntity('height', new _Input({
			type:    _Input.TYPE.number,
			value:   768,
			visible: false
		}));

		this.setEntity('background', new _Input({
			type:  _Input.TYPE.text,
			value: '#405050'
		}));

		this.getEntity('mode').bind('change', function(value) {

			if (value === 'fullscreen') {

				this.getEntity('width').visible  = false;
				this.getEntity('height').visible = false;

			} else if (value === 'dynamic') {

				this.getEntity('width').visible  = false;
				this.getEntity('height').visible = false;

			} else if (value === 'static') {

				this.getEntity('width').visible  = true;
				this.getEntity('height').visible = true;

			}


			this.trigger('relayout');

		}, this);

		this.bind('change', function(action) {

			if (action === 'save') {
				_save.call(this);
			}

		}, this);


		_read.call(this);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _Element.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.element.Viewport';


			return data;

		}

	};


	return Composite;

});

