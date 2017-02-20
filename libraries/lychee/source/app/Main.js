
lychee.define('lychee.app.Main').requires([
	'lychee.Input',
	'lychee.Renderer',
	'lychee.Stash',
	'lychee.Storage',
	'lychee.Viewport',
	'lychee.event.Flow',
	'lychee.app.Jukebox',
	'lychee.app.Loop',
	'lychee.app.State',
	'lychee.net.Client',
	'lychee.net.Server'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	const _Client   = lychee.import('lychee.net.Client');
	const _Emitter  = lychee.import('lychee.event.Emitter');
	const _Flow     = lychee.import('lychee.event.Flow');
	const _Input    = lychee.import('lychee.Input');
	const _Jukebox  = lychee.import('lychee.app.Jukebox');
	const _Loop     = lychee.import('lychee.app.Loop');
	const _Renderer = lychee.import('lychee.Renderer');
	const _Server   = lychee.import('lychee.net.Server');
	const _Stash    = lychee.import('lychee.Stash');
	const _State    = lychee.import('lychee.app.State');
	const _Storage  = lychee.import('lychee.Storage');
	const _Viewport = lychee.import('lychee.Viewport');



	/*
	 * HELPERS
	 */

	const _API_ORIGIN = (function(location) {

		let hostname = location.hostname || '';
		let origin   = location.origin   || '';
		let proto    = origin.split(':')[0];

		if (/app|file|chrome-extension/g.test(proto)) {

			return 'http://harvester.artificial.engineering:4848';

		} else if (hostname === 'localhost') {

			return 'http://localhost:4848';

		} else if (/http|https/g.test(proto)) {

			return 'http://' + hostname + ':4848';

		} else {

			return '';

		}

	})(global.location || {});

	const _load_api = function(url, callback, scope) {

		url = typeof url === 'string' ? url : '/api/server/connect?identifier=boilerplate';


		if (/^http(s)\:\/\//g.test(url) === false) {
			url = _API_ORIGIN + url;
		}


		let config = new Config(url);

		config.onload = function(result) {
			callback.call(scope, result === true ? this.buffer : null);
		};

		config.load();

	};

	const _initialize = function() {

		let settings = this.settings;

		if (settings.client !== null) {
			this.client = new _Client(settings.client);
			this.client.connect();
		}

		if (settings.server !== null) {
			this.server = new _Server(settings.server);
			this.server.connect();
		}

		if (settings.input !== null) {
			this.input = new _Input(settings.input);
		}

		if (settings.jukebox !== null) {
			this.jukebox = new _Jukebox(settings.jukebox);
		}

		if (settings.loop !== null) {

			this.loop = new _Loop(settings.loop);
			this.loop.bind('render', _on_render, this);
			this.loop.bind('update', _on_update, this);

		}

		if (settings.renderer !== null) {
			this.renderer = new _Renderer(settings.renderer);
		}

		if (settings.stash !== null) {

			this.stash = new _Stash(settings.stash);
			this.stash.bind('sync', function(data) {

				let client = this.client;
				if (client !== null) {

					let service = client.getService('stash');
					if (service !== null) {
						service.sync(data);
					}

				}

				let server = this.server;
				if (server !== null) {

					let service = server.getService('stash');
					if (service !== null) {
						service.sync(data);
					}

				}

			}, this);

		}

		if (settings.storage !== null) {

			this.storage = new _Storage(settings.storage);
			this.storage.bind('sync', function(data) {

				let client = this.client;
				if (client !== null) {

					let service = client.getService('storage');
					if (service !== null) {
						service.sync(data);
					}

				}

				let server = this.server;
				if (server !== null) {

					let service = server.getService('storage');
					if (service !== null) {
						service.sync(data);
					}

				}

			}, this);

		}

		if (settings.viewport !== null) {

			this.viewport = new _Viewport();
			this.viewport.bind('reshape', _on_reshape, this);
			this.viewport.bind('hide',    _on_hide,    this);
			this.viewport.bind('show',    _on_show,    this);

			this.viewport.setFullscreen(settings.viewport.fullscreen);

		}

	};

	const _on_hide = function() {

		let loop = this.loop;
		if (loop !== null) {
			loop.pause();
		}

	};

	const _on_render = function(clock, delta) {

		if (this.state !== null) {
			this.state.render(clock, delta);
		}

	};

	const _on_reshape = function(orientation, rotation, width, height) {

		let renderer = this.renderer;
		if (renderer !== null) {

			let settings = this.settings;
			if (settings.renderer !== null) {
				renderer.setWidth(settings.renderer.width);
				renderer.setHeight(settings.renderer.height);
			}

		}

	};

	const _on_show = function() {

		let loop = this.loop;
		if (loop !== null) {
			loop.resume();
		}

	};

	const _on_update = function(clock, delta) {

		if (this.state !== null) {
			this.state.update(clock, delta);
		}

	};



	/*
	 * DEFAULT SETTINGS
	 * and SERIALIZATION CACHE
	 */

	let _DEFAULTS = {

		client: null,
		server: null,

		input: {
			delay:       0,
			key:         true,
			keymodifier: false,
			scroll:      true,
			swipe:       true,
			touch:       true
		},

		jukebox: {
			channels: 8,
			music:    true,
			sound:    true
		},

		loop: {
			render: 60,
			update: 60
		},

		renderer: {
			width:      null,
			height:     null,
			id:         'app',
			background: '#405050'
		},

		stash: {
			id:   'app',
			type: _Stash.TYPE.persistent
		},

		storage: {
			id:    'app',
			model: {},
			type:  _Storage.TYPE.persistent
		},

		viewport: {
			fullscreen: false
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(settings) {

		this.settings = lychee.assignunlink({}, _DEFAULTS, settings);
		this.defaults = lychee.assignunlink({}, this.settings);

		this.client   = null;
		this.server   = null;

		this.input    = null;
		this.jukebox  = null;
		this.loop     = null;
		this.renderer = null;
		this.stash    = null;
		this.storage  = null;
		this.viewport = null;

		this.state    = null;
		this.__states = {};


		_Emitter.call(this);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.client instanceof Object)   this.client   = lychee.deserialize(blob.client);
			if (blob.server instanceof Object)   this.server   = lychee.deserialize(blob.server);

			if (blob.input instanceof Object)    this.input    = lychee.deserialize(blob.input);
			if (blob.jukebox instanceof Object)  this.jukebox  = lychee.deserialize(blob.jukebox);
			if (blob.loop instanceof Object)     this.loop     = lychee.deserialize(blob.loop);
			if (blob.renderer instanceof Object) this.renderer = lychee.deserialize(blob.renderer);
			if (blob.stash instanceof Object)    this.stash    = lychee.deserialize(blob.stash);
			if (blob.storage instanceof Object)  this.storage  = lychee.deserialize(blob.storage);
			if (blob.viewport instanceof Object) this.viewport = lychee.deserialize(blob.viewport);


			if (blob.states instanceof Object) {

				for (let id in blob.states) {

					let stateblob = blob.states[id];

					for (let a = 0, al = stateblob.arguments.length; a < al; a++) {
						if (stateblob.arguments[a] === '#MAIN') {
							stateblob.arguments[a] = this;
						}
					}

					this.setState(id, lychee.deserialize(stateblob));

				}

			}

		},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.app.Main';

			let settings = lychee.assignunlink({}, this.settings);
			let blob     = data['blob'] || {};


			if (this.client !== null)   blob.client   = lychee.serialize(this.client);
			if (this.server !== null)   blob.server   = lychee.serialize(this.server);

			if (this.input !== null)    blob.input    = lychee.serialize(this.input);
			if (this.jukebox !== null)  blob.jukebox  = lychee.serialize(this.jukebox);
			if (this.loop !== null)     blob.loop     = lychee.serialize(this.loop);
			if (this.renderer !== null) blob.renderer = lychee.serialize(this.renderer);
			if (this.stash !== null)    blob.stash    = lychee.serialize(this.stash);
			if (this.storage !== null)  blob.storage  = lychee.serialize(this.storage);
			if (this.viewport !== null) blob.viewport = lychee.serialize(this.viewport);


			if (Object.keys(this.__states).length > 0) {

				blob.states = {};

				for (let id in this.__states) {
					blob.states[id] = lychee.serialize(this.__states[id]);
				}

			}


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * MAIN API
		 */

		init: function() {

			let flow       = new _Flow();
			let client_api = this.settings.client;
			let server_api = this.settings.server;


			flow.then('load-api');
			flow.then('load');
			flow.then('init');


			flow.bind('load-api', function(oncomplete) {

				let c = typeof client_api === 'string';
				let s = typeof server_api === 'string';


				if (c === true && s === true) {

					_load_api(client_api, function(settings) {

						this.settings.client = Object.assign({}, settings);

						_load_api(server_api, function(settings) {
							this.settings.server = Object.assign({}, settings);
							oncomplete(true);
						}, this);

					}, this);

				} else if (c === true) {

					_load_api(client_api, function(settings) {
						this.settings.client = Object.assign({}, settings);
						oncomplete(true);
					}, this);

				} else if (s === true) {

					_load_api(server_api, function(settings) {
						this.settings.server = Object.assign({}, settings);
						oncomplete(true);
					}, this);

				} else {

					oncomplete(true);

				}

			}, this);

			flow.bind('load', function(oncomplete) {

				let result = this.trigger('load', [ oncomplete ]);
				if (result === false) {
					oncomplete(true);
				}

			}, this);

			flow.bind('init', function(oncomplete) {

				_initialize.call(this);
				oncomplete(true);

			}, this);

			flow.bind('complete', function() {
				this.trigger('init');
			}, this);

			flow.bind('error', function() {
				_initialize.call(this);
			}, this);

			flow.init();

		},

		destroy: function() {

			if (this.client !== null) {
				this.client.disconnect();
				this.client = null;
			}

			if (this.server !== null) {
				this.server.disconnect();
				this.server = null;
			}

			if (this.input !== null) {
				this.input.destroy();
				this.input = null;
			}

			if (this.jukebox !== null) {
				this.jukebox = null;
			}

			if (this.loop !== null) {
				this.loop.destroy();
				this.loop = null;
			}

			if (this.renderer !== null) {
				this.renderer.destroy();
				this.renderer = null;
			}

			if (this.stash !== null) {
				this.stash = null;
			}

			if (this.storage !== null) {
				this.storage = null;
			}

			if (this.viewport !== null) {
				this.viewport.destroy();
				this.viewport = null;
			}

		},



		/*
		 * CUSTOM API
		 */

		setState: function(id, state) {

			id = typeof id === 'string' ? id : null;


			if (lychee.interfaceof(_State, state)) {

				if (id !== null) {

					this.__states[id] = state;

					return true;

				}

			}


			return false;

		},

		getState: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null && this.__states[id] !== undefined) {
				return this.__states[id];
			}


			return null;

		},

		removeState: function(id) {

			id = typeof id === 'string' ? id : null;


			if (id !== null && this.__states[id] !== undefined) {

				delete this.__states[id];

				if (this.state === this.__states[id]) {
					this.changeState(null);
				}

				return true;

			}


			return false;

		},

		changeState: function(id, data) {

			id   = typeof id === 'string' ? id   : null;
			data = data !== undefined     ? data : null;


			let that     = this;
			let oldstate = this.state;
			let newstate = this.__states[id] || null;


			if (newstate !== null) {

				if (oldstate !== null) {

					oldstate.leave(function(result) {
						newstate.enter(function(result) {
							that.state = newstate;
						}, data);
					});

				} else {

					newstate.enter(function(result) {
						that.state = newstate;
					}, data);

				}


				return true;

			} else {

				if (oldstate !== null) {

					oldstate.leave(function(result) {
						that.state = null;
					});

				}


				if (id === null) {
					return true;
				}

			}


			return false;

		}

	};


	return Composite;

});

