
lychee.define('app.state.Profile').requires([
	'lychee.codec.JSON',
	'lychee.ui.Blueprint',
	'lychee.ui.Element',
	'lychee.ui.entity.Helper',
	'lychee.ui.entity.Input'
]).includes([
	'lychee.ui.State'
]).exports(function(lychee, global, attachments) {

	var _Helper = lychee.import('lychee.ui.entity.Helper');
	var _State  = lychee.import('lychee.ui.State');
	var _JSON   = lychee.import('lychee.codec.JSON');
	var _BLOB   = attachments["json"].buffer;
	var _CACHE  = {};
	var _helper = new _Helper();



	/*
	 * HELPERS
	 */

	var _on_sync = function(profiles) {

		if (profiles instanceof Array) {

			var layer = this.queryLayer('ui', 'profile');
			var that  = this;


			profiles.forEach(function(profile) {

				_CACHE[profile.identifier] = profile;


				var entity = layer.getEntity(profile.identifier);
				if (entity === null) {
					entity = lychee.deserialize(lychee.serialize(layer.getEntity('development')));
					entity.bind('#change', _on_change, that);
					layer.setEntity(profile.identifier, entity);
				}


				entity.setLabel(profile.identifier);
				entity.getEntity('host').setValue(profile.host);
				entity.getEntity('port').setValue(profile.port);

			});

		}

	};

	var _on_change = function(entity, action) {

		if (action === 'save') {

			var identifier = entity.label;
			var host       = entity.getEntity('host').value;
			var port       = entity.getEntity('port').value;
			var profile    = _CACHE[identifier] || null;
			if (profile !== null) {

				profile = _CACHE[identifier] = {
					identifier: identifier,
					host:       host,
					port:       port
				};


				var data = _JSON.encode(profile);
				if (data !== null) {
					_helper.setValue('profile=' + identifier + '?data=' + data.toString('base64'));
					_helper.trigger('touch');
				}

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


			var entity = this.queryLayer('ui', 'profile > development');
			if (entity !== null) {
				entity.bind('#change', _on_change, this);
			}

		},

		serialize: function() {

			var data = _State.prototype.serialize.call(this);
			data['constructor'] = 'app.state.Profile';


			return data;

		},

		enter: function(oncomplete, data) {

			var client = this.client;
			if (client !== null) {

				var service = client.getService('profile');
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

				var service = client.getService('profile');
				if (service !== null) {
					service.unbind('sync', _on_sync, this);
				}

			}


			_State.prototype.leave.call(this, oncomplete);

		}

	};


	return Class;

});

