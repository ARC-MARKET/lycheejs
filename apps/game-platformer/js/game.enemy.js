
game.enemy = function(settings, object, world) {

	this.settings = {};

	for (var d in this.defaults) {
		this[d] = this.defaults[d];
	}

	if (Object.prototype.toString.call(settings) === '[object Object]') {
		for (var s in settings) {
			this[s] = settings[s];
		}
	}


	this.__object = object;
	this.__object.enemy = this;

	this._world = world;

	this.__init();

};



game.enemy.prototype = {

	defaults: {
		health: 10,
		walking: false,
		jumping: false,
		attacking: false
	},

	/*
	 * PRIVATE API
	 */
	__init: function() {

	},



	/*
	 * PUBLIC API
	 */
	hit: function(amount) {
		amount = typeof amount === 'number' ? amount : 1;
		this.health = Math.max(0, this.health - amount);
	},

	destroy: function() {

		this._world.enemies.remove(this.__object.id);
		this._world.objects.remove(this.__object.id);

		this.__destroyed = true;

	},

	refresh: function(delta) {

		if (this.health === 0 && this.__destroyed !== true) {
			this.destroy();
		}

	}

};

