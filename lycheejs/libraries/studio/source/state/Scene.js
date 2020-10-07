
lychee.define('studio.state.Scene').requires([
	'studio.codec.SCENE',
	'studio.ui.element.select.Scene',
	// 'studio.ui.element.modify.Scene',
	// 'studio.ui.element.preview.Scene',
	'lychee.ui.Blueprint',
	'lychee.ui.Element',
	'lychee.ui.Layer'
]).includes([
	'lychee.ui.State'
]).exports((lychee, global, attachments) => {

	const _State = lychee.import('lychee.ui.State');
	const _SCENE = lychee.import('studio.codec.SCENE');
	const _BLOB  = attachments['json'].buffer;



	/*
	 * HELPERS
	 */

	const _update_view = function() {
	};

	const _on_select_change = function(value) {
	};

	const _on_modify_change = function(value) {
	};

	const _on_preview_change = function(action) {
	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(main) {

		_State.call(this, main);


		this.api = main.api || null;

		this.__configs = [];
		this.__states  = [];


		this.deserialize(_BLOB);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'studio.state.Scene';


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
			let select  = this.query('ui > scene > select');

			if (project !== null && select !== null) {

				let configs = this.__configs;
				let states  = this.__states;
				let sandbox = project.identifier + '/source';


				let scenes = project.getScenes();
				if (scenes.length > 0) {

					let remaining = scenes.length;

					scenes.forEach(path => {

						let config = new Config(sandbox + '/' + path);

						config.onload = function(result) {

							if (result === true) {

								configs.push(this);
								states.push(_SCENE.decode(this));

							}

							remaining--;

							if (remaining === 0) {
								// TODO: _on_select_change.call(this) !?!?
								oncomplete(true);
							}

						};

						config.load();

					});

				} else {

					oncomplete(true);

				}

				// TODO: select.setData(list);
				// TODO: list.setData(...);
				// select.setData(filtered);

			}


			return _State.prototype.enter.call(this, oncomplete, data);

		}

	};


	return Composite;

});

