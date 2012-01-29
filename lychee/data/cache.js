
ly.cache = function() {

	this.__cache = {};
	this.length = 0;

};


ly.cache.prototype = {

	/*
	 * This will add an object to the cache
	 * For identification purposes, each object requires an id property.
	 *
	 * @param {ly.object} object
	 * @returns {Boolean} True on success, false otherwise.
	 */
	add: function(object) {

		if (object === undefined) {
			return false;
		}

		var id = object.id || (this.length + 1);

		if (this.__cache[id] !== undefined) {
			return false;
		}

		this.__cache[id] = object;
		this.length++;

		return true;

	},

	/*
	 * This will return a cached object by id
	 *
	 * @param {String|Number} id The id of the previously stored object
	 * @returns {ly.object|Null} Returns either the stored object on success or null.
	 */
	get: function(id) {

		if (this.__cache[id] !== undefined) {

			return this.__cache[id];

		} else if (this.length > 0) {

			for (var cId in this.__cache) {

				var object = this.__cache[cId];
				if ((object.id !== undefined && object.id === id) || cId === id) {
					return object;
				}

			}

		}

		return null;

	},

	/*
	 * This will get an Object by its position data
	 *
	 * @param {Object} data The position data object. Format: {x, y, z}
	 * @returns {ly.object|Null} Returns either the stored object on success or null.
	 */
	getByPosition: function(data) {

		for (var cId in this.__cache) {

			var object = this.__cache[cId],
				position = object.get('position'),
				bb = object.get('boundingBox'),
				matchesX = false,
				matchesY = false,
				matchesZ = false;

			if (
				(data.x !== undefined
				&& position.x + bb.minX < data.x
				&& position.x + bb.maxX > data.x
				) || data.x === undefined
			) {
				matchesX = true;
			}

			if (
				(data.y !== undefined
				&& position.y + bb.minY < data.y
				&& position.y + bb.maxY > data.y
				) || data.y === undefined
			) {
				matchesY = true;
			}

			if (
				(data.z !== undefined
				&& position.z + bb.minZ < data.z
				&& position.z + bb.maxZ > data.z
				) || data.z === undefined
			) {
				matchesZ = true;
			}

			if (matchesX === true && matchesY === true && matchesZ === true) {
				return object;
			}

		}

		return null;

	},

	/*
	 * This will remove a cached object by id
	 *
	 * @param {String|Number} id The id of the previously stored object
	 */
	remove: function(id) {

		if (this.__cache[id] !== undefined) {
			delete this.__cache[id];
			this.length--;
		}

	},

	/*
	 * This will return a hashmap containing all objects inside the cache
	 *
	 * @returns {Object|Null} Returns either the hashmap on success or null.
	 */
	all: function() {

		// return last cached ones
		if (
			this.__all !== undefined
			&& this.length === this.__allLength
		) {
			return this.__all;
		}

		var cached = {},
			cachedLength = 0;

		for (var id in this.__cache) {

			var object = this.__cache[id];

			if (
				object.id !== undefined
				&& cached[object.id] === undefined
			) {

				cached[object.id] = object;
				cachedLength++;

			} else if (object.id === undefined) {

				cached[id] = object;
				cachedLength++;

			}

		}

		if (cachedLength > 0) {
			this.__all = cached;
			this.__allLength = cachedLength;
		}


		return cachedLength > 0 ? cached : null;

	}

};

