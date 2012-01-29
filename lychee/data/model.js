ly.model = function(data) {

	for (var d in this.defaults) {
		this[d] = this.defaults[d];
	}


	for (var dd in data) {

		if (dd === 'states') {
			this.__deserializeStates(data[dd]);
		} else if (dd !== 'state') {
			this[dd] = data[dd];
		}

	}

	if (this.id === null) {
		this.id = 'ly-model-' + ly.model.__id++;
	}

	if (data.state !== undefined) {
		this.setState(data.state);
	} else {
		this.setState('default');
	}

};

ly.model.__id = 0;



ly.model.prototype = {

	defaults: {
		id: null,
		state: 'default',
		type: 'dynamic', // dynamic, static
		mass: 0,

		states: null,
		sprite: null
	},

	/*
	 * PRIVATE API
	 */
	__deserializeStates: function(data) {

		if (Object.prototype.toString.call(data) === '[object Object]') {

			this.__states = {};

			for (var id in data) {

				var entry = data[id],
					state = {};


				if (entry.polygon !== undefined) {
					state.polygon = this.__deserializePolygon(entry.polygon);
				}

				state.sprite = {};

				if (
					Object.prototype.toString.call(entry.sprite) === '[object Object]'
					&& typeof entry.sprite.x === 'number'
					&& typeof entry.sprite.y === 'number'
				) {

					state.sprite.x = entry.sprite.x || 0;
					state.sprite.y = entry.sprite.y || 0;

					state.sprite.id = entry.sprite.id || 0;
					state.sprite.animated = entry.sprite.animated === true ? true : false;

				}

				this.__states[id] = state;

			}

		}

	},

	__serializeStates: function() {

		if (Object.prototype.toString.call(this.__states) !== '[object Object]') {
			return null;
		}

		var states = {};

		for (var id in this.__states) {

			var data = this.__states[id];

			states[id] = {};

			if (Object.prototype.toString.call(data.sprite) === '[object Object]') {

				states[id].sprite = {
					id: data.sprite.id
				};

				// false is default
				if (data.sprite.animated === true) {
					states[id].sprite.animated = true;
				}

				if (Object.prototype.toString.call(data.sprite.x) === '[object Number]') {
					states[id].sprite.x = data.sprite.x;
				}

				if (Object.prototype.toString.call(data.sprite.y) === '[object Number]') {
					states[id].sprite.y = data.sprite.y;
				}

			}

			if (Object.prototype.toString.call(data.polygon) === '[object Object]') {

				var polygon = this.__serializePolygon(data.polygon);
				if (polygon !== null) {
					states[id].polygon = polygon;
				}

			}

		}

		return states;

	},

	__deserializePolygon: function(data) {

		if (Object.prototype.toString.call(data) !== '[object Array]') {
			return null;
		}

		var polygon = {},
			pointIds = 'a aa b bb c cc d dd e ee f ff g gg h hh i ii j jj k kk l ll m mm n nn o oo p pp q qq r rr s ss t tt u uu v vv w ww x xx y yy z zz'.split(' '),
			d = 0;

		for (var l = data.length; d < l; d++) {

			var entry = data[d];

			var point = {
				x: entry.x || 0,
				y: entry.y || 0,
				z: entry.z || 0
			};

			polygon[pointIds[d]] = point;

		}

		if (d !== 0) {
			return polygon;
		}


		return null;

	},

	__serializePolygon: function(data) {

		if (Object.prototype.toString.call(data) !== '[object Object]') {
			return null;
		}

		// TODO: Verify what's going on in a Star-like polygon where
		// there's a center point of 0/0/0

		var points = [];

		for (var pointId in data) {

			var srcPoint = data[pointId];

			if (
				srcPoint.x === undefined
				&& srcPoint.y === undefined
				&& srcPoint.z === undefined
			) {
				continue;
			}

			var newPoint = {};

			if (srcPoint.x !== 0) {
				newPoint.x = srcPoint.x;
			}

			if (srcPoint.y !== 0) {
				newPoint.y = srcPoint.y;
			}

			if (srcPoint.z !== 0) {
				newPoint.z = srcPoint.z;
			}

			if (
				newPoint.x !== 0
				&& newPoint.y !== 0
				&& newPoint.z !== 0
			) {
				points.push(newPoint);
			}

		}

		if (points.length !== 0) {
			return points;
		}

		return null;

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

	getBoundingBox: function(state) {

		if (state === undefined) {
			state = this.__state;
		}

		if (this.__states[state] !== undefined) {

			var data = this.__states[state];

			if (data.bb === undefined) {
				data.bb = this.getBoundingBoxFromPolygon(data.polygon);
			}

			return data.bb;

		}

	},

	getBoundingBoxFromPolygon: function(polygon) {

		var bb = {
			minX: 0, maxX: 0,
			minY: 0, maxY: 0,
			minZ: 0, maxZ: 0
		};

		if (Object.prototype.toString.call(polygon) === '[object Object]') {

			for (var pId in polygon) {

				var point = polygon[pId];

				bb.minX = Math.min(bb.minX, point.x);
				bb.minY = Math.min(bb.minY, point.y);
				bb.minZ = Math.min(bb.minZ, point.z);

				bb.maxX = Math.max(bb.maxX, point.x);
				bb.maxY = Math.max(bb.maxY, point.y);
				bb.maxZ = Math.max(bb.maxZ, point.z);

			}

		}

		return bb;

	},

	getState: function(id) {

		if (id !== undefined) {
			return this.__states[id] || null;
		} else if (this.__states[this.__state] !== undefined) {
			return this.__states[this.__state];
		}


		return null;

	},

	setState: function(id) {

		if (this.__states[id] !== undefined) {
			this.__state = id;
			return true;
		}

		return false;

	},

	serialize: function() {

		var data = {};

		if (!this.id.match(/ly-model/)) {
			data.id = this.id;
		}

		if (this.type !== this.defaults.type) {
			data.type = this.type;
		}

		if (this.mass !== this.defaults.mass) {
			data.mass = this.mass;
		}

		// Successfully loaded sprite image, so it's valid
		if (this.sprite !== null && this.sprite.image !== undefined) {
			data.sprite = this.sprite.url;
		}

		data.states = this.__serializeStates();

		return data;

	}

};

