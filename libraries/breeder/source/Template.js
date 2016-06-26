
lychee.define('breeder.Template').requires([
	'lychee.Stash'
]).includes([
	'lychee.event.Flow'
]).exports(function(lychee, global, attachments) {

	var _Flow  = lychee.import('lychee.event.Flow');
	var _Stash = lychee.import('lychee.Stash');
	var _ASSET = '/libraries/breeder/asset';
	var _STASH = new _Stash({
		type: _Stash.TYPE.persistent
	});



	/*
	 * HELPERS
	 */

	var _inject = function(buffer, injections) {

		var chunk    = '';
		var code     = buffer.split('\n');
		var c        = 0;
		var cl       = code.length;
		var found    = { include: false, inject: false };
		var index    = { include: -1,    inject: -1    };
		var tmp      = '';
		var tmp_s    = '';
		var tmp_c    = '';
		var tmp_i    = '';
		var tpl_s    = '';
		var tpl_c    = '';
		var tpl_i    = '';


		for (c = 0; c < cl; c++) {

			chunk = code[c].trim();

			if (chunk.substr(0, 7) === '<script') {

				tpl_s = '\t<script src="/libraries/';
				tpl_c = '\t<script src="${injection}"></script>';
				tpl_i = '\t\tlychee.inject(lychee.ENVIRONMENTS[\'${identifier}\']);';

				injections = injections.filter(function(injection) {
					return injection.split('/')[4] === 'html';
				});

				break;

			} else if (chunk.substr(0, 8) === 'require(') {

				tpl_s = 'require(_root + \'/libraries/';
				tpl_c = 'require(_root + \'${injection}\');';
				tpl_i = '\tlychee.inject(lychee.ENVIRONMENTS[\'${identifier}\']);';

				injections = injections.filter(function(injection) {
					return injection.split('/')[4] === 'node';
				});

				break;

			}

		}


		for (var i = 0, il = injections.length; i < il; i++) {

			var injection  = injections[i];
			var identifier = injection.split('/').slice(0, 3).join('/') + '/' + injection.split('/')[5];


			tmp_c = tpl_c.replaceObject({
				injection: injection
			});

			tmp_i = tpl_i.replaceObject({
				identifier: identifier
			});

			tmp_s = tpl_s;


			for (c = 0; c < cl; c++) {

				chunk = code[c].trim();
				tmp   = tmp_s.trim();


				if (chunk.substr(0, tmp.length) === tmp) {
					index.include = c;
				}

				if (chunk === tmp_c.trim()) {
					found.include = true;
				}

			}

			if (found.include === false && index.include >= 0) {
				code.splice(index.include + 1, 0, tmp_c);
				cl++;
			}


			for (c = 0; c < cl; c++) {

				chunk = code[c].trim();


				if (chunk.substr(0, 14) === 'lychee.inject(') {
					index.inject = c;
				} else if (chunk.substr(0, 15) === 'lychee.envinit(' && index.inject === -1) {
					index.inject = c - 1;
				} else if (chunk.substr(0, 15) === 'lychee.pkginit(' && index.inject === -1) {
					index.inject = c - 1;
				}

				if (chunk === tmp_i.trim()) {
					found.inject = true;
				}

			}


			if (found.inject === false && index.inject >= 0) {
				code.splice(index.inject + 1, 0, tmp_i);
				cl++;
			}

		}


		return code.join('\n');

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = Object.assign({}, data);


		this.sandbox  = '';
		this.settings = {};
		this.stash    = new _Stash({
			type: _Stash.TYPE.persistent
		});


		this.__injections = [];
		this.__main       = [];


		this.setSandbox(settings.sandbox);
		this.setSettings(settings.settings);


		_Flow.call(this);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('init', function(oncomplete) {

			var sandbox = this.sandbox;
			var stash   = this.stash;

			if (sandbox !== '' && stash !== null) {

				console.log('breeder: INIT');


				_STASH.bind('batch', function(type, assets) {

					var pkg  = assets.find(function(asset) {
						return asset.url === _ASSET + '/lychee.pkg';
					}) || null;
					var urls = assets.map(function(asset) {
						return sandbox + asset.url.substr(_ASSET.length);
					});


					if (pkg !== null) {

						var tmp = JSON.stringify(pkg.buffer, null, '\t');

						tmp = tmp.replaceObject({
							id: sandbox
						});

						pkg.buffer = JSON.parse(tmp);

					}


					stash.bind('batch', function(action, woop) {

						if (action === 'write') {
							oncomplete(true);
						}

					}, this, true);

					stash.batch('write', urls, assets);

				}, this, true);

				_STASH.batch('read', [

					_ASSET + '/harvester.js',
					_ASSET + '/icon.png',
					_ASSET + '/index.html',
					_ASSET + '/lychee.pkg',

					_ASSET + '/source/Main.js',
					_ASSET + '/source/net/Client.js',
					_ASSET + '/source/net/Server.js',
					_ASSET + '/source/net/client/Ping.js',
					_ASSET + '/source/net/remote/Ping.js',
					_ASSET + '/source/state/Welcome.js',
					_ASSET + '/source/state/Welcome.json'

				]);

			} else {

				oncomplete(false);

			}

		}, this);


		this.bind('pull', function(oncomplete) {

			var library = this.settings.library;
			var stash   = this.stash;


			if (library !== null && stash !== null) {

				console.log('breeder: PULL ' + library);


				var sandbox = this.sandbox;


				_STASH.bind('batch', function(type, assets) {

					var main = assets.filter(function(asset) {
						return asset.url.match(/index\.html|harvester\.js/g) !== null;
					});
					var pkg  = assets.find(function(asset) {
						return asset.url.match(/lychee\.pkg/g) !== null;
					}) || null;


					if (main.length > 0 && pkg !== null) {

						var platforms = [];

						Object.values(pkg.buffer.build.environments).forEach(function(environment) {

							var tags = environment.tags || null;
							if (tags instanceof Object) {

								if (tags.platform instanceof Array) {

									tags.platform.forEach(function(val) {

										if (platforms.indexOf(val) === -1) {
											platforms.push(val);
										}

									});

								}

							}

						});


						if (platforms.length > 0) {

							var injections = platforms.sort().map(function(platform) {
								return library + '/build/' + platform + '/dist/index.js';
							});
							var tmp_stash  = new _Stash({
								type: _Stash.TYPE.temporary
							});


							tmp_stash.bind('batch', function(type, assets) {

								for (var a = 0, al = assets.length; a < al; a++) {

									var asset = assets[a];
									if (asset.buffer !== null && asset.buffer !== '') {
										stash.write('.' + asset.url, asset);
									}

								}

							});

							tmp_stash.batch('read', injections);

						}


						setTimeout(function() {

							this.__main       = main;
							this.__injections = injections;

							this.trigger('pull-inject', [function(result) {
								oncomplete(result);
							}]);

						}.bind(this), 500);

					} else {

						oncomplete(false);

					}

				}, this, true);


				_STASH.batch('read', [
					sandbox + '/harvester.js',
					sandbox + '/index.html',
					sandbox + '/lychee.pkg'
				]);

			} else {

				oncomplete(false);

			}

		});


		this.bind('pull-inject', function(oncomplete) {

			var injections = this.__injections;
			var main       = this.__main;
			var stash      = this.stash;


			if (injections.length > 0 && main.length > 0 && stash !== null) {

				for (var m = 0, ml = main.length; m < ml; m++) {

					var tmp = main[m];
					if (tmp.buffer !== null) {

						console.log('breeder: PULL-INJECT ' + tmp.url);


						tmp.buffer = _inject(tmp.buffer, injections);

						stash.write(tmp.url, tmp);

					}

				}


				setTimeout(function() {
					oncomplete(true);
				}, 500);

			} else {

				oncomplete(true);

			}

		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			var stash = lychee.deserialize(blob.stash);
			if (stash !== null) {
				this.stash = stash;
			}

		},

		serialize: function() {

			var data = _Flow.prototype.serialize.call(this);
			data['constructor'] = 'breeder.Template';


			var settings = data['arguments'][0] || {};
			var blob     = data['blob'] || {};


			if (this.sandbox !== '') settings.sandbox = this.sandbox;


			if (this.stash !== null) blob.stash = lychee.serialize(this.stash);


			data['arguments'][0] = settings;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setSandbox: function(sandbox) {

			sandbox = typeof sandbox === 'string' ? sandbox : null;


			if (sandbox !== null) {

				this.sandbox = sandbox;


				return true;

			}


			return false;

		},

		setSettings: function(settings) {

			settings = settings instanceof Object ? settings : null;


			if (settings !== null) {

				this.settings = settings;

				return true;

			}


			return false;

		}

	};


	return Class;

});

