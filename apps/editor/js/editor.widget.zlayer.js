
editor.widgets.zlayer = function(canvas, ui, editor) {

	this.name = 'zlayer';

	this._canvas = canvas;
	this._ui = ui;
	this._editor = editor;

	this.init();

};



editor.widgets.zlayer.prototype = {

	/*
	 * WIDGET API
	 */
	init: function() {

		this.__context = this._ui.addWidget(this.name, true);
		this.__initUI();

	},



	/*
	 * PUBLIC API
	 */
	navigate: function(direction) {

		if (typeof direction !== 'string') {
			return false;
		}

		var success = true;
		switch (direction) {
 			case 'top':
				this._canvas.shift({ z: +1 });
			break;
			case 'bottom':
				this._canvas.shift({ z: -1 });
			break;
			default:
				success = false;
		}

		this.__refreshUI();

		return success;

	},


	/*
	 * PRIVATE API
	 */
	__initUI: function() {

		if (this.__context !== undefined) {

			this.__ui = {};

			var context = this.__context,
				prefix = this.__context.element.id + '-',
				content;


			content = new ly.ui('div', 'W', function() {
				this.navigate('top');
			}, this);
			content.element.id = prefix + 'top';
			content.addTo(context);

			this.__ui.zLayer = new ly.ui.input('number', this._canvas.getZLayer(), function(value) {
				this._canvas.shiftTo({ x: value });
			}, this);
			this.__ui.zLayer.element.id = prefix + 'input';
			this.__ui.zLayer.title = 'z-layer';
			this.__ui.zLayer.addTo(context);

			content = new ly.ui('div', 'S', function() {
				this.navigate('bottom');
			}, this);
			content.element.id = prefix + 'bottom';
			content.addTo(context);

		}

	},

	__refreshUI: function() {

		if (this.__ui === undefined) {
			return;
		}

		this.__ui.zLayer.set(this._canvas.getZLayer());

	}

};

