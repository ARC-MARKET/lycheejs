
ly.view = function(settings) {

	this.settings = {};

	for (var d in this.defaults) {
		this.settings[d] = this.defaults[d];
	}

	if (Object.prototype.toString.call(settings) === '[object Object]') {
		for (var s in settings) {
			this.settings[s] = settings[s];
		}
	}


	// Initial setup
	this.__dirty = {
		viewport: true,
		boundingBox: true
	};

	this.__init();

	this.getBoundingBox();
	this.getViewport();

};



ly.view.prototype = {

	defaults: {
		id: 'ly-view',
		position: {
			x: 0, y: 0, z: 0
		},
		size: {
			x: 10, y: 6, z: 6
		},
		tile: 42
	},

	/*
	 * PRIVATE API
	 */
	__init: function() {

		var s = this.settings;

		this.__position = {
			x: s.position.x,
			y: s.position.y,
			z: s.position.z || 0
		};

		this.__size = {
			x: s.size.x,
			y: s.size.y,
			z: s.size.z || 0
		};

		this.__tile = s.tile;


	},

	__flagDirty: function() {

		this.__dirty.boundingBox = true;
		this.__dirty.viewport = true;

	},


	/*
	 * PUBLIC API
	 */
	get: function(property) {

		if (this[property] !== undefined) {
			return this[property];
		}

		var method = 'get' + property.charAt(0).toUpperCase() + property.substr(1);
		if (this[method] instanceof Function) {
			return this[method]();
		}

		return null;

	},

	getBoundingBox: function() {

		if (this.__dirty.boundingBox === true) {

			var pos = this.__position,
				size = this.__size;

			this.__boundingBox = {
				minX: pos.x - (size.x / 2),
				maxX: pos.x + (size.x / 2),
				minY: pos.y - (size.y / 2),
				maxY: pos.y + (size.y / 2),
				minZ: pos.z - (size.z / 2),
				maxZ: pos.z + (size.z / 2)
			};

			this.__dirty.boundingBox = false;

		}


		return this.__boundingBox;

	},

	getViewport: function() {

		if (this.__dirty.viewport === true) {

			this.__viewport = {
				size: this.__size,
				position: this.__position,
				tile: this.__tile
			};

			this.__dirty.viewport = false;

		}

		return this.__viewport;

	},

	setContext: function(context) {

		if (context instanceof HTMLElement) {

			this.context = context;
			this.context.id = this.settings.id || ('ly-view-' + ly.view.__contextId++);

			if (this.context.parentNode === null) {
				document.body.appendChild(this.context);
			}

		}

	},

	shift: function(margin) {

		margin = margin || {};
		margin.x = typeof margin.x === 'number' ? margin.x : 0;
		margin.y = typeof margin.y === 'number' ? margin.y : 0;
		margin.z = typeof margin.z === 'number' ? margin.z : 0;

		this.__position.x += margin.x;
		this.__position.y += margin.y;
		this.__position.z += margin.z;

		this.__flagDirty();

	},

	shiftTo: function(position) {

		position = position || {};
		position.x = typeof position.x === 'number' ? position.x : this.__position.x;
		position.y = typeof position.y === 'number' ? position.y : this.__position.y;
		position.z = typeof position.z === 'number' ? position.z : this.__position.z;

		this.__position.x = position.x;
		this.__position.y = position.y;
		this.__position.z = position.z;

		this.__flagDirty();

	}

};

ly.view.__contextId = 0;

