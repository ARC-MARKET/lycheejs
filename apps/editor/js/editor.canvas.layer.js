
editor.canvas.layer = function(name, type, zIndex) {

	this.name = name;
	this.type = type || 'html';
	this.zIndex = zIndex || null;

	this.active = true;

	this.__init();

};



editor.canvas.layer.prototype = {

	hide: function() {
		this.active = false;
		this.element.className = 'editor-canvas-layer hidden';
	},
	show: function() {
		this.active = true;
		this.element.className = 'editor-canvas-layer';
	},

	bind: function(event, func, scope) {

		func = func || function() {};
		scope = scope || this;

		this.__events[event].push({
			func: func,
			scope: scope
		});

	},

	trigger: function(event, relative, absolute) {

		for (var e = 0, l = this.__events[event].length; e < l; e++) {
			var entry = this.__events[event][e];
			entry.func.call(entry.scope, relative, absolute);
		}

	},

	triggerOnce: function(data, relative, absolute) {

		if (
			Object.prototype.toString.call(data) === '[object Object]'
			&& typeof data.name === 'string'
		) {

			data.func = data.func || function() {};
			data.scope = data.scope || window;

			data.func.call(data.scope, data.name, relative, absolute);

		}

	},

	__init: function() {

		this.__events = {
			'down': [],
			'move': [],
			'up': [],
			'refresh': []
		};

		this.element = document.createElement(
			this.type === 'canvas' ? 'canvas' : 'div'
		);
		this.element.id = 'editor-canvas-' + this.name;
		this.element.className = 'editor-canvas-layer';

		if (this.zIndex !== null) {
			this.element.style.zIndex = this.zIndex;
		}

	}

};

