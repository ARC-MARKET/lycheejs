
lychee.define('lychee.ui.entity.Upload').tags({
	platform: 'html'
}).includes([
	'lychee.ui.entity.Button'
]).supports(function(lychee, global) {

	if (typeof global.document !== 'undefined' && typeof global.document.createElement === 'function') {

		if (typeof global.FileReader !== 'undefined' && typeof global.FileReader.prototype.readAsDataURL === 'function') {
			return true;
		}

	}


	return false;

}).exports(function(lychee, global, attachments) {

	var _instances = [];
	var _wrappers  = [];



	/*
	 * HELPERS
	 */

	var _MIME_TYPE = [
		null,
		'json',
		'fnt',
		'msc',
		'snd',
		'png',
		'*'
	];

	var _wrap = function(instance) {

		var allowed = [ 'json', 'fnt', 'msc', 'snd', 'png', 'js', 'tpl' ];
		var element = global.document.createElement('input');

		if (instance.type !== Class.TYPE.all) {
			allowed = [ _MIME_TYPE[instance.type] ];
		}

		element.setAttribute('accept',   allowed.map(function(v) { return '.' + v; }).join(','));
		element.setAttribute('type',     'file');
		element.setAttribute('multiple', '');


		element.onchange = function() {

			var val = [];


			[].slice.call(this.files).forEach(function(file) {

				var reader = new global.FileReader();

				reader.onload = function() {

					var asset = new lychee.Asset('/tmp/' + file.name, null, true);
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

				var result = instance.setValue(val);
				if (result === true) {
					instance.trigger('change', [ val ]);
				}

			}, 1000);

		};


		_wrappers.push(element);

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({
			label: 'UPLOAD'
		}, data);


		this.type  = Class.TYPE.asset;
		this.value = [];


		this.setType(settings.type);
		this.setValue(settings.value);

		delete settings.type;
		delete settings.value;


		lychee.ui.entity.Button.call(this, settings);

		settings = null;


		_instances.push(this);
		_wrappers.push(_wrap(this));



		/*
		 * INITIALIZATION
		 */

		this.unbind('touch');
		this.bind('touch', function() {

			var wrapper = _wrappers[_instances.indexOf(this)] || null;
			if (wrapper !== null) {
				wrapper.click();
			}

		}, this);

	};


	Class.TYPE = {
		all:     0,
		config:  1,
		font:    2,
		music:   3,
		sound:   4,
		texture: 5,
		stuff:   6
	};


	Class.prototype = {

		setType: function(type) {

			type = lychee.enumof(Class.TYPE, type) ? type : null;


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


	return Class;

});

