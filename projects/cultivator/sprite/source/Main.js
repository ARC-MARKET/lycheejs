
lychee.define('tool.Main').requires([
	'lychee.data.JSON',
	'tool.data.SPRITE'
]).includes([
	'lychee.app.Main'
]).tags({
	platform: 'html'
}).exports(function(lychee, tool, global, attachments) {

	var _definition = attachments["Entity.tpl"];
	var _SPRITE     = tool.data.SPRITE;
	var _JSON       = lychee.data.JSON;



	/*
	 * HELPERS
	 */

	var _update_preview = function(blob) {

		var data = _JSON.decode(blob);
		if (data instanceof Object) {

			if (data.texture !== null) {

				var img = document.querySelector('img#preview-texture');
				if (img !== null) {
					img.src = data.texture;
				}

			}


			var button = document.querySelector('button#preview-download');
			if (button !== null) {

				var buffer1 = new Buffer(_definition.buffer, 'utf8');
				var buffer2 = new Buffer(data.config.substr(29), 'base64');
				var buffer3 = new Buffer(data.texture.substr(22), 'base64');

				button.onclick = function() {
					ui.download('Entity.js',   buffer1);
					ui.download('Entity.json', buffer2);
					ui.download('Entity.png',  buffer3);
				};

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var _SIZES = {
		1: 64,
		2: 128,
		3: 256,
		4: 512,
		5: 1024,
		6: 2048,
		7: 4096,
		8: 8192
	};

	var Class = function(data) {

		var settings = Object.assign({

			client:   null,
			input:    null,
			jukebox:  null,
			renderer: null,
			server:   null,

			viewport: {
				fullscreen: false
			}

		}, data);


		this.locked = false;


		lychee.app.Main.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('submit', function(id, settings) {

			if (id === 'settings') {

				if (this.locked === false) {

					this.locked = true;

					this.loop.setTimeout(100, function() {

						settings.texture = _SIZES[settings.size];


						try {

							var sprite = _SPRITE.encode(settings);
							if (sprite !== null) {
								_update_preview(sprite);
							}

						} catch(e) {


						} finally {

							this.locked = false;

						}

					}, this);

				}

			}

		}, this);

	};


	Class.prototype = {

	};


	return Class;

});
