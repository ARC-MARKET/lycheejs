
ly.physics = function(cache, settings) {

	if (!cache instanceof ly.cache) {
		throw 'Need a Cache to work properly';
	}

	this._cache = cache;

	this.settings = {};
	for (var d in this.defaults) {
		this.settings[d] = this.defaults[d];
	}

	if (Object.prototype.toString.call(settings) === '[object Object]') {
		for (var s in settings) {
			this.settings[s] = settings[s];
		}
	}

	if (this.settings.onCollision instanceof Function) {
		this.onCollision = this.settings.onCollision;
	} else {
		this.onCollision = this.__onCollision;
	}

};


ly.physics.prototype = {

	defaults: {
		gravity: 1.2,
		boundaries: null,
//		boundaries: {
//			minX: 0, maxX: Infinity,
//			minY: 0, maxY: Infinity,
//			minZ: 0, maxZ: Infinity
//		}
		zCollision: 'layer' // true, false or 'layer'
	},



	/*
	 * PRIVATE API
	 */
	__checkCollisions: function(object, delta) {

		var otherObjects = this._cache.all();

		for (var o in otherObjects) {

			var oObject = otherObjects[o];

			// Ignore applied collisions for current Physics delta
			if (
				object === oObject
				|| this.__collisionCache[object.id] === oObject.id
			) {
				continue;
			}


			var collisionDelta = this.__getCollisionDelta(object, oObject, delta);

			if (collisionDelta.x !== null || collisionDelta.y !== null || collisionDelta.z !== null) {

				var collided = this.onCollision(collisionDelta, object, oObject);
				if (collided === true) {
					this.__collisionCache[object.id] = oObject.id;
					this.__collisionCache[oObject.id] = object.id;
				}

			}

		}

	},

	__onCollision: function(collisionDelta, object, oObject) {

		if (oObject.get('type') !== 'static') {
			var mass = object.get('mass'),
				oMass = oObject.get('mass'),
				massBalance = mass / (mass + oMass),
				oMassBalance = oMass / (mass + oMass);
		}


		/*
		 * TODO: Z-Collision
		 */


		/*
		 * Y-Collision
		 */
		if (collisionDelta.y) {

			if (oObject.get('type') === 'static') {
				object.position.y += collisionDelta.y;
				object.speed.y = 0;
			} else {

				var overallSpeed = Math.abs(object.speed.y) + Math.abs(oObject.speed.y),
					speedBalance = Math.abs(object.speed.y) / overallSpeed,
					oSpeedBalance = Math.abs(oObject.speed.y) / overallSpeed;

				object.position.y -= collisionDelta.y * speedBalance;
				oObject.position.y += collisionDelta.y * oSpeedBalance;

 				object.speed.y = -1 * object.speed.y + -1 * collisionDelta.y * massBalance;
				oObject.speed.y = -1 * oObject.speed.y + collisionDelta.y * oMassBalance;
			}

		}


		/*
		 * X-Collision
		 */
		if (collisionDelta.x) {

			if (oObject.get('type') === 'static') {
				object.position.x += collisionDelta.x;
				object.speed.x = 0;
			} else {

				var overallSpeed = Math.abs(object.speed.x) + Math.abs(oObject.speed.x),
					speedBalance = Math.abs(object.speed.x) / overallSpeed,
					oSpeedBalance = Math.abs(oObject.speed.x) / overallSpeed;

				object.position.x -= collisionDelta.x * speedBalance;
				oObject.position.x += collisionDelta.x * oSpeedBalance;

				object.speed.x = -1 * object.speed.x + -1 * collisionDelta.x * massBalance;
				oObject.speed.x = -1 * oObject.speed.x + collisionDelta.x * oMassBalance;
			}

		}

		if (collisionDelta.x !== null || collisionDelta.y !== null) {
			return true;
		}

	},

	__updateGravity: function(object, delta) {

		var gravity = this.settings.gravity;
		object.speed.y = object.speed.y - (object.get('mass') * delta * gravity);

	},

	__getCollisionDelta: function(object, otherObject, delta) {

		var bb = object.model.getBoundingBox(),
			oBB = otherObject.model.getBoundingBox();

		// The object's boundingBox Coordinate Points
		var A = {
			x: object.position.x + bb.minX,
			y: object.position.y + bb.minY,
			z: object.position.z + bb.minZ
		}, B = {
			x: object.position.x + bb.maxX,
			y: object.position.y + bb.maxY,
			z: object.position.z + bb.maxZ
		};

		// The otherObject's boundingBox Coordinate Points
		var C = {
			x: otherObject.position.x + oBB.minX,
			y: otherObject.position.y + oBB.minY,
			z: otherObject.position.z + oBB.minZ
		}, D = {
			x: otherObject.position.x + oBB.maxX,
			y: otherObject.position.y + oBB.maxY,
			z: otherObject.position.z + oBB.maxZ
		};

		/*
		 * Velocity-Delta dependend stuff
		 * Outer Speed Velocity BoundingBox Coordinates: E and F
		 */

		var vDelta = {
			x: (object.speed.x - otherObject.speed.x) * delta,
			y: (object.speed.y - otherObject.speed.y) * delta,
			z: (object.speed.z - otherObject.speed.z) * delta
		};

		var E = {}, F = {};

		if (object.speed.x >= 0) {
			E.x = A.x;
			F.x = B.x + vDelta.x;
		} else {
			E.x = A.x + vDelta.x;
			F.x = B.x;
		}

		if (object.speed.y >= 0) {
			E.y = A.y;
			F.y = B.y + vDelta.y;
		} else {
			E.y = A.y + vDelta.y;
			F.y = B.y;
		}


		var collisionDelta = {
			x: null,
			y: null,
			z: null
		};



		/*
		 * X-Collision
		 */
		if (Math.abs(object.position.x - otherObject.position.x) === 0) {
			collisionDelta.x = null;
		} else if ((C.y >= E.y && C.y <= F.y) || (D.y >= E.y && D.y <= F.y) || (E.y >= C.y && F.y <= D.y)) {

			if (object.speed.x > 0 && C.x > B.x && C.x < F.x) {
				collisionDelta.x = B.x - C.x;
			} else if (object.speed.x < 0 && D.x > E.x && D.x < A.x) {
				collisionDelta.x = A.x - D.x;
			}

		}



		/*
		 * Y-Collision
		 */
		if (Math.abs(object.position.y - otherObject.position.y) === 0) {
			collisionDelta.y = null;
		} else if ((C.x >= E.x && C.x <= F.x) || (D.x >= E.x && D.x <= F.x) || (E.x >= C.x && F.x <= D.x)) {


			if (object.speed.y >= 0 && C.y > B.y && C.y < F.y) {
				collisionDelta.y = B.y - C.y;
			} else if (object.speed.y < 0 && D.y > E.y && D.y < A.y) {
				collisionDelta.y = A.y - D.y;
			}

		}



		/*
		 * Z-Collision
		 *
		 * Types of Z-Collisions:
		 *   layer -> only apply Collisions in X and Y if they are on the same layer
		 *   true -> "real" 3D Collisions
		 *   false -> deactivated
		 */
		var zType = this.settings.zCollision;
		if (zType === 'layer') {

			if (object.position.z !== otherObject.position.z) {
				collisionDelta.x = null;
				collisionDelta.y = null;
			}

		} else if (zType === true) {

			// FIXME: Implement 3D Z-Collisions, maybe 2 additional
			// points are necessary for AABB(CC) Collisions

		} else {
			collisionDelta.z = null;
		}


		return collisionDelta;

	},


	/*
	 * PUBLIC API
	 */
	refresh: function(object, timeDelta) {

		if (typeof timeDelta !== 'number' || timeDelta <= 0) {
			return;
		}

		// Physics are all in tile-delta
		var delta = timeDelta / 1000;

		this.__collisionCache = {};

		if (object.get('type') === 'dynamic') {

			if (object.stickedX === undefined && object.stickedY === undefined){
				this.__updateGravity(object, delta);
			}

			this.__checkCollisions(object, delta);
			this.updatePosition(object, delta);

		}

	},

	setBoundaries: function(boundaries) {

		if (Object.prototype.toString.call(boundaries) === '[object Object]' || boundaries === null) {

			var newBoundaries = {
				minX: boundaries.minX || 0,
				minY: boundaries.minY || 0,
				minZ: boundaries.minZ || 0,
				maxX: boundaries.maxX || 0,
				maxY: boundaries.maxY || 0,
				maxZ: boundaries.maxZ || 0
			};

			this.settings.boundaries = newBoundaries;


			return true;

		}

		return false;

	},

	setGravity: function(value) {

		if (typeof value === 'number') {
			this.settings.gravity = value;
			return true;
		}

		return false;

	},

	setZCollision: function(type) {

		if (type !== true && type !== false && type !== 'layer') {
			return false;
		}

		this.settings.zCollision = type;
		return true;

	},

	updatePosition: function(object, delta) {

		// Skip if position was already updated by collision deltas
		if (this.__collisionCache[object.id] !== undefined) {
			return;
		}

		var boundaries = this.settings.boundaries,
			newPosition = {
				x: object.position.x + object.speed.x * delta,
				y: object.position.y + object.speed.y * delta,
				z: object.position.z + object.speed.z * delta
			};


		if (boundaries !== null) {

			var bb = object.model.getBoundingBox();
			newPosition.x = Math.min(boundaries.maxX - bb.maxX, Math.max(Math.abs(bb.minX), newPosition.x));
			newPosition.y = Math.min(boundaries.maxY - bb.maxY, Math.max(Math.abs(bb.minY), newPosition.y));
			newPosition.z = Math.min(boundaries.maxZ - bb.maxZ, Math.max(Math.abs(bb.minZ), newPosition.z));


			if (newPosition.x === Math.abs(bb.minX) || newPosition.x === (boundaries.maxX - bb.maxX)) {
				object.speed.x = 0;
			}

			if (newPosition.y === Math.abs(bb.minY) || newPosition.y === (boundaries.maxY - bb.maxY)) {
				object.speed.y = 0;
			}

			// FIXME: Think about a configuration for z-layered boundaries.

		}

		object.position = newPosition;

	}

}
