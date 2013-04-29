
lychee.define('game.state.Game').requires([
	'game.entity.Faun',
	'game.entity.Otter'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, global) {

	var Class = function(game) {

		lychee.game.State.call(this, game, 'menu');

		this.__input = this.game.input;
		this.__loop = this.game.loop;
		this.__renderer = this.game.renderer;

		this.__clock = 0;
		this.__entities = {};
		this.__locked = false;



		this.reset();

	};


	Class.prototype = {

		reset: function() {

			var width = this.game.settings.width;
			var height = this.game.settings.height;

			this.__entities.player1 = new game.entity.Faun(this.game.images.player1);
			this.__entities.player2 = new game.entity.Otter(this.game.images.player2);

		},

		__reset: function() {

			var width = this.game.settings.width;
			var height = this.game.settings.height;

			this.__entities.player1.setPosition({

				x: width / 4,
				y: height / 4

			});
			this.__entities.player2.setPosition({

				x: width / 2,
				y: height / 2

			});
		},

		enter: function() {

			lychee.game.State.prototype.enter.call(this);

			this.__locked = true;
			this.__reset();
			this.__input.bind('key', this.__movementP1, this);
		//	this.__input.bind('down', this.__movementP1(), this);
		//	this.__input.bind('right', this.__movementP1(key), this);
		//	this.__input.bind('left', this.__movementP1(key), this);
			this.__renderer.start();

		},

		leave: function() {

			this.__renderer.stop();
			this.__input.unbind('up', this.__processUp);


			lychee.game.State.prototype.leave.call(this);

		},

		update: function(clock, delta) {

			for (var e in this.__entities) {
				if (this.__entities[e] === null) continue;
				this.__entities[e].update(clock, delta);
			}

			this.__clock = clock;

		},

		render: function(clock, delta) {

			this.__renderer.clear();

			
			for (var e in this.__entities) {
				if (this.__entities[e] === null) continue;
				this.__renderer.renderEntity(this.__entities[e]);
			}
			this.__renderer.flush();

		},

		__processTouch: function(id, position, delta) {

			if (this.__locked === true) return;

			var offset = this.game.getOffset();

			position.x -= offset.x;
			position.y -= offset.y;


			var entity = this.__getEntityByPosition(position.x, position.y);
			if (entity === this.__entities.exithint) {
				this.game.setState('menu');
			}


			if (this.game.settings.sound === true) {
				this.game.jukebox.play('click');
			}

		},


		__movementP1 : function(key, delta){
			//var keys = ['up', 'down', 'right', 'left'];
			console.log(key +' '+ delta);
			var entity = this.__entities.player1;
			var position = entity.getPosition();
			switch(key) {
				case 'up': entity.setPosition({x: position.x, y: (position.y - 9)});
				break;
				case 'down': entity.setPosition({x: position.x, y: (position.y + 9)});
				break;
				case 'right': entity.setPosition({x: (position.x + 9), y: position.y});
				break;
				case 'left': entity.setPosition({x: (position.x - 9), y: position.y});
				break;
			}
				
		},

		__getEntityByPosition: function(x, y) {

			var found = null;

			for (var e in this.__entities) {

				if (this.__entities[e] === null) continue;

				var entity = this.__entities[e];
				var position = entity.getPosition();

				if (
					x >= position.x - entity.width / 2
					&& x <= position.x + entity.width / 2
					&& y >= position.y - entity.height / 2
					&& y <= position.y + entity.height / 2
				) {
					found = entity;
					break;
				}


			}


			return found;

		}

	};


	return Class;

});
