
lychee.define('lychee.ui.element.Network').requires([
	'lychee.ui.entity.Input',
	'lychee.ui.entity.Select'
]).includes([
	'lychee.ui.Element'
]).exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _api_origin = '';

	(function(location) {

		var origin = location.origin || '';
		var proto  = origin.split(':')[0];

		if (proto.match(/app|file/g)) {

			_api_origin = 'http://harvester.artificial.engineering:4848';

		} else if (proto.match(/http|https/g)) {

			_api_origin = location.origin;

		}

	})(global.location || {});


	var _load_api = function(url, callback, scope) {

		url = typeof url === 'string' ? url : '/api/server/connect?identifier=/projects/boilerplate';


		var config = new Config(_api_origin + url);

		config.onload = function(result) {
			callback.call(scope, result === true ? this.buffer : null);
		};

		config.load();

	};

	var _read = function() {

		var main = global.MAIN || null;
		if (main !== null) {

			var client = main.defaults.client;
			var server = main.defaults.server;


			if (typeof client === 'string') {

				this.getEntity('API').setValue(client);
				this.getEntity('mode').setValue('dynamic');

			} else if (client instanceof Object) {

				this.getEntity('host').setValue(client.host);
				this.getEntity('port').setValue(client.port);
				this.getEntity('mode').setValue('static');

			}


			if (typeof server === 'string') {

				this.getEntity('API').setValue(server);
				this.getEntity('mode').setValue('dynamic');

			} else if (server instanceof Object) {

				this.getEntity('host').setValue(server.host);
				this.getEntity('port').setValue(server.port);
				this.getEntity('mode').setValue('static');

			}

		}

	};

	var _save = function() {

		var main = global.MAIN || null;
		if (main !== null) {

			var client = main.client || null;
			var server = main.server || null;


			var mode = this.getEntity('mode').value;
			if (mode === 'dynamic') {

				if (client !== null) {

					_load_api(this.getEntity('API').value, function(settings) {

						client.disconnect();
						client.setHost(settings.host);
						client.setPort(settings.port);
						client.connect();

					}, this);

				}


				if (server !== null) {

					_load_api(this.getEntity('API').value, function(settings) {

						server.disconnect();
						server.setHost(settings.host);
						server.setPort(settings.port);
						server.connect();

					}, this);

				}

			} else if (mode === 'static') {


				if (client !== null) {

					client.disconnect();
					client.setHost(this.getEntity('host').value);
					client.setPort(this.getEntity('port').value);
					client.connect();

				}


				if (server !== null) {

					server.disconnect();
					server.setHost(this.getEntity('host').value);
					server.setPort(this.getEntity('port').value);
					server.connect();

				}

			}

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		settings.label   = 'Network';
		settings.options = [ 'Save' ];


		lychee.ui.Element.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.setEntity('mode', new lychee.ui.entity.Select({
			options: [ 'dynamic', 'static' ],
			value:   'dynamic'
		}));

		this.setEntity('host', new lychee.ui.entity.Input({
			type:    lychee.ui.entity.Input.TYPE.text,
			min:     1,
			max:     1024,
			value:   'localhost',
			visible: false
		}));

		this.setEntity('port', new lychee.ui.entity.Input({
			type:    lychee.ui.entity.Input.TYPE.number,
			min:     1024,
			max:     65534,
			value:   1337,
			visible: false
		}));

		this.setEntity('API', new lychee.ui.entity.Input({
			type:  lychee.ui.entity.Input.TYPE.text,
			value: '/api/server/connect?identifier=/projects/boilerplate'
		}));

		this.getEntity('mode').bind('change', function(value) {

			if (value === 'dynamic') {

				this.getEntity('host').visible = false;
				this.getEntity('port').visible = false;
				this.getEntity('API').visible  = true;

			} else if (value === 'static') {

				this.getEntity('host').visible = true;
				this.getEntity('port').visible = true;
				this.getEntity('API').visible  = false;

			}


			this.trigger('relayout');

		}, this);

		this.bind('change', function(action) {

			if (action === 'save') {
				_save.call(this);
			}

		}, this);


		_read.call(this);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.Element.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.element.Network';


			return data;

		}

	};


	return Class;

});

