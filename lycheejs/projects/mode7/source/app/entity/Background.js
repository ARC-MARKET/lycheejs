
lychee.define('game.app.entity.Background').includes([
	'lychee.app.Entity'
]).exports((lychee, global, attachments) => {

	const _Entity  = lychee.import('lychee.app.Entity');
	const _TEXTURE = attachments['png'];
	const _CONFIG  = {
		states: { 'default': 0 },
		map:    {
			'foreground': { x: 0, y: 0,   w: 1024, h: 512 },
			'background': { x: 0, y: 512, w: 1024, h: 512 }
		}
	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.origin    = { bgx: 0, bgy: 0, fgx: 0, fgy: 0 };

		this.__buffer  = null;
		this.__isDirty = true;


		this.setOrigin(states.origin);


		delete states.origin;


		states.width  = states.width  || 1024;
		states.height = states.height || 512;
		states.states = _CONFIG.states;


		_Entity.call(this, states);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Entity.prototype.serialize.call(this);
			data['constructor'] = 'game.app.entity.Background';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		render: function(renderer, offsetX, offsetY) {

			let fgmap = _CONFIG.map.foreground;
			let bgmap = _CONFIG.map.background;


			let buffer = this.__buffer;
			if (buffer === null) {
				buffer = this.__buffer = renderer.createBuffer(this.width, this.height);
			}


			if (this.__isDirty === true) {

				renderer.setBuffer(buffer);


				let px1 = this.origin.bgx - (bgmap.w / 2) - bgmap.w;
				let py1 = this.origin.bgy - bgmap.h;


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


				let px2 = this.origin.fgx - (fgmap.w / 2) - fgmap.w;
				let py2 = this.origin.fgy - fgmap.h;

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


			let position = this.position;

			let x1 = position.x + offsetX - this.width  / 2;
			let y1 = position.y + offsetY - this.height / 2;


			renderer.drawBuffer(
				x1,
				y1,
				buffer
			);

		},

		setOrigin: function(origin) {

			origin = origin instanceof Object ? origin : null;


			if (origin !== null) {

				this.origin.bgx = typeof origin.bgx === 'number' ? origin.bgx : this.origin.bgx;
				this.origin.bgy = typeof origin.bgy === 'number' ? origin.bgy : this.origin.bgy;
				this.origin.fgx = typeof origin.fgx === 'number' ? origin.fgx : this.origin.fgx;
				this.origin.fgy = typeof origin.fgy === 'number' ? origin.fgy : this.origin.fgy;

				this.origin.bgx %= 1024;
				this.origin.fgx %= 1024;

				this.__isDirty = true;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

