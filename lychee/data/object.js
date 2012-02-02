
ly.object = function(id, data, model) {

	this.id = id || 'ly-object-' + ly.object.__id++;


	for (var d in this.defaults) {
		this[d] = this.defaults[d];
	}


	if (Object.prototype.toString.call(data) === '[object Object]') {

		for (var d in data) {

			// Ingore non-defaulted properties
			if (data[d] === undefined) continue;

			if (Object.prototype.toString.call(data[d]) === '[object Object]') {
				this[d] = {};
				for (var sd in data[d]) {
					this[d][sd] = data[d][sd];
				}
			} else {
				this[d] = data[d];
			}

		}

	}


	if (model instanceof ly.model) {

		this.model = model;

		if (this.state === undefined) {
			this.state = 'default';
		}

		var state = this.model.getState(this.state);
		if (state !== null) {
			this.state = state;
		}

	} else {
		throw 'Require a ly.model instance as third parameter';
	}

};

ly.object.__id = 0;



ly.object.prototype = {

	defaults: {
		position: {
			x: 0, y: 0, z: 0
		},
		speed: {
			x: 0, y: 0, z: 0
		},
		angle: {
			x: 0, y: 0, z: 0
		}
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

		return this.model.get(property);

	},

	getPolygon: function() {

/*
	x2 = x0+(x-x0)*cos(theta)+(y-y0)*sin(theta)
	y2 = y0-(x-x0)*sin(theta)+(y-y0)*cos(theta)
*/


		var polygon = this.state.polygon,
			tx = this.angle.x / 360 * 2 * Math.PI,
			ty = this.angle.y / 360 * 2 * Math.PI,
			transformed = {};

		for (var pId in polygon) {

			var point = polygon[pId];

			var tPoint = {

				// This is kinda false... but havent figured out why.
				x: point.x * Math.cos(tx) + point.y * Math.sin(tx),
				y: - point.x * Math.sin(tx) + point.y * Math.cos(tx)

//				var Xx =  Math.cos(angle) * this.w, Xy = Math.sin(angle) * this.w,
//              Yx = -Math.sin(angle) * this.h, Yy = Math.cos(angle) * this.h;



			};


			transformed[pId] = tPoint;

		}

		return transformed;

	},

	getBoundingBox: function() {

		var polygon = this.getPolygon(),
			bb = this.model.getBoundingBoxFromPolygon(polygon);

		return bb;

	},

	rotate: function(angle) {

		if (Object.prototype.toString.call(angle) !== '[object Object]') {
			return false;
		}

		angle.x = typeof angle.x === 'number' ? angle.x : 0;
		angle.y = typeof angle.y === 'number' ? angle.y : 0;
		angle.z = typeof angle.z === 'number' ? angle.z : 0;

		this.angle.x += angle.x;
		this.angle.y += angle.y;
		this.angle.z += angle.z;

		this.angle.x %= 360;
		this.angle.y %= 360;
		this.angle.z %= 360;

		return true;

	},

	rotateTo: function(angle) {

		if (Object.prototype.toString.call(angle) !== '[object Object]') {
			return false;
		}

		angle.x = typeof angle.x === 'number' ? angle.x : this.__angle.x;
		angle.y = typeof angle.y === 'number' ? angle.y : this.__angle.y;
		angle.z = typeof angle.z === 'number' ? angle.z : this.__angle.z;

		this.angle.x = angle.x % 360;
		this.angle.y = angle.y % 360;
		this.angle.z = angle.z % 360;

		return true;

	}


};

