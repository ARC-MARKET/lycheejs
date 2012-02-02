
game.player = function(settings, object, world, game) {

	this.settings = {
		controls: {
			touch: 'ontouchstart' in window,
			mouse: window.MouseEvent !== undefined ? true : 'onmousedown' in window,
			keyboard: window.KeyEvent !== undefined ? true : 'onkeydown' in window
			// keyboard: 'onkeydown' in window
			// It's undefined and not null on Linux / Firefox... wtf?
		}
	};



	for (var d in this.defaults) {
		if (s === 'properties') {
			this[d] = this.defaults[d];
		} else {
			this.settings[d] = this.defaults[d];
		}
	}

	if (Object.prototype.toString.call(settings) === '[object Object]') {

		for (var s in settings) {
			if (s === 'properties') {
				for (var ss in settings[s]) {
					this[ss] = settings[s][ss];
				}
			} else {
				this.settings[s] = settings[s];
			}
		}

	}


	this.__object = object;
	this.__object.sticky = true;
	this.__object.player = this;

	// This is for quicker cache access
	this.id = this.__object.id;

	this._world = world;
	this._game = game;

	this.__init();

};



game.player.prototype = {

	defaults: {

		// properties.health -> this.health
		properties: {
			health: 5
		},

		id: 'game-touch',
		keymap: {
			left:   65, // A
			right:  68, // D
			jump:   77, // M
			shoot:  78  // N
		}
	},



	/*
	 * PRIVATE API
	 */
	__init: function() {

		var that = this,
			id = this.settings.id,
			controls = this.settings.controls;


		this.context = document.getElementById(id);

		if (this.context === null) {
			return;
		}


		if (
			(controls.touch === true || controls.mouse === true)
			&& controls.keyboard === false
		) {

			var touchmap = {
				left: id + '-left',
				right: id + '-left',
				jump: id + '-jump',
				shoot: id + '-shoot'
			};

			for (var action in touchmap) {

				var element = document.getElementById(touchmap[action]);

				if (element !== null) {

					(function(element, action, startEvent, moveEvent) {
						element[startEvent] = function(event) {

							that.control(action);
							event.preventDefault();
							event.stopPropagation();

						};
						element[moveEvent] = function(event) {
							event.preventDefault();
							event.stopPropagation();
						};
					})(
						element,
						action,
						controls.touch === true ? 'ontouchstart' : 'onmousedown',
						controls.touch === true ? 'ontouchmove' : 'onmousemove'
					);

				}

			}

		} else {
			this.context.className = 'hidden';
		}


		if (controls.keyboard === true) {

			var keymap = this.settings.keymap;

			document.addEventListener('keydown', function(event) {

				switch(event.keyCode) {
					case keymap.left:  that.control('left');  break;
					case keymap.right: that.control('right'); break;
					case keymap.jump:  that.control('jump');  break;
					case keymap.shoot: that.control('shoot'); break;
				}

			});

		}

	},



	/*
	 * PUBLIC API
	 */
	hit: function() {
		amount = typeof amount === 'number' ? amount : 1;
		this.health = Math.max(0, this.health - amount);
	},

	destroy: function() {

		this._world.players.remove(this.__object.id);
		this._world.objects.remove(this.__object.id);

		this.__destroyed = true;

		this._game.onDestroy(this);

	},

	refresh: function(delta) {

		if (this.health === 0 && this.__destroyed !== true) {
			this.destroy();
			return;
		}


		var object = this.__object,
			bb = object.model.getBoundingBox();


		if (object.speed.y < 0) {

			var underlying = this._world.objects.getByPosition({
				x: object.position.x,
				y: object.position.y + bb.minY - 0.02
			});


			if (underlying !== null && underlying.type === 'static') {
				object.stickedY = underlying.position.y - object.position.y;
				object.speed.y = 0;
			} else if (underlying === null) {
				object.stickedY = undefined;
			}

        } else if (object.speed.y > 0) {
			object.stickedY = undefined;
		}



		// FIXME: Evaluate movements on stickedY (above static object)
		if (this.__object.stickedY !== undefined) {
			this.__object.speed.x = 0;
		}

	},

	control: function(action) {

		var speed = this.__object.speed;

		switch (action) {

			case 'jump':
				speed.y = 20;
			break;

			case 'left':
				speed.x = Math.min(speed.x, -10);
				if (this.__object.stickedY !== undefined) {
					speed.y = 0.01;
				}
			break;

			case 'right':
				speed.x = Math.max(speed.x, 10);
			break;

		}

	}

};

