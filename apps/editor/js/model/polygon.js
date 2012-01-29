
editor.plugins.model.polygon = function(canvas, ui) {

	this.type = 'model';
	this.name = 'polygon';

	this._canvas = canvas;
	this._ui = ui;

	this.reset();
	this.init();

};



editor.plugins.model.polygon.prototype = {

	/*
	 * PLUGIN API
	 */
	reset: function() {

		this.__polygon = {};
		this.__entities = {};
		this.__pointId = 0;

		this.__zLayer = 0;

		this.__dragging = null;

		if (this.__polygonLayer && this.__polygonLayer.element) {
			this.__polygonLayer.element.innerHTML = '';
		}

	},

	init: function() {

		this.reset();

		this.__fieldset = this._ui.addFieldset(this.type, this.name);
		this.__polygonLayer = this._canvas.addLayer(this.name, undefined, 2);
		this.__lineLayer = this._canvas.addLayer(this.name + '-lines', 'canvas', 2);
		this.__ctx = this.__lineLayer.element.getContext('2d');


		this.__polygonLayer.bind('down', function(relative, absolute) {

			// Drag an existing Point
			for (var pId in this.__polygon) {
				var point = this.__polygon[pId];
				if (relative.x === point.x && relative.y === point.y) {
					this.__dragging = pId;
					return null;
				}
			}


			// Add a new Point
			if (this.__dragging === null) {
				this.__addPoint(relative, absolute);
			}

		}, this);

		this.__polygonLayer.bind('move', function(relative, absolute) {
			if (this.__dragging !== null) {
				this.__updatePoint(this.__dragging, relative, absolute);
			}
		}, this);

		this.__polygonLayer.bind('up', function() {
			this.__dragging = null;
		}, this);

		this.__polygonLayer.bind('refresh', function() {
			this.refresh(true);
		}, this);

		this.__initUI();

	},

	refresh: function(flush) {

		flush = flush === true ? true : false;

		this.__zLayer = this._canvas.getZLayer();

		this.__refreshPolygonLayer(flush);
		this.__refreshLineLayer(flush);

	},

	onActivate: function() {
		this.__polygonLayer.show();
		this.__lineLayer.show();
	},

	onDeactivate: function() {
		this.__polygonLayer.hide();
		this.__lineLayer.hide();
	},

	onImport: function(data) {

		this.reset();

		if (Object.prototype.toString.call(data.polygon) === '[object Array]') {

			for (var p = 0, l = data.polygon.length; p < l; p++) {

				var point = data.polygon[p];
				var position = this._canvas.translateTo('absolute', point);

				this.__addPoint(point, position);

			}

		} else {
			this.refresh(false);
		}

	},

	onExport: function(data) {

		var polygon = [];

		for (var pId in this.__polygon) {

			var point = this.__polygon[pId],
				pData = {};

			pData.x = point.x;
			pData.y = point.y;

			if (point.z !== 0) {
				pData.z = point.z;
			}

			polygon.push(pData);

		}

		data.polygon = polygon;

	},



	/*
	 * PUBLIC API
	 */
	getBoundingBox: function(data) {

		if (data === undefined) {

			var data = { id: 'test' };
			this.onExport(data);
		}


		var model = new ly.model(data);

		var bb = model.getBoundingBox();
		model = null;

		return bb;

	},



	/*
	 * PRIVATE API
	 */
	__initUI: function() {

		var content,
			fieldset = this.__fieldset;

		fieldset.clear();

		content = new ly.ui.button('Remove last Point', function() {
			this.__removePoint();
		}, this);
		fieldset.add(content);

	},

	__refreshLineLayer: function(flush) {

		flush = flush === true ? true : false;

		if (this.__ctx !== undefined) {

			var ctx = this.__ctx;
			ctx.clearRect(0, 0, this.__lineLayer.element.width, this.__lineLayer.element.height);

			ctx.strokeStyle = 'red';
			ctx.lineWidth = 1;

			ctx.beginPath();


			var firstEntity;
			for (var eId in this.__entities) {

				var entity = this.__entities[eId];

				if (entity.z === this.__zLayer) {

					if (firstEntity === undefined) {
						ctx.moveTo(entity.x, entity.y);
						firstEntity = entity;
					} else {
						ctx.lineTo(entity.x, entity.y);
					}

				}

			}

			if (firstEntity !== undefined) {
				ctx.lineTo(firstEntity.x, firstEntity.y);
			}


			ctx.stroke();
			ctx.closePath();

		}

	},

	__refreshPolygonLayer: function(flush) {

		flush = flush === true ? true : false;

		for (var id in this.__polygon) {

			var point = this.__polygon[id];

			if (flush === true) {

				var position = this._canvas.translateTo('absolute', {
					x: point.x,
					y: point.y
				}, false, true);

				if (this.__entities[id] === undefined) {
					this.__entities[id] = {};
				}

				this.__entities[id].x = position.x;
				this.__entities[id].y = position.y;

			}


			var entity = this.__entities[id];

			if (entity.node === undefined) {
				entity.node = document.createElement('div');
				entity.node.style.cssText = 'display:block;position:absolute;width:7px;height:7px;background:red;';
			}


			if (
				point.z === this.__zLayer
				&& entity.node.parentNode !== this.__polygonLayer.element
			) {

				this.__polygonLayer.element.appendChild(entity.node);

			} else if (
				point.z !== this.__zLayer
				&& entity.node.parentNode !== null
			) {

				entity.node.parentNode.removeChild(entity.node);

			}


			// Refresh the entity anyways
			entity.node.style.left = (entity.x - 3) + 'px';
			entity.node.style.top = (entity.y - 3) + 'px';

		}

	},

	__addPoint: function(relative, absolute) {

		var point = {
			id: ++this.__pointId,
			x: relative.x,
			y: relative.y,
			z: relative.z || 0
		};

		this.__entities[point.id] = {
			x: absolute.x * absolute.tile,
			y: absolute.y * absolute.tile,
			z: relative.z || 0
		};

		this.__polygon[point.id] = point;

		this.refresh(false);

	},

	__updatePoint: function(id, relative, absolute) {

		var point = this.__polygon[id],
			entity = this.__entities[id];

		if (point !== undefined && entity !== undefined) {
			point.x = relative.x;
			point.y = relative.y;
			point.z = relative.z || 0;
			entity.x = absolute.x * absolute.tile;
			entity.y = absolute.y * absolute.tile;
			entity.z = relative.z || 0;
		}

		this.refresh(false);

	},

	__removePoint: function() {

		var id = this.__pointId;
		delete this.__polygon[id];

		var entity = this.__entities[id];
		entity.node.parentNode.removeChild(entity.node);
		delete this.__entities[id];

		this.__pointId--;

		this.refresh(false);

	}

};

