
lychee.define('lychee.ui.entity.Upload').tags({
	platform: 'html'
}).includes([
	'lychee.ui.entity.Button'
]).supports((lychee, global) => {

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

}).exports((lychee, global, attachments) => {

	const _Button     = lychee.import('lychee.ui.entity.Button');
	const _FileReader = global.FileReader;
	const _INSTANCES  = [];
	const _WRAPPERS   = [];



	/*
	 * FEATURE DETECTION
	 */

	(function(document) {

		let focus = 'onfocus' in document;
		if (focus === true && typeof document.addEventListener === 'function') {

			document.addEventListener('focus', _ => {

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

	const _wrap = function(instance) {

		let allowed = [ 'json', 'fnt', 'ogg', 'mp3', 'png', 'js', 'tpl', 'md' ];
		let element = global.document.createElement('input');


		let type = instance.type;
		if (type === Composite.TYPE.all) {
			allowed = [ '*' ];
		} else if (type === Composite.TYPE.config) {
			allowed = [ 'json' ];
		} else if (type === Composite.TYPE.font) {
			allowed = [ 'fnt' ];
		} else if (type === Composite.TYPE.music) {
			allowed = [ 'mp3', 'ogg' ];
		} else if (type === Composite.TYPE.sound) {
			allowed = [ 'mp3', 'ogg' ];
		} else if (type === Composite.TYPE.texture) {
			allowed = [ 'png' ];
		} else if (type === Composite.TYPE.stuff) {
			allowed = [ '*' ];
		}


		element._visible = false;
		element.setAttribute('accept',   allowed.map(v => '.' + v).join(','));
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


			let val   = [];
			let files = Array.from(this.files);

			if (files.length > 0) {

				let check_mp3 = files.find(file => file.name.endsWith('.mp3')) || null;
				let check_ogg = files.find(file => file.name.endsWith('.ogg')) || null;

				if (check_mp3 !== null || check_ogg !== null) {

					let name = (check_mp3 || check_ogg).name.split('/').pop();
					if (name.endsWith('.mp3') || name.endsWith('.ogg')) {
						name = name.split('.').slice(0, -1).join('.');
					}

					if (type === Composite.TYPE.music && name.endsWith('.msc') === false) {
						name = name + '.msc';
					} else if (type === Composite.TYPE.sound && name.endsWith('.snd') === false) {
						name = name + '.snd';
					}


					let tmp = {
						mp3: null,
						ogg: null
					};

					if (check_mp3 !== null) {

						let reader = new _FileReader();

						reader.onload = function() {

							tmp['mp3'] = reader.result;

							if (check_ogg === null || tmp['ogg'] !== null) {

								let asset = new lychee.Asset('/tmp/' + name, null, true);
								if (asset !== null) {

									asset.deserialize({
										buffer: {
											mp3: tmp['mp3'],
											ogg: tmp['ogg']
										}
									});

									val.push(asset);

								}

							}

						};

						reader.readAsDataURL(check_mp3);

					}

					if (check_ogg !== null) {

						let reader = new _FileReader();

						reader.onload = function() {

							tmp['ogg'] = reader.result;

							if (check_mp3 === null || tmp['mp3'] !== null) {

								let asset = new lychee.Asset('/tmp/' + name, null, true);
								if (asset !== null) {

									asset.deserialize({
										buffer: {
											mp3: tmp['mp3'],
											ogg: tmp['ogg']
										}
									});

									val.push(asset);

								}

							}

						};

						reader.readAsDataURL(check_ogg);

					}

				} else {

					files.forEach(file => {

						let reader = new _FileReader();

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

				}


				setTimeout(_ => {

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

	const Composite = function(data) {

		let states = Object.assign({
			label: 'UPLOAD'
		}, data);


		this.type  = Composite.TYPE.asset;
		this.value = [];


		this.setType(states.type);
		this.setValue(states.value);

		delete states.type;
		delete states.value;


		_Button.call(this, states);

		states = null;


		_INSTANCES.push(this);
		_WRAPPERS.push(_wrap(this));



		/*
		 * INITIALIZATION
		 */

		this.unbind('touch');
		this.bind('touch', function() {

			let wrapper = _WRAPPERS[_INSTANCES.indexOf(this)] || null;
			if (wrapper !== null) {

				// XXX: Removing this causes endless loop
				setTimeout(_ => {
					wrapper.click();
				}, 250);

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

