
lychee.define('game.Renderer').includes([
	'lychee.Renderer'
]).requires([
	'game.Camera',
	'game.Compositor'
]).exports(function(lychee, global, attachments) {

	var _Camera     = lychee.import('game.Camera');
	var _Compositor = lychee.import('game.Compositor');
	var _Renderer   = lychee.import('lychee.Renderer');



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);

		this.camera     = null;
		this.compositor = null;


		this.setCamera(settings.camera);
		this.setCompositor(settings.compositor);

		delete settings.camera;
		delete settings.compositor;


		_Renderer.call(this, settings);

		settings = null;

	};

	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			var camera = lychee.deserialize(blob.camera);
			if (camera !== null) {
				this.setCamera(camera);
			}

			var compositor = lychee.deserialize(blob.compositor);
			if (compositor !== null) {
				this.setCompositor(compositor);
			}

		},

		serialize: function() {

			var data = _Renderer.prototype.serialize.call(this);
			data['constructor'] = 'game.Renderer';

			var settings = (data['arguments'][0] || {});
			var blob     = (data['blob'] || {});


			if (this.camera !== null)     blob.camera     = lychee.serialize(this.camera);
			if (this.compositor !== null) blob.compositor = lychee.serialize(this.compositor);


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setCamera: function(camera) {

			camera = camera instanceof _Camera ? camera : null;


			if (camera !== null) {

				this.camera = camera;

				return true;

			}


			return false;

		},

		setCompositor: function(compositor) {

			compositor = compositor instanceof _Compositor ? compositor : null;


			if (compositor !== null) {

				this.compositor = compositor;

				return true;

			}


			return false;

		},

		renderEntity: function(entity, offsetX, offsetY) {

			if (typeof entity.render === 'function') {

				entity.render(
					this,
					offsetX || 0,
					offsetY || 0,
					this.camera,
					this.compositor
				);

			}

		}

	};


	return Class;

});

