
editor.plugins.world.objects = function(canvas, ui, editor) {

	this.type = 'world';
	this.name = 'objects';

	this._canvas = canvas;
	this._ui = ui;
	this._editor = editor;

	this.reset();
	this.init();

};



editor.plugins.world.objects.prototype = {

	reset: function() {

		this.__objects = new ly.cache();
		this.__models = this._editor._cache.models;

		this.__currentObject = null;
		this.__data = {
			model: null,
			speed: {
				x: 0,
				y: 0,
				z: 0
			}
		};

		this.__mode = 'create';

		this.__zLayer = 0;

	},

	/*
	 * PLUGIN API
	 */
	init: function() {

		this.__fieldset = this._ui.addFieldset(this.type, this.name);

		this.__layers = {
			background: this._canvas.addLayer(this.name + '-background', 'canvas'),
			foreground: this._canvas.addLayer(this.name + '-foreground', 'canvas'),
			preview: this._canvas.addLayer(this.name + '-preview', 'canvas')
		};

		this.__ctxs = {
			background: this.__layers.background.element.getContext('2d'),
			foreground: this.__layers.foreground.element.getContext('2d'),
			preview: this.__layers.preview.element.getContext('2d')
		};

		this.__ui = {};

		this.__layers.preview.bind('down', this.__onDown, this);
		this.__layers.preview.bind('move', this.__onMove, this);



		// Note: refresh flag is for redrawing all layers, not necessary
		// if only preview layer has changed its contents
		this.__layers.foreground.bind('refresh', function() {
			this.refresh(true);
		}, this);

		this.__debug();

		this.__initUI();

	},

	refresh: function(refreshLayers, refreshData) {

		refreshLayers = refreshLayers === false ? false : true;
		refreshData = refreshData === true ? true : false;

		this.__zLayer = this._canvas.getZLayer();

		if (refreshLayers === true) {
			this.__refreshObjectLayers();
		}

		if (refreshData === true && this.__currentObject !== null) {

			var obj = this.__currentObject;
			this.__data = {};
			this.__data.model = obj.model;
			this.__data.speed = {
				x: 0,
				y: 0,
				z: 0
			};


			// Incremental data, which is not therefore required
			if (obj.speed !== undefined) {

				this.__data.speed.x = obj.speed.x || 0;
				this.__data.speed.y = obj.speed.y || 0;
				this.__data.speed.z = obj.speed.z || 0;

			}

			this.__refreshUI();

		}

		// Always refresh the preview layer
		this.__refreshPreviewLayer();

	},

	onActivate: function() {
		for (var layerId in this.__layers) {
			this.__layers[layerId].show();
		}
	},

	onDeactivate: function() {
		for (var layerId in this.__layers) {
			this.__layers[layerId].hide();
		}
	},

	onImport: function(data) {

		this.reset();

		if (Object.prototype.toString.call(data.objects) === '[object Array]') {

			for (var o = 0, l = data.objects.length; o < l; o++) {
				var object = data.objects[o];
				this.__objects.add(object);
			}

		}

		this.__refreshUI();
		this.refresh(true);

	},

	onExport: function(data) {

		data.objects = [];

		var objects = this.__objects.all();
		for (var o in objects) {

			var object = JSON.parse(JSON.stringify(objects[o]));
			delete object.id;
			data.objects.push(object);

		}

	},



	/*
	 * PUBLIC API
	 */
	setMode: function(mode) {

		if (this.__mode !== mode) {

			this.__mode = mode;

			if (mode === 'modify') {
				this.__currentObject = null;
				this.refresh(true);
			}

			return true;
		}

		return false;

	},



	/*
	 * PRIVATE API
	 */
	__debug: function() {

		var context;

		context = this.__ctxs.background;
		context.fillStyle = '#f00';
		context.fillRect(0, 0, 100, 100);

		context = this.__ctxs.foreground;
		context.fillStyle = '#0f0';
		context.fillRect(50, 50, 100, 100);

		context = this.__ctxs.preview;
		context.fillStyle = '#00f';
		context.fillRect(100, 100, 100, 100);

	},

	__initUI: function() {

		var content,
			fieldset = this.__fieldset;


		this.__ui.mode = new ly.ui.radios([ 'create', 'modify' ], this.__mode, this.setMode, this);


		fieldset.clear();
		fieldset.next('right');

		content = new ly.ui('span', 'create objects');
		content.element.className = 'radio-desc';
		fieldset.add(content);
		this.__ui.mode.elements[0].addTo(fieldset);


		fieldset.next('right');

		content = new ly.ui('span', 'modify objects');
		content.element.className = 'radio-desc';
		fieldset.add(content);
		this.__ui.mode.elements[1].addTo(fieldset);


		fieldset.next();

		content = new ly.ui('b', 'Model');
		fieldset.add(content);

		content = new ly.ui.select(function(value) {
			this.__data.model = value;
		}, this);
		this.__ui.model = content;
		fieldset.add(content);


		fieldset.next();

		content = new ly.ui('b', 'Position');
		fieldset.add(content);

		content = new ly.ui.input('text', '0/0/0');
		this.__ui.position = content;
		fieldset.add(content);


		fieldset.next();

		content = new ly.ui('b', 'Speed');
		fieldset.add(content);

		content = new ly.ui.input('text', '0/0/0', function(value) {

			var speed = value.split('/');
			speed[0] = parseInt(speed[0], 10);
			speed[1] = parseInt(speed[1], 10);
			speed[2] = parseInt(speed[2], 10);

			if (!isNaN(speed[0])) {
				this.__data.speed.x = speed[0];
			} else {
				speed[0] = 0;
			}

			if (!isNaN(speed[1])) {
				this.__data.speed.y = speed[1];
			} else {
				speed[1] = 0;
			}

			if (!isNaN(speed[2])) {
				this.__data.speed.z = speed[2];
			} else {
				speed[2] = 0;
			}

			return speed.join('/');

		}, this);
		this.__ui.speed = content;
		fieldset.add(content);

	},

	__refreshUI: function() {

		if (this.__ui === undefined) {
			return;
		}

		if (this.__filledModelSelectorFlag === undefined) {

			var models = this.__models.all();
			for (var mId in models) {

				var model = models[mId];

				if (this.__data.model === null) {
					this.__data.model = model.id;
				}

				new ly.ui.option(model.id + ' (' + model.type.substr(0, 3) + ')', model.id).addTo(this.__ui.model);

			}

			this.__filledModelSelectorFlag = true;

		}


		for (var prop in this.__data) {

			if (Object.prototype.toString.call(this.__data[prop]) === '[object Object]') {
				continue;
			}

			if (this.__ui[prop] !== undefined) {
				this.__ui[prop].set(this.__data[prop]);
			}

		}

	},

	// We don't need to refresh the complete UI all the time
	__refreshUIPosition: function(relative) {

		if (this.__ui === undefined) {
			return;
		}

		this.__ui.position.set(relative.x + '/' + relative.y + '/' + relative.z);

	},

	__refreshPreviewLayer: function() {

		var ctx = this.__ctxs.preview,
			width = this.__layers.preview.element.width,
			height = this.__layers.preview.element.height;

		ctx.clearRect(0, 0, width, height);

	},

	__refreshObjectLayers: function() {

		var objects = this.__objects.all(),
			width = this.__layers.foreground.element.width,
			height = this.__layers.foreground.element.height,
			ctxs = this.__ctxs;

		this.__ctxs.foreground.clearRect(0, 0, width, height);
		this.__ctxs.background.clearRect(0, 0, width, height);
		this.__ctxs.background.globalAlpha = 0.5;

		for (var o in objects) {

			var object = objects[o],
				absolute = this._canvas.translateTo('absolute', object.position, false, true);

			if (object.position.z === undefined) {
				object.position.z = 0;
			}

			if (
				absolute.x > 0 && absolute.x < width
				&& absolute.y > 0 && absolute.y < height
			) {

				if (object.position.z === this.__zLayer) {
					this.__drawObject(object, this.__ctxs.foreground);
				} else if (object.position.z === (this.__zLayer - 1)) {
					this.__drawObject(object, this.__ctxs.background);
				}

			}

		}

	},

	__drawObject: function(object, context, blockingInfo) {

		blockingInfo = blockingInfo === true ? true : false;

		if (context === undefined) {
			context = this.__ctxs.preview;
		}


		var model = this.__models.get(object.model),
			sprite = model.get('sprite'),
			state = model.getState(model.get('state')),
			position = this._canvas.translateTo('absolute', object.position, false, true);


		context.drawImage(
			sprite.image,
			0, 0, sprite.width, sprite.height,
			position.x + state.sprite.x, position.y + state.sprite.y, sprite.width, sprite.height
		);


		if (blockingInfo === true) {

			if (this.__isBlockingAt(object, object.position)) {
				context.fillStyle = 'rgba(255,0,0,0.5)';
				context.fillRect(position.x + state.sprite.x, position.y + state.sprite.y, sprite.width, sprite.height);
			}

		}

		if (object === this.__currentObject) {
			context.fillStyle = '#f00';
			context.fillRect(position.x - 3, position.y - 3, 7, 7);
		}

	},

	__onDown: function(relative, absolute) {

		if (this.__mode === 'create' && this.__data.model !== null) {

			this.__currentObject = {
				model: this.__data.model,
				position: {
					x: relative.x,
					y: relative.y
				}
			};


			// Default is 2D non-layered object
			if (relative.z !== 0) {
				this.__currentObject.position.z = relative.z;
			}


			// Already another object here, which is blocking
			if (this.__isBlockingAt(this.__currentObject, this.__currentObject.position) === true) {
				return false;
			}


			if (
				this.__data.speed.x !== 0
				|| this.__data.speed.y !== 0
				|| this.__data.speed.z !== 0
			) {

				this.__currentObject.speed = {};

				if (this.__data.speed.x !== 0) this.__currentObject.speed.x = this.__data.speed.x;
				if (this.__data.speed.y !== 0) this.__currentObject.speed.y = this.__data.speed.y;
				if (this.__data.speed.z !== 0) this.__currentObject.speed.z = this.__data.speed.z;

			}


			this.__objects.add(this.__currentObject);
			this.refresh(true);


		} else if (this.__mode === 'modify' && this.__currentObject === null){

			var object = this.__getObjectByPosition(relative);

			// Note: Can also be NULL
			this.__currentObject = object;
			this.refresh(false, true);


		} else if (this.__mode === 'modify' && this.__currentObject !== null) {

			this.__currentObject = null;
			this.refresh(true);

		}

	},

	__onMove: function(relative, absolute) {

		if (this.__mode === 'create' && this.__data.model !== null) {

			this.refresh(false);

			var object = {
				model: this.__data.model,
				position: {
					x: relative.x,
					y: relative.y,
					z: relative.z
				}
			};

			this.__drawObject(object, this.__ctxs.preview, true);


		} else if (this.__mode === 'modify' && this.__currentObject !== null) {

			this.__currentObject.position = {
				x: relative.x,
				y: relative.y,
				z: relative.z
			};

			this.refresh(true);

		}

		this.__refreshUIPosition(relative);

	},

	__isBlockingAt: function(object, position) {

		var position = object.position,
			model = this.__models.get(object.model),
			bb = model.get('boundingBox');

		var objects = this.__objects.all();
		for (var o in objects) {

			var oObject = objects[o];

			if (oObject === object) {
				continue;
			}

			var oPosition = oObject.position,
				oModel = this.__models.get(oObject.model),
				oBB = oModel.get('boundingBox');


			if (
				position.x + bb.maxX > oPosition.x + bb.minX
				&& position.x + bb.minX < oPosition.x + bb.maxX
				&& position.y + bb.maxY > oPosition.y + bb.minY
				&& position.y + bb.minY < oPosition.y + bb.maxY
				&& (position.z || 0) === (oPosition.z || 0)
			) {
				return true;
			}

		}

		return false;

	},

	__getObjectByPosition: function(position) {

		var objects = this.__objects.all(),
			getBoundingBox = this._editor.getPlugin('model', 'polygon').getBoundingBox;

		for (var o in objects) {

			var object = objects[o],
				oPos = object.position,
				model = this.__models.get(object.model);

			var bb = getBoundingBox(model);

			if (
				position.x > object.position.x + bb.minX
				&& position.x < object.position.x + bb.maxX
				&& position.y > object.position.y + bb.minY
				&& position.y < object.position.y + bb.maxY
				&& position.z === object.position.z
			) {
				return object;
			}

		}

	}

};

