
lychee.define('studio.ui.element.modify.Project').requires([
	'studio.data.Project',
	'lychee.ui.entity.Input',
	'lychee.ui.entity.Label',
	'lychee.ui.entity.List',
	'lychee.ui.entity.Switch',
	'lychee.ui.entity.Texture'
]).includes([
	'lychee.ui.Element'
]).exports((lychee, global, attachments) => {

	const _Element = lychee.import('lychee.ui.Element');
	const _Input   = lychee.import('lychee.ui.entity.Input');
	const _Label   = lychee.import('lychee.ui.entity.Label');
	const _List    = lychee.import('lychee.ui.entity.List');
	const _Project = lychee.import('studio.data.Project');
	const _Switch  = lychee.import('lychee.ui.entity.Switch');
	const _Texture = lychee.import('lychee.ui.entity.Texture');
	const _TEXTURE = new Texture('/libraries/breeder/icon.png');



	/*
	 * FEATURE DETECTION
	 */

	(function(texture) {

		texture.load();

	})(_TEXTURE);



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.value = null;


		this.setValue(states.value);

		delete states.value;


		states.label   = 'Modify';
		states.options = [];

		_Element.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.setEntity('identifier', new _Label({
			value: '/projects/boilerplate'
		}));

		this.setEntity('icon', new _Texture({
			width:  128,
			height: 128 + 32 + 16,
			label: 'UPLOAD ICON',
			value: _TEXTURE
		}));

		this.setEntity('harvester', new _Switch({
			value: 'on'
		}));

		this.setEntity('platforms', new _List({
			options: [
				'html',
				'html-nwjs',
				'html-webview',
				'nidium',
				'node',
				'node-sdl'
			],
			value:   {
				'html':         true,
				'html-nwjs':    true,
				'html-webview': true,
				'nidium':       true,
				'node':         true,
				'node-sdl':     true
			}
		}));


		this.getEntity('icon').bind('change', function(value) {

			if (this.value !== null) {
				this.value.setIcon(value);
			}

			this.setOptions([ 'Save' ]);

		}, this);

		this.getEntity('harvester').bind('change', function(value) {

			if (this.value !== null) {
				this.value.setHarvester(value === 'on');
			}

			this.setOptions([ 'Save' ]);

		}, this);

		this.getEntity('platforms').bind('change', function(value) {

			if (this.value !== null) {

				this.value.setPlatforms(value);

				if (value.node === false) {
					this.getEntity('harvester').setValue('off');
				}

				this.setOptions([ 'Save' ]);

			}

		}, this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Element.prototype.serialize.call(this);
			data['constructor'] = 'studio.ui.element.Project';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setValue: function(value) {

			value = value instanceof _Project ? value : null;


			if (value !== null) {

				this.value = value;

				this.getEntity('identifier').setValue(value.identifier);
				this.getEntity('harvester').setValue(value.harvester === true ? 'on' : 'off');
				this.getEntity('platforms').setValue(value.platforms);


				if (value.icon.buffer !== null) {
					this.getEntity('icon').setValue(value.icon);
				} else {
					this.getEntity('icon').setValue(_TEXTURE);
				}


				this.setOptions([]);


				return true;

			}


			return false;

		}

	};


	return Composite;

});

