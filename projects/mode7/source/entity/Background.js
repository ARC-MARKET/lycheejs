
lychee.define('game.entity.Background').includes([
	'lychee.app.Entity'
]).exports(function(lychee, global, attachments) {

	var _Entity  = lychee.import('lychee.app.Entity');
	var _TEXTURE = attachments["png"];
	var _CONFIG  = {
		states: { 'default': 0 },
		map:    {
			'foreground': { x: 0, y: 0,   w: 1024, h: 512 },
			'background': { x: 0, y: 512, w: 1024, h: 512 }
		}
	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		this.origin    = { bgx: 0, bgy: 0, fgx: 0, fgy: 0 };

		this.__buffer  = null;
		this.__isDirty = true;


		this.setOrigin(settings.origin);


		delete settings.origin;


		settings.width  = settings.width  || 1024;
		settings.height = settings.height || 512;
		settings.states = _CONFIG.states;


		_Entity.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Background';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		render: function(renderer, offsetX, offsetY) {

			var fgmap = _CONFIG.map.foreground;
			var bgmap = _CONFIG.map.background;


			var buffer = this.__buffer;
			if (buffer === null) {
				buffer = this.__buffer = renderer.createBuffer(this.width, this.height);
			}


			if (this.__isDirty === true) {

				renderer.setBuffer(buffer);


				var px1 = this.origin.bgx - (bgmap.w / 2) - bgmap.w;
				var py1 = this.origin.bgy - bgmap.h;


				renderer.drawBox(
					0,
					0,
					this.width,
					py1,
					'#92c9ef',
					true
				);


				while (px1 < this.width) {

					renderer.drawSprite(
						px1,
						py1,
						_TEXTURE,
						bgmap
					);

					px1 += bgmap.w;

				}


				var px2 = this.origin.fgx - (fgmap.w / 2) - fgmap.w;
				var py2 = this.origin.fgy - fgmap.h;

				while (px2 < this.width) {

					renderer.drawSprite(
						px2,
						py2,
						_TEXTURE,
						fgmap
					);

					px2 += fgmap.w;

				}


				renderer.setBuffer(null);

				this.__buffer  = buffer;
				this.__isDirty = false;

			}


			var position = this.position;

			var x1 = position.x + offsetX - this.width  / 2;
			var y1 = position.y + offsetY - this.height / 2;


			renderer.drawBuffer(
				x1,
				y1,
				buffer
			);

		},

		setOrigin: function(origin) {

			this.origin.bgx = origin.bgx;
			this.origin.bgy = origin.bgy;
			this.origin.fgx = origin.fgx;
			this.origin.fgy = origin.fgy;

			this.origin.bgx %= 1024;
			this.origin.fgx %= 1024;

			this.__isDirty = true;

		}

	};


	return Class;

});

