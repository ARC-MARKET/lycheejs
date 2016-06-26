
lychee.define('lychee.ui.element.Viewport').requires([
	'lychee.Renderer',
	'lychee.Viewport',
	'lychee.ui.entity.Input',
	'lychee.ui.entity.Select'
]).includes([
	'lychee.ui.Element'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _read = function() {

		var main = global.MAIN || null;
		if (main !== null) {

			var renderer = main.renderer || null;
			var viewport = main.viewport || null;

			if (renderer !== null && viewport !== null) {

				var background = renderer.background;
				var fullscreen = viewport.fullscreen;
				var width      = renderer.width;
				var height     = renderer.height;


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

	var _save = function() {

		var main = global.MAIN || null;
		if (main !== null) {

			var renderer = main.renderer || null;
			var viewport = main.viewport || null;

			if (renderer !== null && viewport !== null) {

				var background = this.getEntity('background').value;
				var mode       = this.getEntity('mode').value;
				var width      = this.getEntity('width').value;
				var height     = this.getEntity('height').value;


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

	var Class = function(data) {

		var settings = Object.assign({}, data);


		settings.label   = 'Viewport';
		settings.options = [ 'Save' ];


		lychee.ui.Element.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.setEntity('mode', new lychee.ui.entity.Select({
			options: [ 'fullscreen', 'dynamic', 'static' ],
			value:   'dynamic'
		}));

		this.setEntity('width', new lychee.ui.entity.Input({
			type:    lychee.ui.entity.Input.TYPE.number,
			value:   1024,
			visible: false
		}));

		this.setEntity('height', new lychee.ui.entity.Input({
			type:    lychee.ui.entity.Input.TYPE.number,
			value:   768,
			visible: false
		}));

		this.setEntity('background', new lychee.ui.entity.Input({
			type:  lychee.ui.entity.Input.TYPE.text,
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


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.Element.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.element.Viewport';


			return data;

		}

	};


	return Class;

});

