
lychee.define('lychee.ui.entity.Upload').tags({
	platform: 'html'
}).includes([
	'lychee.ui.entity.Button'
]).supports(function(lychee, global) {

	if (
		typeof global.document !== 'undefined'
		&& typeof global.document.createElement === 'function'
		&& typeof global.FileReader !== 'undefined'
		&& typeof global.FileReader.prototype.readAsDataURL === 'function'
	) {
		return true;
	}


	return false;

}).exports(function(lychee, global, attachments) {

	const _Button    = lychee.import('lychee.ui.entity.Button');
	const _INSTANCES = [];
	const _WRAPPERS  = [];



	/*
	 * HELPERS
	 */

	const _MIME_TYPE = [
		null,
		'json',
		'fnt',
		'msc',
		'snd',
		'png',
		'*'
	];

	const _wrap = function(instance) {

		let allowed = [ 'json', 'fnt', 'msc', 'snd', 'png', 'js', 'tpl' ];
		let element = global.document.createElement('input');

		if (instance.type !== Composite.TYPE.all) {
			allowed = [ _MIME_TYPE[instance.type] ];
		}

		element.setAttribute('accept',   allowed.map(function(v) { return '.' + v; }).join(','));
		element.setAttribute('type',     'file');
		element.setAttribute('multiple', '');


		element.onchange = function() {

			let val = [];


			[].slice.call(this.files).forEach(function(file) {

				let reader = new global.FileReader();

				reader.onload = function() {

					let asset = new lychee.Asset('/tmp/' + file.name, null, true);
					if (asset !== null) {

						asset.deserialize({
							buffer: reader.result
						});

						val.push(asset);

					}

				};

				reader.readAsDataURL(file);

			});


			setTimeout(function() {

				let result = instance.setValue(val);
				if (result === true) {
					instance.trigger('change', [ val ]);
				}

			}, 1000);

		};


		_WRAPPERS.push(element);

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({
			label: 'UPLOAD'
		}, data);


		this.type  = Composite.TYPE.asset;
		this.value = [];


		this.setType(settings.type);
		this.setValue(settings.value);

		delete settings.type;
		delete settings.value;


		_Button.call(this, settings);

		settings = null;


		_INSTANCES.push(this);
		_WRAPPERS.push(_wrap(this));



		/*
		 * INITIALIZATION
		 */

		this.unbind('touch');
		this.bind('touch', function() {

			let wrapper = _WRAPPERS[_INSTANCES.indexOf(this)] || null;
			if (wrapper !== null) {
				wrapper.click();
			}

		}, this);

	};


	Composite.TYPE = {
		'all':     0,
		'config':  1,
		'font':    2,
		'music':   3,
		'sound':   4,
		'texture': 5,
		'stuff':   6
	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Button.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.entity.Upload';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setType: function(type) {

			type = lychee.enumof(Composite.TYPE, type) ? type : null;


			if (type !== null) {

				this.type = type;

				return true;

			}


			return false;

		},

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


	return Composite;

});

