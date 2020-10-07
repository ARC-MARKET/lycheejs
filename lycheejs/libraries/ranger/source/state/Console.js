
lychee.define('ranger.state.Console').requires([
	'ranger.ui.entity.Console',
	'lychee.ui.entity.Label',
	'lychee.ui.layer.Table'
]).includes([
	'lychee.ui.State'
]).exports((lychee, global, attachments) => {

	const _State  = lychee.import('lychee.ui.State');
	const _BLOB   = attachments['json'].buffer;



	/*
	 * HELPERS
	 */

	const _on_sync = function(data) {

		let blob = data.blob || null;
		if (blob !== null) {

			let stdout = this.query('ui > console > stdout');
			if (stdout !== null) {
				stdout.setValue(blob.stdout || '');
			}

			let stderr = this.query('ui > console > stderr');
			if (stderr !== null) {
				stderr.setValue(blob.stderr || '');
			}


			let blueprint = this.query('ui > console');
			if (blueprint !== null) {
				blueprint.trigger('relayout');
			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(main) {

		_State.call(this, main);


		this.deserialize(_BLOB);

	};


	Composite.prototype = {

		/*
		 * STATE API
		 */

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			let viewport = this.viewport;
			if (viewport !== null) {

				let blueprint = this.query('ui > console');
				let stdout    = this.query('ui > console > stdout');
				let stderr    = this.query('ui > console > stderr');

				if (blueprint !== null) {

					blueprint.bind('#relayout', blueprint => {

						if (stdout !== null) {
							stdout.width      = blueprint.width;
							stdout.height     = blueprint.height / 2;
							stdout.position.y = -1 / 2 * stdout.height;
							stdout.trigger('relayout');
						}

						if (stderr !== null) {
							stderr.width      = blueprint.width;
							stderr.height     = blueprint.height / 2;
							stderr.position.y = 1 / 2 * stderr.height;
							stderr.trigger('relayout');
						}

					}, this);

				}

			}

		},

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'ranger.state.Console';


			return data;

		},

		enter: function(oncomplete, data) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;
			data       = typeof data === 'string'       ? data       : null;


			let client = this.client;
			if (client !== null) {

				let service = client.getService('console');
				if (service !== null) {
					service.bind('sync', _on_sync, this);
					service.sync();
				}

			}


			return _State.prototype.enter.call(this, oncomplete, data);

		},

		leave: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			let client = this.client;
			if (client !== null) {

				let service = client.getService('console');
				if (service !== null) {
					service.unbind('sync', _on_sync, this);
				}

			}


			return _State.prototype.leave.call(this, oncomplete);

		}

	};


	return Composite;

});
