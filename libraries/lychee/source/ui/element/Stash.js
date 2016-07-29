
lychee.define('lychee.ui.element.Stash').requires([
	'lychee.Stash',
	'lychee.ui.entity.Input',
	'lychee.ui.entity.Select'
]).includes([
	'lychee.ui.Element'
]).exports(function(lychee, global, attachments) {

	const _Element = lychee.import('lychee.ui.Element');
	const _Input   = lychee.import('lychee.ui.entity.Input');
	const _Select  = lychee.import('lychee.ui.entity.Select');
	const _Stash   = lychee.import('lychee.Stash');



	/*
	 * HELPERS
	 */

	const _clear = function() {

		let main = global.MAIN || null;
		if (main !== null) {

			let stash = main.stash || null;
			if (stash !== null) {

				let data = lychee.serialize(stash);
				if (data !== null) {

					let blob = data.blob || null;
					if (blob !== null) {
						delete data.blob;
					}

					main.stash = lychee.deserialize(data);

				}

			}

		}

	};

	const _read = function() {

		let main = global.MAIN || null;
		if (main !== null) {

			let stash = main.stash || null;
			if (stash !== null) {

				let id   = stash.id;
				let type = stash.type;


				this.getEntity('id').setValue(id);

				if (type === _Stash.TYPE.persistent) {
					this.getEntity('mode').setValue('persistent');
				} else if (type === _Stash.TYPE.temporary) {
					this.getEntity('mode').setValue('temporary');
				}

			}

		}

	};

	const _save = function() {

		let main = global.MAIN || null;
		if (main !== null) {

			let stash = main.stash || null;
			if (stash !== null) {

				let id   = this.getEntity('id').value;
				let mode = this.getEntity('mode').value;


				stash.setId(id);

				if (mode === 'persistent') {
					stash.setType(_Stash.TYPE.persistent);
				} else if (mode === 'temporary') {
					stash.setType(_Stash.TYPE.temporary);
				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		settings.label   = 'Stash';
		settings.options = [ 'Save', 'Clear' ];


		_Element.call(this, settings);



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

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _Element.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.element.Stash';


			return data;

		}

	};


	return Composite;

});

