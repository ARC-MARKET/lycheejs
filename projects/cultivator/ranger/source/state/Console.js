
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


			var blueprint = this.queryLayer('ui', 'console');
			if (blueprint !== null) {
				blueprint.trigger('relayout');
			}

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


				entity = this.queryLayer('ui', 'console');
				entity.bind('#relayout', function(blueprint) {

					var element = this.queryLayer('ui', 'console > status');
					if (element !== null) {

						element.width  = blueprint.width - 64;
						element.height = blueprint.height;

						var entity = element.getEntity('0');
						if (entity !== null) {

							entity.width  = element.width  - 32;
							entity.height = element.height - 96;

							var left  = entity.getEntity('0');
							var right = entity.getEntity('1');
							if (left !== null && right !== null) {

								left.width   = entity.width / 2 - 4;
								left.height  = entity.height - 96;
								left.trigger('relayout');

								right.width  = entity.width / 2 - 4;
								right.height = entity.height - 96;
								right.trigger('relayout');

							}

							entity.trigger('relayout');

						}

						element.trigger('relayout');

					}

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
