
ly.storage = function(id, type) {

	if (
		typeof type === 'string'
		&& ly.storage.__features[type] === true
	) {
		this.type = type;
	} else {
		this.type = 'none';
	}

	if (typeof id !== 'string') {
		id = 'ly-storage';
		console.warn('ly.storage needs an ID to prevent mixup of localStorage / sessionStorage usage.');
	}


	// FIXME: This needs to be done via localStorage
	// (if available)
	if (ly.storage.__storages[id] === undefined) {
		ly.storage.__storages[id] = new ly.storage[this.type](id);
	}

	return ly.storage.__storages[id];

};

ly.storage.__features = (function() {

	var features = {};

	if (Object.prototype.toString.call(window.localStorage) === '[object Storage]') {
		features.local = true;
	}

	if (Object.prototype.toString.call(window.sessionStorage) === '[object Storage]') {
		features.session = true;
	}

	features.none = true;

	return features;

})();

ly.storage.__storages = {};

ly.storage.none = function(id) {
	this.__cache = {};
};

ly.storage.none.prototype = {

	all: function() {

		var filtered = {},
			retNull = true;

		for (var key in this.__cache) {
			if (retNull === true) retNull = false;
			filtered[key] = this.__cache[key];
		}

		return retNull === true ? null : filtered;

	},

	get: function(key) {
		return this.__cache[key] || null;
	},

	set: function(key, value) {
		this.__cache[key] = value;
		return true;
	},

	remove: function(key) {
		if (this.__cache[key] !== undefined) {
			delete this.__cache[key];
		}
		return true;
	}

};



/*
 * localStorage / sessionStorage wrappers
 * due to mixup of sharing the same Storage Interface
 */
ly.storage.local = function(id) {
	this.__prefix = id + '-';
	this.__storage = window.localStorage;
};

ly.storage.session = function(id) {
	this.__prefix = id + '-';
	this.__storage = window.sessionStorage;
};

ly.storage.local.prototype = ly.storage.session.prototype = {

	all: function() {

		var filtered = {},
			retNull = true,
			regexp = new RegExp(this.__prefix);

		for (var key in this.__storage) {

			if (key.match(regexp)) {

				key = key.split(this.__prefix)[1];

				if (retNull === true) retNull = false;

				var value = this.get(key);
				filtered[key] = value;

			}

		}

		return retNull === true ? null : filtered;

	},

	get: function(key) {

		var value = this.__storage.getItem(this.__prefix + key);
		if (value !== null && typeof value === 'string') {

			try {
				var tmp = JSON.parse(value);
				if (tmp !== null) {
					value = tmp;
				}
			} catch(e) {
			}

		}

		// Hint: null if invalid, so it's correct
		return value;

	},

	set: function(key, value) {

		if (typeof value !== 'string') {
			value = JSON.stringify(value);
		}

		this.__storage.setItem(this.__prefix + key, value);
		return true;

	},

	remove: function(key) {
		this.__storage.removeItem(this.__prefix + key);
		return true;
	}

};

