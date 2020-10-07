
lychee.define('lychee.ui.element.Storage').requires([
	'lychee.Storage',
	'lychee.ui.entity.Input',
	'lychee.ui.entity.Select'
]).includes([
	'lychee.ui.Element'
]).exports((lychee, global, attachments) => {

	const _Element = lychee.import('lychee.ui.Element');
	const _Input   = lychee.import('lychee.ui.entity.Input');
	const _Select  = lychee.import('lychee.ui.entity.Select');
	const _Storage = lychee.import('lychee.Storage');



	/*
	 * HELPERS
	 */

	const _clear = function() {

		let main = global.MAIN || null;
		if (main !== null) {

			let storage = main.storage || null;
			if (storage !== null) {

				let data = lychee.serialize(storage);
				if (data !== null) {

					let blob = data.blob || null;
					if (blob !== null) {
						delete data.blob;
					}

					main.storage = lychee.deserialize(data);

				}

			}

		}

	};

	const _read = function() {

		let main = global.MAIN || null;
		if (main !== null) {

			let storage = main.storage || null;
			if (storage !== null) {

				let id   = storage.id;
				let type = storage.type;


				this.getEntity('id').setValue(id);

				if (type === _Storage.TYPE.persistent) {
					this.getEntity('mode').setValue('persistent');
				} else if (type === _Storage.TYPE.temporary) {
					this.getEntity('mode').setValue('temporary');
				}

			}

		}

	};

	const _save = function() {

		let main = global.MAIN || null;
		if (main !== null) {

			let storage = main.storage || null;
			if (storage !== null) {

				let id   = this.getEntity('id').value;
				let mode = this.getEntity('mode').value;


				storage.setId(id);

				if (mode === 'persistent') {
					storage.setType(_Storage.TYPE.persistent);
				} else if (mode === 'temporary') {
					storage.setType(_Storage.TYPE.temporary);
				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		states.label    = 'Storage';
		states.options  = [ 'Save', 'Clear' ];
		states.relayout = true;


		_Element.call(this, states);



		/*
		 * INITIALIZATION
		 */

		this.setEntity('mode', new _Select({
			options: [ 'persistent', 'temporary' ],
			value:   'persistent'
		}));

		this.setEntity('id', new _Input({
			type:  _Input.TYPE.text,
			value: 'app'
		}));

		this.bind('change', function(action) {

			if (action === 'clear') {
				_clear.call(this);
			} else if (action === 'save') {
				_save.call(this);
			}

		}, this);


		_read.call(this);

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Element.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.element.Storage';


			return data;

		}

	};


	return Composite;

});

