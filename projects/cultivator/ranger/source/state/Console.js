
lychee.define('app.state.Console').requires([
	'app.ui.entity.Console',
	'lychee.ui.entity.Label',
	'lychee.ui.layer.Table'
]).includes([
	'lychee.ui.State'
]).exports(function(lychee, global, attachments) {

	var _State  = lychee.import('lychee.ui.State');
	var _BLOB   = attachments["json"].buffer;



	/*
	 * HELPERS
	 */

	var _on_sync = function(data) {

		var blob  = data.blob || {};
		var value = [{
			stdout: blob.stdout || '',
			stderr: blob.stderr || ''
		}];


		if (value.length > 0) {

			var table = this.queryLayer('ui', 'console > status > 0');
			if (table !== null) {
				table.setValue(value);
			}


			var stdout = table.getEntity('0');
			if (stdout !== null) {
				stdout.width  = table.width / 2;
				stdout.height = table.height - 96;
			}

			var stderr = table.getEntity('1');
			if (stderr !== null) {
				stderr.width  = table.width / 2;
				stderr.height = table.height - 96;
			}


			table.trigger('relayout');

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		_State.call(this, main);


		this.deserialize(_BLOB);

	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			var viewport = this.viewport;
			if (viewport !== null) {

				viewport.relay('reshape', this.queryLayer('ui', 'console > status'));


				entity = this.queryLayer('ui', 'console > status');
				entity.bind('#reshape', function(entity, orientation, rotation, width, height) {

					var menu = this.queryLayer('ui', 'menu');
					var w    = (((width - menu.width) / 512) | 0) * 512;
					var h    = ((height               / 128) | 0) * 128;


					entity.width  = w;
					entity.height = h;


					var table = entity.getEntity('0');
					if (table !== null) {

						table.width  = w - 32;
						table.height = h - 96;


						var stdout = table.getEntity('0');
						if (stdout !== null) {
							stdout.width  = table.width / 2;
							stdout.height = table.height - 96;
						}

						var stderr = table.getEntity('1');
						if (stderr !== null) {
							stderr.width  = table.width / 2;
							stderr.height = table.height - 96;
						}

					}


					entity.trigger('relayout');

				}, this);

			}

		},

		serialize: function() {

			var data = _State.prototype.serialize.call(this);
			data['constructor'] = 'app.state.Console';


			return data;

		},

		enter: function(oncomplete, data) {

			this.queryLayer('ui', 'console > status').setVisible(true);


			var client = this.client;
			if (client !== null) {

				var service = client.getService('console');
				if (service !== null) {
					service.bind('sync', _on_sync, this);
					service.sync();
				}

			}


			_State.prototype.enter.call(this, oncomplete, data);

		},

		leave: function(oncomplete) {

			var client = this.client;
			if (client !== null) {

				var service = client.getService('console');
				if (service !== null) {
					service.unbind('sync', _on_sync, this);
				}

			}


			_State.prototype.leave.call(this, oncomplete);

		}

	};


	return Class;

});
