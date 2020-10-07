
lychee.define('app.ui.entity.Messages').requires([
	'app.ui.sprite.Avatar'
]).includes([
	'lychee.ui.Entity'
]).exports((lychee, global, attachments) => {

	const _Avatar = lychee.import('app.ui.sprite.Avatar');
	const _Entity = lychee.import('lychee.ui.Entity');
	const _FONT   = attachments['fnt'];



	/*
	 * HELPERS
	 */

	const _render_buffer = function(renderer) {

		let font = _FONT || null;
		if (font !== null && font.texture !== null) {

			if (this.__buffer !== null) {
				this.__buffer.resize(this.width, this.height);
			} else {
				this.__buffer = renderer.createBuffer(this.width, this.height);
			}


			renderer.clear(this.__buffer);
			renderer.setBuffer(this.__buffer);
			renderer.setAlpha(1.0);


			let avatar   = this.avatar;
			let mx1      = this.offset.x;
			let my1      = this.offset.y + this.height - 32;
			let last     = null;
			let messages = this.cache.messages;

			for (let m = messages.length - 1; m >= 0; m--) {

				let entry = messages[m];
				let color = entry.user === 'system' ? '#d0494b' : entry.user;


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

	const Composite = function(data) {

		let states = Object.assign({}, data);


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


		_Entity.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function() {

			if (this.state === 'active') {
				// XXX: Do nothing
			}

		}, this);

		this.bind('relayout', function() {
			this.__isDirty = true;
		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'app.ui.entity.Messages';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			let alpha    = this.alpha;
			let position = this.position;
			let x        = position.x + offsetX;
			let y        = position.y + offsetY;
			let hwidth   = this.width  / 2;
			let hheight  = this.height / 2;


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

