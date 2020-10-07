
lychee.define('lychee.ui.entity.Download').tags({
	platform: 'html'
}).includes([
	'lychee.ui.entity.Button'
]).supports((lychee, global) => {

	if (
		typeof global.document !== 'undefined'
		&& typeof global.document.createElement === 'function'
	) {
		return true;
	}


	return false;

}).exports((lychee, global, attachments) => {

	const _Button = lychee.import('lychee.ui.entity.Button');



	/*
	 * HELPERS
	 */

	const _MIME_TYPE = {
		'Config':  { name: 'Entity', ext: 'json',    mime: 'application/json'         },
		'Font':    { name: 'Entity', ext: 'fnt',     mime: 'application/json'         },
		'Music':   {
			'mp3': { name: 'Entity', ext: 'msc.mp3', mime: 'audio/mp3'                },
			'ogg': { name: 'Entity', ext: 'msc.ogg', mime: 'application/ogg'          }
		},
		'Sound':   {
			'mp3': { name: 'Entity', ext: 'snd.mp3', mime: 'audio/mp3'                },
			'ogg': { name: 'Entity', ext: 'snd.ogg', mime: 'application/ogg'          }
		},
		'Texture': { name: 'Entity', ext: 'png',     mime: 'image/png'                },
		'Stuff':   { name: 'Entity', ext: 'stuff',   mime: 'application/octet-stream' }
	};

	const _download = function(asset) {

		let data = asset.serialize();
		let url  = data.arguments[0];
		let name = url.split('/').pop();
		let mime = _MIME_TYPE[data.constructor] || _MIME_TYPE['Stuff'];


		if (data.blob !== null) {

			if (/Music|Sound/.test(data.constructor)) {

				for (let ext in mime) {

					let element = global.document.createElement('a');

					element.download = name + '.' + mime[ext].ext;
					element.href     = data.blob.buffer[ext];

					element.click();

				}

			} else {

				if (url.startsWith('data:')) {
					name = mime.name + '.' + mime.ext;
				}

				let element = global.document.createElement('a');

				element.download = name;
				element.href     = data.blob.buffer;

				element.click();

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({
			label: 'DOWNLOAD'
		}, data);


		this.value = [];


		this.setValue(states.value);

		delete states.value;


		_Button.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.unbind('touch');
		this.bind('touch', function() {
			this.value.forEach(asset => _download(asset));
		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Button.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.entity.Download';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setValue: function(value) {

			value = value instanceof Array ? value : null;


			if (value !== null) {

				this.value = value.filter(asset => {

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


	return Composite;

});

