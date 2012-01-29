

ly.package = function(settings) {

	this.settings = {};

	for (var d in this.defaults) {
		this.settings[d] = this.defaults[d];
	}

	if (Object.prototype.toString.call(settings) === '[object Object]') {
		for (var s in settings) {
			this.settings[s] = settings[s];
		}
	}


	this.reset();

};


ly.package.prototype = {

	defaults: {
		meta: true,
		worlds: true,
		models: true,
		source: true,
		waitForSprites: false
	},

	reset: function() {

		this._cache = {
			models: new ly.cache(),
			worlds: new ly.cache(),
			sprites: new ly.cache()
		};

		this.meta = {};

		this.__loading = {
			models: null,
			worlds: null,
			sprites: null
		};

	},

	get: function(what) {

		if (what === undefined) {
			return this._cache;
		} else if (this._cache[what] !== undefined) {
			return this._cache[what];
		} else if (what === 'meta') {
			return this.meta;
		}

	},

	load: function(base, callback, scope) {

		callback = callback || function() {};
		scope = scope || this;

		this.__base = base;

		var data;
		ly.load(this.__base + '/package.json', function(status, json) {

			if (status === 200) {

				try {
					data = JSON.parse(json);
				} catch(e) {
					console.warn('Package is not a valid JSON file!');
				}

				this.parse(data);

			} else {
				this.__timeout = Date.now();
			}

		}, this);

		// one minute timeout
		this.__timeout = Date.now() + 10 * 1000;

		this.__callback = callback;
		this.__scope = scope;

		this.__loop();

	},

	parse: function(data) {

		if (Object.prototype.toString.call(data) !== '[object Object]') {
			return false;
		}



		if (
			this.settings.meta === true
			&& Object.prototype.toString.call(data.meta) === '[object Object]'
		) {

			for (var k in data.meta) {
				this.meta[k] = data.meta[k];
			}

		}



		if (
			this.settings.models === true
			&& Object.prototype.toString.call(data.models) === '[object Object]'
		) {

			this.__loading.models = 0;

			var mId;
			for (mId in data.models) {

				this.__loading.models++;

				(function(modelSetUrl, modelSetId, modelData, that) {

					ly.load(modelSetUrl, function(status, json) {

						if (status === 200) {

							try {
								modelData = JSON.parse(json);
							} catch(e) {
							}

							if (modelData !== null) {
								this.parseModels(modelSetId, modelData);
							}

						}

						that.__loading.models--;

					}, that);

				})(this.__base + '/' + data.models[mId], mId, null, this);

			}

		} else if (
			this.settings.models === true
			&& Object.prototype.toString.call(data.models) === '[object Array]'
		) {
			this.parseModels(undefined, modelData);
		}



		if (
			this.settings.worlds === true
			&& Object.prototype.toString.call(data.worlds) === '[object Object]'
		) {

			this.__loading.worlds = 0;

			var wId;
			for (wId in data.worlds) {

				this.__loading.worlds++;

				(function(worldUrl, worldId, worldData, that) {

					ly.load(worldUrl, function(status, json) {

						if (status === 200) {

							try {
								worldData = JSON.parse(json);
							} catch(e) {
							}

							if (worldData !== null) {
								this.parseWorld(worldId, worldData);
							}

						}

						this.__loading.worlds--;

					}, that);

				})(this.__base + '/' + data.worlds[wId], wId, null, this);

			}

		}



		if (
			this.settings.source === true
			&& Object.prototype.toString.call(data.source) === '[object Array]'
		) {

			var s;
			for (s = 0, sl = data.source.length; s < sl; s++) {
				this.__loadSprite(s, 'source', data.source[s]);
			}

		}

	},

	parseModels: function(modelSetId, data) {

		if (Object.prototype.toString.call(data) !== '[object Array]') {
			return false;
		}


		for (var d = 0, l = data.length; d < l; d++) {

			var model = data[d];

			// Y U so stupid?
			if (model.id === undefined) continue;

			if (ly.model instanceof Function) {
				model = new ly.model(model);
			}

			this._cache.models.add(model);

			if (model.sprite !== null && model.sprite !== undefined) {
				// Inception! :)
				model.sprite = {
					url: model.sprite
				};
				this.__loadSprite(model.id, 'model', model.sprite);
			}

		}


		return true;

	},

	parseWorld: function(id, data) {

		if (Object.prototype.toString.call(data) !== '[object Object]') {
			return false;
		}

		if (id !== null && id !== undefined && data.id !== id) {
			data.id = id.toString();
		}

		this._cache.worlds.add(data);


		return true;

	},

	__loop: function() {

		var settings = this.settings,
			loading = this.__loading;


		if (
			(
				((settings.worlds === true && loading.worlds === 0) || settings.worlds === false)
				&& ((settings.models === true && loading.models === 0) || settings.models === false)
				&& ((settings.waitForSprites === true && loading.sprites === 0) || settings.waitForSprites === false)
			) || this.__timeout < Date.now()
		) {

			this.__callback.call(this.__scope, this._cache);

		} else if (this.__timeout > Date.now()) {

			var that = this;
			setTimeout(function() {
				that.__loop();
			}, 100);

		}

	},

	__loadSprite: function(id, type, sprite) {

		if (this.__loading.sprites === null) {
			this.__loading.sprites = 0;
		}

		this.__loading.sprites++;

		if (type === 'model') {

			sprite.image = new Image();
			sprite.image.src = this.__base + '/sprites/' + sprite.url;

			(function(id, that) {
				sprite.image.onload = function() {

					var modelSprite = that._cache.models.get(id).sprite;
					modelSprite.image = this;
					modelSprite.width = this.width;
					modelSprite.height = this.height;

					that.__loading.sprites--;

				};
			})(id, this);

		} else if (type === 'source') {

			var img = new Image();
			img.src = this.__base + '/source/' + sprite;

			(function(id, that) {
				img.onload = function() {
					that._cache.sprites.add(this);
					that.__loading.sprites--;
				};
			})(id, this);

		}

	}

};

