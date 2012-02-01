
game.renderer = function(view, debug) {

	if (!view instanceof ly.view) {
		throw 'Need a View instance to work properly';
	}


	this._view = view;
	this.debug = debug || null;

	this.__state = null;

	// TODO: Does it makes sense to have an initial reset?
	// Maybe dependend on the view?
	// this.reset();

};


ly.extend(game.renderer.prototype, ly.renderer.prototype, {

	reset: function(width, height, resetCache) {

		ly.renderer.prototype.reset.apply(this, arguments);


		if (resetCache === true) {
			this.__cache.sprites = {};
		}

	},

	/*
	 * This function will render per-Object.
	 * The delta is used for animation timings.
	 *
	 * @param {ly.object} object The rendered Object
	 * @param {Number} delta The delta in milliseconds
	 */
	drawObject: function(object, delta) {

		if (this.__state !== 'running') return;


		// Model is required for Rendering
		var model = object.model;
		if (model === null) return;


		var position = object.position,
			viewport = this._view.get('viewport'),
			tile = viewport.tile,
			posX = Math.round((position.x - (viewport.position.x - viewport.size.x / 2)) * tile),
			posY = Math.round((viewport.size.y - position.y + (viewport.position.y - viewport.size.y / 2)) * tile),
			bb = model.get('boundingBox');


		// Render available Sprite
		if (this.__cache.sprites[model.id] !== undefined) {

			var sprite = this.__cache.sprites[model.id],
				spriteState = model.getState(model.get('state')).sprite;

			this.drawSprite(sprite.image, posX + spriteState.x, posY + spriteState.y);

		} else {

			var sprite = model.sprite;
			if (sprite && sprite.image !== undefined) {
				this.__cache.sprites[model.id] = sprite;
			}

		}


		// TODO: Render boundingBoxes for debugging
		if (bb !== null && this.debug !== null) {

			// Render Position Rectangle
			this.__ctx.fillStyle = 'red';
			this.__ctx.fillRect(posX - 5, posY - 5, 9, 9);

			this.__ctx.beginPath();

			// Render BoundingBox
			this.__ctx.moveTo(posX + bb.minX * tile, posY + (-1 * bb.minY * tile));
			this.__ctx.lineTo(posX + bb.maxX * tile, posY + (-1 * bb.minY * tile));
			this.__ctx.lineTo(posX + bb.maxX * tile, posY + (-1 * bb.maxY * tile));
			this.__ctx.lineTo(posX + bb.minX * tile, posY + (-1 * bb.maxY * tile));
			this.__ctx.lineTo(posX + bb.minX * tile, posY + (-1 * bb.minY * tile));

			this.__ctx.lineWidth = 2;
			this.__ctx.strokeStyle = 'red';
			this.__ctx.stroke();
			this.__ctx.closePath();

		}

	}

});

