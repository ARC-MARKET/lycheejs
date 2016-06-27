
lychee.define('game.Camera').exports(function(lychee, global, attachments) {

	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		this.renderer = main.renderer || null;

		this.depth    = 0.2;
		this.offset   = 0;
		this.position = { x: 0, y: 0, z: 0 };

//		var fov = 100;
//		this.__depth    = 1 / Math.tan((fov/2) * Math.PI/180);
		this.__ratio    = 1.2;


	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			return {
				'constructor': 'game.Camera',
				'arguments':   [ '#MAIN' ]
			};

		},



		/*
		 * CUSTOM API
		 */

		reshape: function() {

			var renderer = this.renderer;
			if (renderer !== null) {

				var width  = renderer.width;
				var height = renderer.height;

				this.offset = (width / height) * this.__ratio * height + 16;

			}

		}

	};


	return Class;

});

