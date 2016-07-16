
lychee.define('lychee.ui.element.Storage').requires([
	'lychee.Storage',
	'lychee.ui.entity.Input',
	'lychee.ui.entity.Select'
]).includes([
	'lychee.ui.Element'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _clear = function() {

		var main = global.MAIN || null;
		if (main !== null) {

			var storage = main.storage || null;
			if (storage !== null) {

				var data = lychee.serialize(storage);
				if (data !== null) {

					var blob = data.blob || null;
					if (blob !== null) {
						delete data.blob;
					}

					main.storage = lychee.deserialize(data);

				}

			}

		}

	};

	var _read = function() {

		var main = global.MAIN || null;
		if (main !== null) {

			var storage = main.storage || null;
			if (storage !== null) {

				var id   = storage.id;
				var type = storage.type;


				this.getEntity('id').setValue(id);

				if (type === lychee.Storage.TYPE.persistent) {
					this.getEntity('mode').setValue('persistent');
				} else if (type === lychee.Storage.TYPE.temporary) {
					this.getEntity('mode').setValue('temporary');
				}

			}

		}

	};

	var _save = function() {

		var main = global.MAIN || null;
		if (main !== null) {

			var storage = main.storage || null;
			if (storage !== null) {

				var id   = this.getEntity('id').value;
				var mode = this.getEntity('mode').value;


				storage.setId(id);

				if (mode === 'persistent') {
					storage.setType(lychee.Storage.TYPE.persistent);
				} else if (mode === 'temporary') {
					storage.setType(lychee.Storage.TYPE.temporary);
				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Composite = function(data) {

		var settings = Object.assign({}, data);


		settings.label   = 'Storage';
		settings.options = [ 'Save', 'Clear' ];


		lychee.ui.Element.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.setEntity('mode', new lychee.ui.entity.Select({
			options: [ 'persistent', 'temporary' ],
			value:   'persistent'
		}));

		this.setEntity('id', new lychee.ui.entity.Input({
			type:  lychee.ui.entity.Input.TYPE.text,
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

			var data = lychee.ui.Element.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.element.Storage';


			return data;

		}

	};


	return Composite;

});

