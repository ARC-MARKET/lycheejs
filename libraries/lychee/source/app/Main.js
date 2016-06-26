
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

	/*
	 * HELPERS
	 */

	var _api_origin = '';

	(function(location) {

		var hostname = location.hostname || '';
		var origin   = location.origin   || '';
		var proto    = origin.split(':')[0];

		if (proto.match(/app|file/g)) {

			_api_origin = 'http://harvester.artificial.engineering:4848';

		} else if (hostname === 'localhost') {

			_api_origin = 'http://localhost:4848';

		} else if (proto.match(/http|https/g)) {

			_api_origin = location.origin + ':4848';

		}

	})(global.location || {});


	var _load_api = function(url, callback, scope) {

		url = typeof url === 'string' ? url : '/api/server/connect?identifier=boilerplate';


		if (/^http(s)\:\/\//g.test(url) === false) {
			url = _api_origin + url;
		}


		var config = new Config(url);

		config.onload = function(result) {
			callback.call(scope, result === true ? this.buffer : null);
		};

		config.load();

	};

	var _initialize = function() {

		var settings = this.settings;

		if (settings.client !== null) {
			this.client = new lychee.net.Client(settings.client);
			this.client.connect();
		}

		if (settings.server !== null) {
			this.server = new lychee.net.Server(settings.server);
			this.server.connect();
		}

		if (settings.input !== null) {
			this.input = new lychee.Input(settings.input);
		}

		if (settings.jukebox !== null) {
			this.jukebox = new lychee.app.Jukebox(settings.jukebox);
		}

		if (settings.loop !== null) {

			this.loop = new lychee.app.Loop(settings.loop);
			this.loop.bind('render', _on_render, this);
			this.loop.bind('update', _on_update, this);

		}

		if (settings.renderer !== null) {
			this.renderer = new lychee.Renderer(settings.renderer);
		}

		if (settings.stash !== null) {

			this.stash = new lychee.Stash(settings.stash);
			this.stash.bind('sync', function(data) {

				var client = this.client;
				if (client !== null) {

					var service = client.getService('stash');
					if (service !== null) {
						service.sync(data);
					}

				}

				var server = this.server;
				if (server !== null) {

					var service = server.getService('stash');
					if (service !== null) {
						service.sync(data);
					}

				}

			}, this);

		}

		if (settings.storage !== null) {

			this.storage = new lychee.Storage(settings.storage);
			this.storage.bind('sync', function(data) {

				var client = this.client;
				if (client !== null) {

					var service = client.getService('storage');
					if (service !== null) {
						service.sync(data);
					}

				}

				var server = this.server;
				if (server !== null) {

					var service = server.getService('storage');
					if (service !== null) {
						service.sync(data);
					}

				}

			}, this);

		}

		if (settings.viewport !== null) {

			this.viewport = new lychee.Viewport();
			this.viewport.bind('reshape', _on_reshape, this);
			this.viewport.bind('hide',    _on_hide,    this);
			this.viewport.bind('show',    _on_show,    this);

			this.viewport.setFullscreen(settings.viewport.fullscreen);

		}

	};

	var _on_hide = function() {

		var loop = this.loop;
		if (loop !== null) {
			loop.pause();
		}

	};

	var _on_render = function(clock, delta) {

		if (this.state !== null) {
			this.state.render(clock, delta);
		}

	};

	var _on_reshape = function(orientation, rotation, width, height) {

		var renderer = this.renderer;
		if (renderer !== null) {

			var settings = this.settings;
			if (settings.renderer !== null) {
				renderer.setWidth(settings.renderer.width);
				renderer.setHeight(settings.renderer.height);
			}

		}

	};

	var _on_show = function() {

		var loop = this.loop;
		if (loop !== null) {
			loop.resume();
		}

	};

	var _on_update = function(clock, delta) {

		if (this.state !== null) {
			this.state.update(clock, delta);
		}

	};



	/*
	 * DEFAULT SETTINGS
	 * and SERIALIZATION CACHE
	 */

	var _defaults = {

		client: null,
		server: null,

		input: {
			delay:       0,
			key:         true,
			keymodifier: false,
			touch:       true,
			swipe:       true
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
			type: lychee.Stash.TYPE.persistent
		},

		storage: {
			id:    'app',
			model: {},
			type:  lychee.Storage.TYPE.persistent
		},

		viewport: {
			fullscreen: false
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(settings) {

		this.settings = lychee.assignunlink({}, _defaults, settings);
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


		lychee.event.Emitter.call(this);

	};


	Class.prototype = {

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

				for (var id in blob.states) {

					var stateblob = blob.states[id];

					for (var a = 0, al = stateblob.arguments.length; a < al; a++) {
						if (stateblob.arguments[a] === '#MAIN') {
							stateblob.arguments[a] = this;
						}
					}

					this.setState(id, lychee.deserialize(stateblob));

				}

			}

		},

		serialize: function() {

			var data = lychee.event.Emitter.prototype.serialize.call(this);
			data['constructor'] = 'lychee.app.Main';

			var settings = lychee.assignunlink({}, this.settings);
			var blob     = data['blob'] || {};


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

				for (var id in this.__states) {
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

			var flow       = new lychee.event.Flow();
			var client_api = this.settings.client;
			var server_api = this.settings.server;


			flow.then('load-api');
			flow.then('load');
			flow.then('init');


			flow.bind('load-api', function(oncomplete) {

				var c = typeof client_api === 'string';
				var s = typeof server_api === 'string';


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

				var result = this.trigger('load', [ oncomplete ]);
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


			if (lychee.interfaceof(lychee.app.State, state)) {

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


			var that     = this;
			var oldstate = this.state;
			var newstate = this.__states[id] || null;


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

			} else {

				if (oldstate !== null) {

					oldstate.leave(function(result) {
						that.state = null;
					});

				}

			}


			return true;

		}

	};


	return Class;

});

