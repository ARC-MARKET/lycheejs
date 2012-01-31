
game.status = function(settings) {

	this.settings = {};

	for (var d in this.defaults) {
		this.settings[d] = this.defaults[d];
	}

	if (Object.prototype.toString.call(settings) === '[object Object]') {
		for (var s in settings) {
			this.settings[s] = settings[s];
		}
	}
};

game.status.prototype = {

	defaults: {
		score: 0,
		kills: 0,
		coins: 0,
		stars: 0
	},

	get: function(id) {
		return this.settings[id] || 0;
	},

	set: function(id, value) {

		if (
			this.settings[id] !== undefined
			&& typeof value === 'number'
		) {
			this.settings[id] = value;
			return true;
		}

		return false;

	},

	add: function(id, value) {

		if (
			this.settings[id] !== undefined
			&& typeof value === 'number'
		) {
			this.settings[id] += value;
			return true;
		}

		return false;

	},

	substract: function(id, value) {

		if (
			this.settings[id] !== undefined
			&& typeof value === 'number'
		) {
			this.settings[id] -= value;
			return true;
		}

		return false;

	}

};

