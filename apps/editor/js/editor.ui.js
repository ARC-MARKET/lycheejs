
editor.ui = function(settings) {

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

};



editor.ui.prototype = {

	defaults: {
		tabContext: '#editor-tabs',
		widgetContext: '#editor-widgets'
	},

	reset: function() {

		this.__tabs = {};
		this.__tabContext = document.querySelector(this.settings.tabContext);
		this.__widgetContext = document.querySelector(this.settings.widgetContext);

		this.__lightboxes = {};
		this.__sidebars = {};
		this.__widgets = {};

	},

	addTab: function(desc, type, model, func, scope) {

		type = type || null;
		model = model || null;
		func = func || function() {};
		scope = scope || window;

		var id = type + '-' + model + '';
		if (this.__tabs[id] === undefined && this.__tabContext !== null) {

			var tab = document.createElement('li');
			tab.className = 'editor-tab ' + type;
			tab.innerHTML = desc;
			tab.onclick = function() {
				func.call(scope, type, model);
			};

			if (this.__tabContext !== null) {
				if (id === 'null-null') {
					this.__tabContext.appendChild(tab);
					this.__newTab = tab;
				} else {
					this.__tabContext.insertBefore(tab, this.__newTab);
				}
			}

			this.__tabs[id] = new ly.ui(tab);

		}

		return this.__tabs[id];

	},

	addSidebar: function(type, element) {

		element = element || document.createElement('div');

		this.__sidebars[type] = {
			element: new ly.ui(element),
			fieldsets: {}
		};

		element.className = 'editor-sidebar';

		if (element.parentNode === null) {
			element.id = 'editor-sidebar-' + type;
			document.body.appendChild(element);
		}

		return this.__sidebars[type];

	},

	addFieldset: function(type, name) {

		if (this.__sidebars[type] === undefined) {
			this.addSidebar(type);
		}

		var fieldset = new editor.ui.fieldset(name);
		fieldset.addTo(this.__sidebars[type].element);

		this.__sidebars[type].fieldsets[name] = fieldset;
		return this.__sidebars[type].fieldsets[name];

	},

	addLightbox: function(type, name) {

		if (this.__lightboxes[type] === undefined) {
			this.__lightboxes[type] = {};
		}

		var id = 'editor-lightbox-' + type + '-' + name;
		var lightbox = new ly.ui.lightbox(id, undefined);
		lightbox.addTo(document.body);

		this.__lightboxes[type][name] = lightbox;
		return this.__lightboxes[type][name];

	},

	addWidget: function(name, useIconSet) {

		useIconSet = useIconSet === true ? true : false;

		if (this.__widgets[name] === undefined) {

			var widget = new ly.ui('div', undefined);
			widget.element.id = 'editor-widget-' + name;
			widget.element.className = 'gui-widget';

			if (useIconSet === true) {
				widget.element.className += ' gui-iconset';
			}

			if (this.__widgetContext !== null) {
				widget.addTo(this.__widgetContext);
			}

			this.__widgets[name] = widget;

		}

		return this.__widgets[name];

	},

	getSidebar: function(type) {

		if (this.__sidebars[type] !== undefined) {
			return this.__sidebars[type];
		}

		return null;

	}

};



editor.ui.fieldset = function(name) {

	// Enforce name to be a String
	name = name + '';

	var fieldset = document.createElement('fieldset');
	fieldset.id = 'editor-fieldset-' + name.toLowerCase();

	var legend = document.createElement('legend')
	legend.innerHTML = name;
	fieldset.appendChild(legend);

	var wrapper = document.createElement('ul');
	fieldset.appendChild(wrapper);

	this.__wrapper = wrapper;
	this.__root = fieldset;

};



editor.ui.fieldset.prototype = {

	clear: function() {
		this.__wrapper.innerHTML = '';
	},

	next: function(name) {

		this.element = document.createElement('li');
		this.__wrapper.appendChild(this.element);

		if (typeof name === 'string') {
			this.element.className = name;
		}

		return new ly.ui(this.element);

	},

	add: function(element) {

		// Inception! :D
		if (element && element.element) {
			element = element.element;
		}

		if (element instanceof HTMLElement) {
			if (this.element === undefined) {
				this.next();
			}
			this.element.appendChild(element);
		}

	},

	addTo: function(element) {

		if (element && element.element) {
			element = element.element;
		}

		if (element instanceof HTMLElement) {
			element.appendChild(this.__root);
		}

	},

	destroy: function() {
		if (this.__root.parentNode) {
			this.__root.parentNode.removeChild(this.__root);
		}
	}

};

