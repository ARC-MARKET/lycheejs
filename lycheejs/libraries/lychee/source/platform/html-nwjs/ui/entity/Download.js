
lychee.define('lychee.ui.entity.Download').tags({
	platform: 'html-nwjs'
}).includes([
	'lychee.ui.entity.Button'
]).supports((lychee, global) => {

	if (
		typeof global.require === 'function'
		&& typeof global.document !== 'undefined'
		&& typeof global.document.createElement === 'function'
	) {

		try {

			global.require('fs');

			return true;

		} catch (err) {

		}

	}


	return false;

}).exports((lychee, global, attachments) => {

	// const Buffer  = lychee.import('Buffer');
	const _fs     = global.require('fs');
	const _Buffer = global.require('buffer').Buffer;
	const _Button = lychee.import('lychee.ui.entity.Button');



	/*
	 * HELPERS
	 */

	const _MIME_TYPE = {
		'Config':  { name: 'Entity', ext: 'json',    mime: 'application/json',         enc: 'utf8'   },
		'Font':    { name: 'Entity', ext: 'fnt',     mime: 'application/json',         enc: 'utf8'   },
		'Music':   {
			'mp3': { name: 'Entity', ext: 'msc.mp3', mime: 'audio/mp3',                enc: 'binary' },
			'ogg': { name: 'Entity', ext: 'msc.ogg', mime: 'application/ogg',          enc: 'binary' }
		},
		'Sound':   {
			'mp3': { name: 'Entity', ext: 'snd.mp3', mime: 'audio/mp3',                enc: 'binary' },
			'ogg': { name: 'Entity', ext: 'snd.ogg', mime: 'application/ogg',          enc: 'binary' }
		},
		'Texture': { name: 'Entity', ext: 'png',     mime: 'image/png',                enc: 'binary' },
		'Stuff':   { name: 'Entity', ext: 'stuff',   mime: 'application/octet-stream', enc: 'utf8'   }
	};

	const _download = function(asset) {

		let data = asset.serialize();
		let url  = data.arguments[0];
		let name = url.split('/').pop();
		let mime = _MIME_TYPE[data.constructor] || _MIME_TYPE['Stuff'];


		if (data.blob !== null) {

			if (/Music|Sound/.test(data.constructor)) {

				for (let ext in mime) {

					let element = global.document.createElement('input');

					element.setAttribute('type',     'file');
					element.setAttribute('nwsaveas', name + '.' + mime[ext].ext);

					element.onchange = function() {

						let blob = new _Buffer(data.blob.buffer[ext], 'base64');
						let path = this.value;

						_fs.writeFileSync(path, blob, mime[ext].enc);

					};

					element.click();

				}

			} else {

				if (url.startsWith('data:')) {
					name = mime.name + '.' + mime.ext;
				}

				let element = global.document.createElement('input');

				element.setAttribute('type',     'file');
				element.setAttribute('nwsaveas', name);

				element.onchange = function() {

					let blob = new _Buffer(data.blob.buffer, 'base64');
					let path = this.value;

					_fs.writeFileSync(path, blob, mime.enc);

				};

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

