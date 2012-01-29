
editor = function(settings) {

	this.settings = {};

	for (var d in this.defaults) {
		this.settings[d] = this.defaults[d];
	}

	if (Object.prototype.toString.call(settings) === '[object Object]') {
		for (var s in settings) {
			this.settings[s] = settings[s];
		}
	}

	this.reset();

	if (this.settings.base !== null) {
		this.loadPackage(this.settings.base);
	}

};

editor.prototype = {

	defaults: {
		canvas: {
			context: '#editor-canvas',
			size: {
				x: 16,
				y: 5,
				tile: 42
			}
		},
		context: '#editor',
		base: null,
		type: 'model' // default type
	},



	/*
	 * PRIVATE API
	 */
	__refreshUI: function() {

		var selector, models, m, model;

		if (this.__lightbox !== undefined) {

			selector = this.__lightboxModelSelector;
			models = this._cache.models.all();

			selector.clear();

			for (m in models) {
				model = models[m];
				new ly.ui.option(model.id, model.id).addTo(selector);
			}


			selector = this.__lightboxWorldSelector;
			models = this._cache.worlds.all();

			selector.clear();

			for (m in models) {
				model = models[m];
				new ly.ui.option(model.id, model.id).addTo(selector);
			}

		}

	},

	__showOpenLightbox: function() {

		if (this.__lightbox === undefined) {

			var content;

			this.__lightbox = this.ui.addLightbox('editor', 'open');

			this.__lightbox.title('Open Model or World');

			content = new ly.ui.select();
			this.__lightboxModelSelector = content;
			this.__lightbox.add(content);

			content = new ly.ui.button('Open Model', function() {
				this.openModel('model', this.__lightboxModelSelector.get());
				this.__lightbox.hide();
			}, this);
			this.__lightbox.add(content);


			this.__lightbox.add(new ly.ui('hr'));


			content = new ly.ui.select();
			this.__lightboxWorldSelector = content;
			this.__lightbox.add(content);

			content = new ly.ui.button('Open World', function() {
				this.openModel('world', this.__lightboxWorldSelector.get());
				this.__lightbox.hide();
			}, this);
			this.__lightbox.add(content);

		}

		this.__refreshUI();

		this.__lightbox.show();

	},



	/*
	 * PUBLIC API
	 */
	reset: function() {

		this.__current = {
			type: this.settings.type,
			model: {}
		};

	},

	init: function() {

		this.context = document.querySelector(this.settings.context);

		this.canvas = new editor.canvas(this.settings.canvas);
	   	this.ui = new editor.ui(this.settings.ui);


		this.ui.addTab('New Model', 'model', null, this.openModel, this);
		this.ui.addTab('New World', 'world', null, this.openModel, this);

		this.ui.addTab('Open', null, null, function() {
			this.__showOpenLightbox();
		}, this);

		this.ui.addSidebar('base', document.querySelector('#editor-sidebar-base'));
		this.ui.addSidebar('model', document.querySelector('#editor-sidebar-model'));
		this.ui.addSidebar('world', document.querySelector('#editor-sidebar-world'));


		this.plugins = {};
		for (var type in editor.plugins) {
			this.plugins[type] = {};
			for (var name in editor.plugins[type]) {
				this.plugins[type][name] = new editor.plugins[type][name](this.canvas, this.ui, this);
			}
		}

		this.widgets = {};
		for (var name in editor.widgets) {
			this.widgets[name] = new editor.widgets[name](this.canvas, this.ui, this);
		}

		this.setType(this.settings.type);

		this.__initialized = true;

	},

	loadPackage: function(base) {

		var package = new ly.package({
			waitForSprites: true
		});

		package.load(base, function(cache) {

			this._cache = cache;

			// FIXME: Bad place to do so, but the only way for now.
			if (this.__initialized !== true) {
				this.init();
			}

			var meta = package.get('meta');
			this.importMeta(meta);

		}, this);

	},

	openModel: function(type, model, noConfirm) {

		noConfirm = noConfirm === true ? true : false;

		if (type === undefined || model === undefined) {
			return false;
		}


		if (model instanceof ly.model === false) {

			var cache = this._cache[type + 's'];
			if (cache !== undefined) {
				model = cache.get(model);
			}

			if (model === null) {
				model = {};
			}

		}


		if (
			model !== null
			&& Object.prototype.toString.call(this.plugins[type]) === '[object Object]'
		) {

			if (Object.prototype.toString.call(this.__current.model) === '[object Object]') {
				this.saveModel(noConfirm);
			}


			this.setType(type);


			for (var name in this.plugins[type]) {
				var plugin = this.plugins[type][name];
				plugin.onImport && plugin.onImport(model);
			}

			this.__current = {
				type: type,
				model: model
			};

		}

	},

	saveModel: function(noConfirm) {

		noConfirm = noConfirm === true ? true : false;

		if (noConfirm === false && window.confirm('Save current Model?')) {
			for (var name in this.plugins[this.__current.type]) {
				this.plugins[this.__current.type][name].onExport(this.__current.model);
			}
		}


		if (this.__current.model.id !== undefined) {
			this._cache[this.__current.type + 's'].add(this.__current.model);
		}

	},

	importMeta: function(data) {

		if (Object.prototype.toString.call(this.plugins) === '[object Object]') {

			for (var type in this.plugins) {
				for (var name in this.plugins[type]) {
					var plugin = this.plugins[type][name];
					plugin.onMetaImport && plugin.onMetaImport(data);
				}
			}

		}

	},

	setType: function(type) {

		if (
			this.__type !== type
			&& Object.prototype.toString.call(this.plugins[type]) === '[object Object]'
		) {

			var oppositeType = type === 'model' ? 'world' : 'model';
			for (var name in this.plugins[oppositeType]) {
				var plugin = this.plugins[oppositeType][name];
				plugin.onDeactivate && plugin.onDeactivate();
			}

			var oppositeSidebar = this.ui.getSidebar(oppositeType);
			if (oppositeSidebar !== null) {
				oppositeSidebar.element.hide();
			}


			for (var name in this.plugins[type]) {
				var plugin = this.plugins[type][name];
				plugin.onActivate && plugin.onActivate();
			}

			var sidebar = this.ui.getSidebar(type);
			if (sidebar !== null) {
				sidebar.element.show();
			}

			this.__type = type;

		}

	},

	getPlugin: function(type, name) {

		if (this.plugins[type] !== undefined && this.plugins[type][name] !== undefined) {
			return this.plugins[type][name];
		}

		return null;

	}

};



/*
 * Required Namespaces
 */
editor.plugins = {};
editor.widgets = {};

