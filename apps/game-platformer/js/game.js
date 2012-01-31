
game = function(settings) {

	this.settings = {};

	for (var d in this.defaults) {
		this.settings[d] = this.defaults[d];
	}

	if (Object.prototype.toString.call(settings) === '[object Object]') {
		for (var s in settings) {
			this.settings[s] = settings[s];
		}
	}


	if (this.settings.debug === true) {
		this.console = new ly.console(this.settings.console);
	} else {
		this.console = null;
	}


	this.status = new game.status(this.settings.status);


	if (this.settings.base !== null) {

		this.loadPackage(this.settings.base, function() {

			this.resetWorld();

			this.view = new ly.view(this.settings.view);
			this.physics = new game.physics(this._world, this);

			this.loadWorld(this.settings.world);

			// TODO: evaluate if this is the right place
			this.camera = new game.camera(this.settings.camera, this.view);
			this.camera.follow(this._world.objects.get('player'));
			this.start();

		}, this);

	}

};

game.prototype = {

	defaults: {

		// SubSet Settings
		console: {
			id: 'game-console'
		},
		player: {
			id: 'game-touch'
		},
		camera: {
			duration: 600,
			func: 'ease-in-out'
		},
		view: {
			id: 'game-view',
			tile: 42,
			position: {
				x: 10, y: 5
			},
			size: {
				x: 20, y: 10
			}
		},

		// Game Settings
		debug: false,
		delay: 250,
		base: null,
		world: null
	},



	/*
	 * PRIVATE API
	 */
	__gameLoop: function() {

		if (this.__state === 'stopped') return;

		var now = Date.now();
		if (now !== this.__clock) {

			var delta = now - this.__clock,
				enemies = this._world.enemies.all(),
				players = this._world.players.all(),
				objects = this._world.objects.all();


			// This will also refresh UI layers
			this.renderer.refresh(delta);

			for (var e in enemies) {
				enemies[e].refresh(delta);
			}

			for (var p in players) {
				players[p].refresh(delta);
			}

			this.camera.refresh(delta);

			for (var o in objects) {
				this.physics.refresh(objects[o], delta);
				this.renderer.refreshObject(objects[o], delta);
			}


			this.__clock = now;

		}

		var that = this;
		if (this.settings.debug === true) {
			window.setTimeout(function() {
				that.__clock = Date.now() - 10;
				that.__gameLoop();
			}, this.settings.delay);
		} else {
			window.requestAniFrame(function() {
				that.__gameLoop();
			}, this.renderer.context);
		}

	},



	/*
	 * PUBLIC API
	 */
	start: function() {

		if (this.__state === 'running') return;

		if (this.__state === 'ready') {
			this.renderer = new game.renderer(this.view, this.status, this.settings.debug);
			this.renderer.start();
		}

		this.__state = 'running';
		this.__clock = Date.now();
		this.__gameLoop();

	},

	stop: function() {
		this.__state = 'stopped';
	},

	isRunning: function() {
		return this.__state === 'running';
	},

	loadPackage: function(base, callback, scope) {

		callback = callback || function() {};
		scope = scope || this;

		var package = new ly.package();
		package.load(base, function(cache) {
			this._cache = cache;
			callback.call(scope);
		}, this);

	},

	resetWorld: function() {

		// Avoid unlinking of world namespace
		if (this._world === undefined) {
			this._world = {};
		}


		// Hint: objects also contains enemies and player objects
		this._world.objects = new ly.cache();
		this._world.enemies = new ly.cache();
		this._world.players = new ly.cache();

	},

	loadWorld: function(id) {

		var world = this._cache.worlds.get(id);
		if (world === null) {
			return false;
		}


		this.console !== null && this.console.log('Loading World', world.id);


		// Update Physics Gravity
		this.physics.setGravity(
			typeof world.gravity === 'number' ? world.gravity : 1
		);


		// Update the Z-Collision Type
		// FIXME: Improve defaults to 3D Z-Collision
		this.physics.setZCollision(world.zCollision || 'layer');


		if (Object.prototype.toString.call(world.objects) === '[object Array]') {

			var boundaries;
			if (Object.prototype.toString.call(world.boundaries) === '[object Object]') {
				boundaries = world.boundaries;
			} else {
				boundaries = this.view.getBoundingBox();
			}


			for (var o = 0, ol = world.objects.length; o < ol; o++) {

				var data = world.objects[o],
					model = this._cache.models.get(data.model);


				if (data.position === undefined || model === null) continue;

				if (data.speed === undefined) {
					data.speed = { x: 0, y:0, z: 0};
				}

				var object = new ly.object(data.id, {
					position: {
						x: data.position.x,
						y: data.position.y,
						z: data.position.z || 0
					},
					speed: {
						x: data.speed.x || 0,
						y: data.speed.y || 0,
						z: data.speed.z || 0
					},
					sticky: data.sticky || false,
					type: data.type
				}, model);


				if (object.id === 'player') {

					this._world.players.add(new game.player(
						this.settings.player,
						object,
						this._world
					));

				} else if (data.enemy !== undefined) {

					this._world.enemies.add(new game.enemy(
						data.enemy,
						object,
						this._world
					));

				}


				this._world.objects.add(object);

/*
				// Calculate Boundaries for World now
				var bb = model.getBoundingBox();

				boundaries.minX = Math.min(boundaries.minX, data.position.x + bb.minX);
				boundaries.maxX = Math.max(boundaries.maxX, data.position.x + bb.maxX);

				boundaries.minY = Math.min(boundaries.minY, data.position.y + bb.minY);
				boundaries.maxY = Math.max(boundaries.maxY, data.position.y + bb.maxY);

				boundaries.minZ = Math.min(boundaries.minZ, (data.position.z || 0) + bb.minZ);
				boundaries.maxZ = Math.max(boundaries.maxZ, (data.position.z || 0) + bb.maxZ);
*/
			}


			this.console !== null && this.console.log('> Setting Boundaries', boundaries);

			this.physics.setBoundaries(boundaries);
			this.__state = 'ready';

		}


		if (Object.prototype.toString.call(world.quests) === '[object Array]') {
			this.quests = new game.quests(world.quests);
		}

	}

};

