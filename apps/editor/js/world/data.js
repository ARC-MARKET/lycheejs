
editor.plugins.world = {};

editor.plugins.world.data = function(canvas, ui) {

	this.type = 'world';
	this.name = 'data';

	this._canvas = canvas;
	this._ui = ui;

	this.reset();
	this.init();

};



editor.plugins.world.data.prototype = {

	defaults: {
		id: 'world-id'
	},

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

	onImport: function(data) {

		this.reset();

		var refresh = false;
		for (var d in data) {
			if (this.__data[d] && this.__data[d] !== data[d]) {
				this.__data[d] = data[d];
				refresh = true;
			}
		}


		if (refresh === true) {
			this.__refreshUI();
		}

	},

	onExport: function(data) {

		for (var d in this.__data) {
			data[d] = this.__data[d];
		}

	},



	/*
	 * PRIVATE API
	 */
	__initUI: function() {

		var content,
			fieldset = this.__fieldset;

		fieldset.clear();

		content = new ly.ui('b', 'Identifier');
		fieldset.add(content);

		this.__ui.id = new ly.ui.input('text', this.__data.id, function(value) {
			this.__data.id = value;
		}, this);
		fieldset.add(this.__ui.id);

	},

	__refreshUI: function() {

		if (this.__ui === undefined) {
			return;
		}

		for (var prop in this.__ui) {
			this.__ui[prop].set(this.__data[prop]);
		}

	}

};

