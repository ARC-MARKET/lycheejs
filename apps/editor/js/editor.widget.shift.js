
editor.widgets.shift = function(canvas, ui, editor) {

	this.name = 'shift';

	this._canvas = canvas;
	this._ui = ui;
	this._editor = editor;

	this.init();

};



editor.widgets.shift.prototype = {

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
				this._canvas.shift({ y:  1 });
			break;
			case 'right':
				this._canvas.shift({ x:  1 });
			break;
			case 'bottom':
				this._canvas.shift({ y: -1 });
			break;
 			case 'left':
				this._canvas.shift({ x: -1 });
			break;
			default:
				success = false;
		}

		return success;

	},


	/*
	 * PRIVATE API
	 */
	__initUI: function() {

		if (this.__context !== undefined) {

			var context = this.__context,
				prefix = this.__context.element.id + '-',
				content;


			content = new ly.ui('div', 'W', function() {
				this.navigate('top');
			}, this);
			content.element.id = prefix + 'top';
			content.addTo(context);

			content = new ly.ui('div', 'D', function() {
				this.navigate('right');
			}, this);
			content.element.id = prefix + 'right';
			content.addTo(context);

			content = new ly.ui('div', 'S', function() {
				this.navigate('bottom');
			}, this);
			content.element.id = prefix + 'bottom';
			content.addTo(context);

			content = new ly.ui('div', 'A', function() {
				this.navigate('left');
			}, this);
			content.element.id = prefix + 'left';
			content.addTo(context);

		}

	}

};

