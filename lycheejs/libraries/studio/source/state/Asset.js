
lychee.define('studio.state.Asset').requires([
	'studio.codec.FONT',
	'studio.ui.element.modify.Font',
	'studio.ui.element.modify.Music',
	'studio.ui.element.modify.Sound',
	'studio.ui.element.modify.Sprite',
	'studio.ui.element.preview.Font',
	'studio.ui.element.preview.Music',
	'studio.ui.element.preview.Sound',
	'studio.ui.element.preview.Sprite',
	'lychee.ui.Blueprint',
	'lychee.ui.Element',
	'lychee.ui.Layer',
	'lychee.ui.element.Search'
]).includes([
	'lychee.ui.State'
]).exports((lychee, global, attachments) => {

	const _Element = lychee.import('lychee.ui.Element');
	const _State   = lychee.import('lychee.ui.State');
	const _modify  = lychee.import('studio.ui.element.modify');
	const _preview = lychee.import('studio.ui.element.preview');
	const _FONT    = lychee.import('studio.codec.FONT');
	const _BLOB    = attachments['json'].buffer;



	/*
	 * HELPERS
	 */

	const _validate_asset = function(asset) {

		return (
			asset instanceof Config
			|| asset instanceof Font
			|| asset instanceof Music
			|| asset instanceof Sound
			|| asset instanceof Texture
			|| asset instanceof Stuff
		);

	};

	const _update_view = function(type, asset) {

		let layer   = this.query('ui > asset');
		let modify  = this.query('ui > asset > modify');
		let preview = this.query('ui > asset > preview');


		if (_modify[type] === undefined) {

			if (modify !== null) {
				layer.removeEntity(modify);
				modify = null;
			}

		} else if ((modify instanceof _modify[type]) === false) {

			if (modify !== null) {
				layer.removeEntity(modify);
				modify = null;
			}

			modify = new _modify[type]({
				width:   240,
				height:  620,
				type:    _Element.TYPE.auto,
				value:   asset,
				visible: true
			});

			modify.bind('change', _on_modify_change, this);
			layer.setEntity('modify', modify);

		} else if (modify !== null) {

			modify.visible = true;
			modify.setValue(asset);

		}


		if (_preview[type] === undefined) {

			if (preview !== null) {
				layer.removeEntity(preview);
				preview = null;
			}

		} else if ((preview instanceof _preview[type]) === false) {

			if (preview !== null) {
				layer.removeEntity(preview);
				preview = null;
			}

			preview = new _preview[type]({
				width:   480,
				height:  620,
				type:    _Element.TYPE.full,
				value:   asset,
				visible: true
			});

			preview.bind('change', _on_preview_change, this);
			layer.setEntity('preview', preview);

		} else if (preview !== null) {

			preview.visible = true;
			preview.setValue(asset);

			setTimeout(_ => preview.trigger('relayout'), 200);

		}


		layer.trigger('relayout');

	};

	const _on_select_change = function(value) {

		let project = this.main.project;
		let path    = project.identifier + '/source/' + value;
		let ns      = value.split('/')[0];


		if (value.endsWith('.fnt')) {

			let asset = new Font(path);

			asset.onload = _ => _update_view.call(this, 'Font', asset);
			asset.load();

		} else if (value.endsWith('.png')) {

			let asset = {
				texture: new Texture(path),
				config:  new Config(path.replace('.png', '.json'))
			};

			asset.texture.onload = _ => {
				asset.config.onload = _ => _update_view.call(this, 'Sprite', asset);
				asset.config.load();
			};

			asset.texture.load();

		} else if (value.endsWith('.json') && /^(app|entity|sprite|ui)$/g.test(ns)) {

			let asset = {
				texture: new Texture(path.replace('.json', '.png')),
				config:  new Config(path)
			};

			asset.texture.onload = _ => {
				asset.config.onload = _ => _update_view.call(this, 'Sprite', asset);
				asset.config.load();
			};

			asset.texture.load();

		} else if (value.endsWith('.json')) {

			let asset = new Config(path);

			asset.onload = _ => _update_view.call(this, 'Config', asset);
			asset.load();

		} else if (value.endsWith('.msc')) {

			let asset = new Music(path);

			asset.onload = _ => _update_view.call(this, 'Music', asset);
			asset.load();

		} else if (value.endsWith('.snd')) {

			let asset = new Sound(path);

			asset.onload = _ => _update_view.call(this, 'Sound', asset);
			asset.load();

		}


		let notice = this.query('ui > notice');
		if (notice !== null) {
			notice.setLabel('Asset opened.');
			notice.setState('active');
		}

	};

	const _on_modify_change = function(value) {

		let preview = this.query('ui > asset > preview');
		if (preview !== null) {

			preview.setValue(value);

			setTimeout(_ => preview.trigger('relayout'), 200);

		}

	};

	const _on_preview_change = function(action) {

		let select = this.query('ui > asset > select');
		let modify = this.query('ui > asset > modify');
		let notice = this.query('ui > notice');

		if (select !== null && modify !== null) {

			if (action === 'save') {

				let stash = this.main.stash || null;
				let asset = modify.value || null;

				if (stash !== null) {

					let assets = [];
					let urls   = [];

					if (_validate_asset(asset) === true) {

						assets.push(asset);
						urls.push(asset.url);

					} else if (asset instanceof Object) {

						for (let aid in asset) {

							if (_validate_asset(asset[aid]) === true) {
								urls.push(asset[aid].url);
								assets.push(asset[aid]);
							}

						}

					}


					if (urls.length > 0) {

						stash.write(urls, assets, result => {

							if (notice !== null) {
								notice.setLabel('Assets saved.');
								notice.setState('active');
							}

						}, this);

					}

				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(main) {

		_State.call(this, main);


		this.api = main.api || null;


		this.deserialize(_BLOB);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'studio.state.Asset';


			return data;

		},

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			let select = this.query('ui > asset > select');
			if (select !== null) {
				select.bind('change', _on_select_change, this);
			}


			let modify  = this.query('ui > asset > modify');
			let preview = this.query('ui > asset > preview');

			if (modify !== null && preview !== null) {

				modify.bind('change', value => {

					preview.setValue(value);

					setTimeout(_ => preview.trigger('relayout'), 200);

				}, this);

				preview.bind('change', _on_preview_change, this);

			}

		},

		enter: function(oncomplete, data) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;
			data       = typeof data === 'string'       ? data       : null;


			let project = this.main.project;
			let select  = this.query('ui > asset > select');

			if (project !== null && select !== null) {

				let filtered = [];
				let assets   = project.getAssets();

				assets.forEach(asset => {

					let ext  = asset.split('.').pop();
					let path = asset.split('.').slice(0, -1).join('.');
					let map  = assets.indexOf(path + '.json');

					if (ext === 'png' && map !== -1) {
						filtered.push(path + '.png');
					} else if (ext === 'fnt') {
						filtered.push(path + '.fnt');
					} else if (ext === 'msc') {
						filtered.push(path + '.msc');
					} else if (ext === 'snd') {
						filtered.push(path + '.snd');
					}

				});

				select.setData(filtered);

			}


			return _State.prototype.enter.call(this, oncomplete, data);

		}

	};


	return Composite;

});

