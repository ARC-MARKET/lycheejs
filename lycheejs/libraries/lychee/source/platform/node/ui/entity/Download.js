
lychee.define('lychee.ui.entity.Download').tags({
	platform: 'node'
}).includes([
	'lychee.ui.entity.Button'
]).supports((lychee, global) => {

	if (
		typeof global.require === 'function'
		&& typeof global.process !== 'undefined'
		&& typeof global.process.env === 'object'
	) {

		try {

			global.require('fs');

			return true;

		} catch (err) {

		}

	}


	return false;

}).exports((lychee, global, attachments) => {

	const _fs     = global.require('fs');
	const _Button = lychee.import('lychee.ui.entity.Button');
	const _HOME   = (function(env) {

		let home    = env.HOME || null;
		let appdata = env.APPDATA || null;

		if (home !== null) {
			return home;
		} else if (appdata !== null) {
			return appdata;
		} else {
			return '/tmp';
		}

	})(global.process.env);



	/*
	 * HELPERS
	 */

	const _MIME_TYPE = {
		'Config':  { name: 'Entity', ext: 'json',    enc: 'utf8'   },
		'Font':    { name: 'Entity', ext: 'fnt',     enc: 'utf8'   },
		'Music':   {
			'mp3': { name: 'Entity', ext: 'msc.mp3', enc: 'binary' },
			'ogg': { name: 'Entity', ext: 'msc.ogg', enc: 'binary' }
		},
		'Sound':   {
			'mp3': { name: 'Entity', ext: 'snd.mp3', enc: 'binary' },
			'ogg': { name: 'Entity', ext: 'snd.ogg', enc: 'binary' }
		},
		'Texture': { name: 'Entity', ext: 'png',     enc: 'binary' },
		'Stuff':   { name: 'Entity', ext: 'stuff',   enc: 'utf8'   }
	};

	const _download = function(asset) {

		let data = asset.serialize();
		let url  = data.arguments[0];
		let name = url.split('/').pop();
		let mime = _MIME_TYPE[data.constructor] || _MIME_TYPE['Stuff'];


		if (data.blob !== null) {

			if (/Music|Sound/.test(data.constructor)) {

				for (let ext in mime) {

					let blob = Buffer.from(data.blob.buffer[ext], 'base64');
					let path = _HOME + '/' + name + '.' + mime[ext].ext;

					_fs.writeFileSync(path, blob, mime[ext].enc);

				}

			} else {

				let blob = Buffer.from(data.blob.buffer, 'base64');
				let path = _HOME + '/' + name + '.' + mime.ext;

				if (url.startsWith('data:')) {
					path = _HOME + '/' + mime.name + '.' + mime.ext;
				}

				_fs.writeFileSync(path, blob, mime.enc);

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

