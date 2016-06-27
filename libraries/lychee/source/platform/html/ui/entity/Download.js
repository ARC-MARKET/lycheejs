
lychee.define('lychee.ui.entity.Download').tags({
	platform: 'html'
}).includes([
	'lychee.ui.entity.Button'
]).supports(function(lychee, global) {

	if (typeof global.document !== 'undefined') {

		if (typeof global.document.createElement === 'function') {
			return true;
		}

	}


	return false;

}).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _MIME = {
		'Config':  { name: 'Entity', ext: 'json',    mime: 'application/json'         },
		'Font':    { name: 'Entity', ext: 'fnt',     mime: 'application/json'         },
		'Music':   {
			'mp3': { name: 'Entity', ext: 'msc.mp3', mime: 'audio/mp3'                },
			'ogg': { name: 'Entity', ext: 'msc.ogg', mime: 'application/ogg'          },
		},
		'Sound':   {
			'mp3': { name: 'Entity', ext: 'snd.mp3', mime: 'audio/mp3'                },
			'ogg': { name: 'Entity', ext: 'snd.ogg', mime: 'application/ogg'          },
		},
		'Texture': { name: 'Entity', ext: 'png',     mime: 'image/png'                },
		'Stuff':   { name: 'Entity', ext: 'stuff',   mime: 'application/octet-stream' }
	};


	var _download = function(asset) {

		var data = asset.serialize();
		var url  = data.arguments[0];
		var name = url.split('/').pop();
		var mime = _MIME[data.constructor] || _MIME['Stuff'];


		if (data.blob !== null) {

			if (data.constructor.match(/Music|Sound/)) {

				for (var ext in mime) {

					var element = global.document.createElement('a');

					element.download = name + '.' + ext;
					element.href     = data.blob.buffer[ext];

					element.click();

				}

			} else {

				if (url.substr(0, 5) === 'data:') {
					name = mime.name + '.' + mime.ext;
				}

				var element = global.document.createElement('a');

				element.download = name;
				element.href     = data.blob.buffer;

				element.click();

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({
			label: 'DOWNLOAD'
		}, data);


		this.value = [];


		this.setValue(settings.value);

		delete settings.value;


		lychee.ui.entity.Button.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.unbind('touch');
		this.bind('touch', function() {

			this.value.forEach(function(asset) {
				_download(asset);
			});

		}, this);

	};


	Class.prototype = {

		setValue: function(value) {

			value = value instanceof Array ? value : null;


			if (value !== null) {

				this.value = value.filter(function(asset) {

					if (asset instanceof global.Config)  return true;
					if (asset instanceof global.Font)    return true;
					if (asset instanceof global.Music)   return true;
					if (asset instanceof global.Sound)   return true;
					if (asset instanceof global.Texture) return true;
					if (asset instanceof global.Stuff)   return true;


					return false;

				});


				return true;

			}


			return false;

		}

	};


	return Class;

});

