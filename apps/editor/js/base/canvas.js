
editor.plugins.base.canvas = function(canvas, ui, editor) {

	this.type = 'base';
	this.name = 'canvas';

	this._canvas = canvas;
	this._ui = ui;
	this._editor = editor;

	this.defaults = this._editor.settings.canvas;

	this.reset();
	this.init();

};



editor.plugins.base.canvas.prototype = {

	/*
	 * PLUGIN API
	 */
	reset: function() {

		this.__data = {};

		for (var d in this.defaults) {
			this.__data[d] = this.defaults[d];
		}

		this.__refreshUI();

	},

	init: function() {

		this.__fieldset = this._ui.addFieldset(this.type, this.name);
		this.__ui = {};

		this.__initUI();

	},



	/*
	 * PRIVATE API
	 */
	__initUI: function() {

		var content,
			fieldset = this.__fieldset;

		fieldset.clear();

		content = new ly.ui('b', 'X');
		fieldset.add(content);

		this.__ui.x = new ly.ui.input('number', this.__data.size.x, function(value) {
			value = Math.round(value / 2) * 2;
			this.__data.size.x = value;
			this.__refreshCanvas();
			return value;
		}, this);
		fieldset.add(this.__ui.x);


		fieldset.next();

		content = new ly.ui('b', 'Y');
		fieldset.add(content);

		this.__ui.y = new ly.ui.input('number', this.__data.size.y, function(value) {
			value = Math.round(value / 2) * 2;
			this.__data.size.y = value;
			this.__refreshCanvas();
			return value;
		}, this);
		fieldset.add(this.__ui.y);


		fieldset.next();

		content = new ly.ui('b', 'Tile');
		fieldset.add(content);

		this.__ui.tile = new ly.ui.input('number', this.__data.size.tile, function(value) {
			value = Math.round(value / 2) * 2;
			this.__data.size.tile = value;
			this.__refreshCanvas();
			return value;
		});
		fieldset.add(this.__ui.tile);


		fieldset.next();

		content = new ly.ui.button('<', function() {
			this._canvas.shift({ x: -1 });
		}, this);

		content = new ly.ui.button('>', function() {
			this._canvas.shift({ x: +1 });
		}, this);

	},

	__refreshUI: function() {

		if (this.__ui === undefined) {
			return;
		}

		for (var prop in this.__data) {
			this.__ui[prop].set(this.__data[prop]);
		}

	},

	__refreshCanvas: function() {

		this._canvas.settings.size = {
			x: this.__data.size.x,
			y: this.__data.size.y,
			tile: this.__data.size.tile
		};

		this._canvas.refresh();

	}

};

