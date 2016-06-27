
lychee.define('tool.Main').requires([
	'lychee.codec.JSON',
	'tool.data.FNT'
]).includes([
	'lychee.app.Main'
]).tags({
	platform: 'html'
}).exports(function(lychee, global, attachments) {

	var _FNT  = lychee.import('tool.data.FNT');
	var _JSON = lychee.import('lychee.codec.JSON');



	/*
	 * HELPERS
	 */

	var _update_preview = function(blob, settings) {

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

				var filename = settings.family + '_' + settings.size + 'x' + settings.outline + '.fnt';
				var buffer   = new Buffer(blob, 'utf8');

				button.onclick = function() {
					ui.download(filename, buffer);
				};

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

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


		lychee.app.Main.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('init', function() {

			var onsubmit = document.querySelector('form').onsubmit;
			if (onsubmit instanceof Function) {
				onsubmit();
			}

		}, this, true);

		this.bind('submit', function(id, settings) {

			if (id === 'settings') {

				var font = _FNT.encode(settings);
				if (font !== null) {
					_update_preview(font, settings);
				}

			}

		}, this);

	};


	Class.prototype = {

	};


	return Class;

});
