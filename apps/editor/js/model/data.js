
editor.plugins.model = {};

editor.plugins.model.data = function(canvas, ui) {

	this.type = 'model';
	this.name = 'data';

	this._canvas = canvas;
	this._ui = ui;

	this.reset();
	this.init();

};



editor.plugins.model.data.prototype = {

	defaults: {
		mass: 10,
		id: 'model-id',
		type: 'dynamic' // dynamic, static
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


		fieldset.next();

		content = new ly.ui('b', 'Mass');
		fieldset.add(content);

		this.__ui.mass = new ly.ui.input('number', this.__data.mass, function(value) {
			this.__data.mass = value;
		}, this);
		fieldset.add(this.__ui.mass);


		fieldset.next();

		content = new ly.ui('b', 'Type');
		fieldset.add(content);

		this.__ui.type = new ly.ui.select(function(value) {
			this.__data.type = value;
		}, this);
		new ly.ui.option('Dynamic', 'dynamic').addTo(this.__ui.type);
		new ly.ui.option('Static', 'static').addTo(this.__ui.type);
		fieldset.add(this.__ui.type);

	},

	__refreshUI: function() {
		for (var prop in this.__ui) {
			this.__ui[prop].set(this.__data[prop]);
		}
	}


};

