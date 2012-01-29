editor.plugins.base = {};

editor.plugins.base.package = function(canvas, ui, editor) {

	this.type = 'base';
	this.name = 'package';

	this._ui = ui;
	this._editor = editor;

	this.reset();
	this.init();

};



editor.plugins.base.package.prototype = {

	defaults: {
		name: 'Package Name',
		author: 'Author'
	},

	/*
	 * PLUGIN API
	 */
	reset: function() {

		this.__data = {};

		for (var d in this.defaults) {
			this.__data[d] = this.defaults[d];
		}

		// Relink Editor's Cache, may have changed
		this._cache = this._editor._cache;

		this.__refreshUI();

	},

	init: function() {

		this.__fieldset = this._ui.addFieldset(this.type, this.name);
		this.__lightbox = this._ui.addLightbox(this.type, this.name);
		this.__ui = {};

		this.__initUI();

	},

	onMetaImport: function(data) {

		var refresh = false;
		if (Object.prototype.toString.call(data) === '[object Object]') {

			this.reset();

			if (data.name !== undefined) {
				refresh = true;
				this.__data.name = data.name;
			}

			if (data.author !== undefined) {
				refresh = true;
				this.__data.author = data.author;
			}

		}

		if (refresh === true) {
			this.__refreshUI();
		}

	},


	/*
	 * PUBLIC API
	 */
	importPackage: function(base) {

		this._editor.loadPackage(base);

	},

	exportPackage: function() {

		// Save current model
		this._editor.saveModel();

		var s = this.__settings,
			exportData = {};

		if (s.models === true) {
			exportData.models = [];
			console.log(this._editor._cache.models.all());
		}

		console.log('----------------');

		console.log(this.__settings, this._editor._cache);


		// id based in __data -> world and model array

	},


	/*
	 * PRIVATE API
	 */
	__initUI: function() {

		var content,
			fieldset = this.__fieldset;

		fieldset.clear();

		content = new ly.ui('b', 'Name');
		fieldset.add(content);

		this.__ui.name = new ly.ui.input('text', this.__data.name, function(value) {
			this.__data.name = value;
		}, this);
		fieldset.add(this.__ui.name);


		fieldset.next();

		content = new ly.ui('b', 'Author');
		fieldset.add(content);

		this.__ui.author = new ly.ui.input('text', this.__data.author, function(value) {
			this.__data.author = value;
		}, this);
		fieldset.add(this.__ui.author);


		fieldset.next();

		content = new ly.ui('b', 'BaseURL');
		fieldset.add(content);

		this.__ui.url = new ly.ui.input('text', this._editor.settings.base);
		fieldset.add(this.__ui.url);


		fieldset.next();

		content = new ly.ui.button('Import', function() {
			this.importPackage(this.__ui.url.get());
		}, this);
		fieldset.add(content);

		content = new ly.ui.button('Export', function() {
			this.__showExportLightbox();
		}, this);
		fieldset.add(content);

	},

	__refreshUI: function() {

		if (this.__ui === undefined) {
			return;
		}

		for (var prop in this.__data) {
			this.__ui[prop].set(this.__data[prop]);
		}

	},

	__showExportLightbox: function() {

		var items = [];

		if (this.__lightboxInitialized !== true) {

			this.__settings = {
				models: true,
				worlds: true,
				sprites: false
			};

			this.__lightbox.title('Export Package');

			var headline = new ly.ui('h4', 'Choose what data you want to export:');

			this.__lightbox.add(headline);

			items.push([
				new ly.ui.checkbox(this.__settings.models, function(value) {
					this.__settings.models = value;
				}, this),
				new ly.ui('span', 'Models')
			]);

			items.push([
				new ly.ui.checkbox(this.__settings.worlds, function(value) {
					this.__settings.worlds = value;
				}, this),
				new ly.ui('span', 'Worlds')
			]);

			items.push([
				new ly.ui.checkbox(this.__settings.sprites, function(value) {
				this.__settings.sprites = value;
			}, this),
				new ly.ui('span', 'Sprites')
			]);


			var list = new ly.ui('ul');
			for (var i = 0, l = items.length; i < l; i++) {
				var item = new ly.ui('li');
				item.add(items[i][0]);
				item.add(items[i][1]);
				item.addTo(list);
			}
			this.__lightbox.add(list);


			this.__lightbox.add(new ly.ui('hr'));


			content = new ly.ui.button('Export Package', function() {
				this.exportPackage();
				this.__lightbox.hide();
			}, this);
			this.__lightbox.add(content);

			this.__lightboxInitialized = true;

		}

		this.__lightbox.show();

	}

};

