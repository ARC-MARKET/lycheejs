
lychee.define('app.ui.entity.Messages').requires([
	'app.ui.sprite.Avatar'
]).includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global, attachments) {

	var _Avatar = lychee.import('app.ui.sprite.Avatar');
	var _Entity = lychee.import('lychee.ui.Entity');
	var _FONT   = attachments["fnt"];



	/*
	 * HELPERS
	 */

	var _render_buffer = function(renderer) {

		var font = _FONT;
		if (font !== null && font.texture !== null) {

			if (this.__buffer !== null) {
				this.__buffer.resize(this.width, this.height);
			} else {
				this.__buffer = renderer.createBuffer(this.width, this.height);
			}


			renderer.clear(this.__buffer);
			renderer.setBuffer(this.__buffer);
			renderer.setAlpha(1.0);


			var avatar   = this.avatar;
			var mx1      = this.offset.x;
			var my1      = this.offset.y + this.height - 32;
			var last     = null;
			var messages = this.cache.messages;

			for (var m = messages.length - 1; m >= 0; m--) {

				var entry = messages[m];
				var color = entry.user === 'system' ? '#d0494b' : entry.user;


				if (avatar !== null && avatar.value === color) {

					renderer.setAlpha(0.2);
					renderer.drawBox(
						0,
						my1,
						this.width,
						my1 + 32,
						color,
						true
					);
					renderer.setAlpha(1);

				}


				renderer.drawCircle(
					mx1 + 32,
					my1 + 16,
					8,
					color,
					true
				);

				renderer.drawText(
					mx1 + 64,
					my1 + 16 - font.lineheight / 2,
					entry.message,
					font,
					false
				);


				if (last !== color) {

					renderer.drawLine(
						0,
						my1 + 32,
						this.width,
						my1 + 32,
						'#545454',
						1
					);

					last = color;

				}


				my1 -= 32;

			}


			renderer.setBuffer(null);
			this.__isDirty = false;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		var settings = Object.assign({}, data);


		this.avatar = null;
		this.cache  = {
			channel:  '#home',
			users:    [],
			messages: []
		};
		this.offset = {
			x: 0,
			y: 0
		};

		this.__buffer  = null;
		this.__isDirty = true;


		_Entity.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function() {}, this);

		this.bind('relayout', function() {
			this.__isDirty = true;
		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'app.ui.entity.Messages';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var alpha    = this.alpha;
			var position = this.position;
			var x        = position.x + offsetX;
			var y        = position.y + offsetY;
			var hwidth   = this.width  / 2;
			var hheight  = this.height / 2;


			if (this.__isDirty === true) {
				_render_buffer.call(this, renderer);
			}


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}

			if (this.__buffer !== null) {

				renderer.drawBuffer(
					x - hwidth,
					y - hheight,
					this.__buffer
				);

			}

			if (alpha !== 1) {
				renderer.setAlpha(1.0);
			}

		},



		/*
		 * CUSTOM API
		 */

		setAvatar: function(avatar) {

			avatar = lychee.interfaceof(_Avatar, avatar) ? avatar : null;


			if (avatar !== null) {

				this.avatar = avatar;

				return true;

			}


			return false;

		},

		setCache: function(cache) {

			cache = cache instanceof Object ? cache : null;


			if (cache !== null) {

				this.cache = cache;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

