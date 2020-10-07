
lychee.define('lychee.ui.element.Network').requires([
	'lychee.ui.entity.Input',
	'lychee.ui.entity.Select'
]).includes([
	'lychee.ui.Element'
]).exports((lychee, global, attachments) => {

	const _Element = lychee.import('lychee.ui.Element');
	const _Input   = lychee.import('lychee.ui.entity.Input');
	const _Select  = lychee.import('lychee.ui.entity.Select');



	/*
	 * HELPERS
	 */

	const _API_ORIGIN = (function(location) {

		let tmp   = (location.origin || '').split(':');
		let proto = tmp[0] || '';

		if (/app|file|chrome-extension/g.test(proto)) {

			return 'http://harvester.artificial.engineering:4848';

		} else if (/http|https/g.test(proto)) {

			let port = parseInt(tmp[tmp.length - 1], 10);
			if (!isNaN(port)) {
				return tmp.slice(0, tmp.length - 1).join(':') + ':4848';
			} else {
				return tmp.join(':');
			}

		} else {
			return '';
		}

	})(global.location || {});

	const _load_api = function(url, callback, scope) {

		url = typeof url === 'string' ? url : '/api/server/connect?identifier=/projects/boilerplate';


		let config = new Config(_API_ORIGIN + url);

		config.onload = function(result) {
			callback.call(scope, result === true ? this.buffer : null);
		};

		config.load();

	};

	const _read = function() {

		let main = global.MAIN || null;
		if (main !== null) {

			let client = main.defaults.client;
			let server = main.defaults.server;


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

	const _save = function() {

		let main = global.MAIN || null;
		if (main !== null) {

			let client = main.client || null;
			let server = main.server || null;


			let mode = this.getEntity('mode').value;
			if (mode === 'dynamic') {

				if (client !== null) {

					_load_api(this.getEntity('API').value, settings => {

						if (settings !== null) {
							client.disconnect();
							client.setHost(settings.host);
							client.setPort(settings.port);
							client.connect();
						}

					}, this);

				}


				if (server !== null) {

					_load_api(this.getEntity('API').value, settings => {

						if (settings !== null) {
							server.disconnect();
							server.setHost(settings.host);
							server.setPort(settings.port);
							server.connect();
						}

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

	const Composite = function(data) {

		let states = Object.assign({}, data);


		states.label    = 'Network';
		states.options  = [ 'Save' ];
		states.relayout = true;


		_Element.call(this, states);



		/*
		 * INITIALIZATION
		 */

		this.setEntity('mode', new _Select({
			options: [ 'dynamic', 'static' ],
			value:   'dynamic'
		}));

		this.setEntity('host', new _Input({
			type:    _Input.TYPE.text,
			min:     1,
			max:     1024,
			value:   'localhost',
			visible: false
		}));

		this.setEntity('port', new _Input({
			type:    _Input.TYPE.number,
			min:     1024,
			max:     65534,
			value:   1337,
			visible: false
		}));

		this.setEntity('API', new _Input({
			type:  _Input.TYPE.text,
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

		states = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Element.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.element.Network';


			return data;

		}

	};


	return Composite;

});

