
lychee.define('lychee.ui.entity.Upload').tags({
	platform: 'html'
}).includes([
	'lychee.ui.entity.Button'
]).supports(function(lychee, global) {

	if (
		typeof global.addEventListener === 'function'
		&& typeof global.document !== 'undefined'
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
	 * FEATURE DETECTION
	 */

	(function(document) {

		let focus = 'onfocus' in document;
		if (focus === true && typeof document.addEventListener === 'function') {

			document.addEventListener('focus', function() {

				for (let w = 0, wl = _WRAPPERS.length; w < wl; w++) {

					let wrapper = _WRAPPERS[w];
					if (wrapper._visible === true) {
						wrapper.oncancel();
					}

				}

			}, true);

		}

	})(global.document || {});



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

		let allowed = [ 'json', 'fnt', 'msc', 'snd', 'png', 'js', 'tpl', 'md' ];
		let element = global.document.createElement('input');

		if (instance.type !== Composite.TYPE.all) {
			allowed = [ _MIME_TYPE[instance.type] ];
		}

		element._visible = false;
		element.setAttribute('accept',   allowed.map(function(v) { return '.' + v; }).join(','));
		element.setAttribute('type',     'file');
		element.setAttribute('multiple', '');

		element.onclick  = function() {
			element._visible = true;
		};

		element.oncancel = function() {
			element._visible = false;
			element.value    = '';
			instance.trigger('change', [ null ]);
		};

		element.onchange = function() {

			if (element._visible === false) {
				return;
			} else {
				element._visible = false;
			}


			let val    = [];
			let change = false;


			[].slice.call(this.files).forEach(function(file) {

				change = true;

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


			if (change === true) {

				setTimeout(function() {

					let result = instance.setValue(val);
					if (result === true) {
						instance.trigger('change', [ val ]);
					} else {
						instance.trigger('change', [ null ]);
					}

				}, 500);

			} else {

				instance.trigger('change', [ null ]);

			}

		};


		return element;

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

