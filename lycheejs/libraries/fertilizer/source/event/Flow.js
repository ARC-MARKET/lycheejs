
lychee.define('fertilizer.event.Flow').requires([
	'fertilizer.data.Shell',
	'lychee.Environment',
	'lychee.Package',
	'lychee.Stash'
]).includes([
	'lychee.event.Flow'
]).exports((lychee, global, attachments) => {

	const _lychee      = lychee.import('lychee');
	const _Environment = lychee.import('lychee.Environment');
	const _Flow        = lychee.import('lychee.event.Flow');
	const _Package     = lychee.import('lychee.Package');
	const _Shell       = lychee.import('fertilizer.data.Shell');
	const _Stash       = lychee.import('lychee.Stash');
	const _ENVIRONMENT = lychee.environment;
	const _STASH       = new _Stash({
		type: _Stash.TYPE.persistent
	});
	const _TEXTURE     = _STASH.read([ '/libraries/breeder/asset/init/icon.png' ])[0] || null;



	/*
	 * HELPERS
	 */

	const _create_meta_icon = function() {

		let texture = lychee.deserialize(lychee.serialize(_TEXTURE));
		if (texture !== null) {
			texture.url = './icon.png';
		}

		return texture;

	};

	const _create_meta_manifest = function() {

		let project = this.project;
		if (project !== null) {

			let config  = new Config();
			let date    = new Date();
			let name    = project.split('/').pop();
			let today   = (date.getUTCMonth() + 1) + '/' + date.getUTCDate();
			let version = lychee.VERSION + '/' + today;

			config.url    = './manifest.json';
			config.buffer = {
				background_color: '#405050',
				display:          'standalone',
				name:             name + ' (powered by lychee.js)',
				orientation:      'landscape',
				short_name:       name,
				start_url:        'index.html',
				theme_color:      '#2f3736',
				version:          version,
				icons: [{
					src:   'icon.png',
					sizes: '128x128',
					type:  'image/png'
				}]
			};

			return config;

		}


		return null;

	};

	const _create_meta_package = function() {

		let project = this.project;
		if (project !== null) {

			let config  = new Config();
			let debug   = this.debug;
			let date    = new Date();
			let name    = project.split('/').pop();
			let today   = (date.getUTCMonth() + 1) + '/' + date.getUTCDate();
			let version = lychee.VERSION + '/' + today;

			config.url    = './package.json';
			config.buffer = {
				main:        './index.html',
				name:        name,
				description: name + ' (powered by lychee.js)',
				version:     version,
				webkit: {
					plugin: false
				},
				window: {
					title:    name + ' (powered by lychee.js)',
					icon:     './icon.png',
					toolbar:  debug === true,
					frame:    true,
					width:    640,
					height:   480,
					position: 'center'
				}
			};

			return config;

		}


		return null;

	};

	const _initialize_environment = function(settings, callback) {

		let environment    = new _Environment(settings);
		let pkg_fertilizer = environment.packages['fertilizer'] || null;
		if (pkg_fertilizer !== null) {

			for (let id in _ENVIRONMENT.definitions) {
				environment.define(_ENVIRONMENT.definitions[id]);
			}

		}


		_lychee.debug = false;
		_lychee.setEnvironment(environment);

		environment.init(sandbox => {

			_lychee.setEnvironment(_ENVIRONMENT);
			callback(environment, sandbox);

		});

	};

	const _trace_shell = function(stack) {

		for (let s = 0, sl = stack.length; s < sl; s++) {

			let context = stack[s];
			let code    = context.exit;
			let name    = '...' + context.file.substr(context.path.length);

			if (code === 0) {
				console.info('fertilizer: -> ' + name + ' exited with code "' + code + '":');
			} else if (code === 1) {
				console.error('fertilizer: -> ' + name + ' exited with code "' + code + '":');
			} else {
				console.warn('fertilizer: -> ' + name + ' exited with code "' + code + '":');
			}

			context.stdout.trim().split('\n').forEach(line => {

				let chunk = line.trim();
				if (chunk !== '') {
					console.log('fertilizer: -> (stdout) ' + chunk);
				}

			});

			context.stderr.trim().split('\n').forEach(line => {

				let chunk = line.trim();
				if (chunk !== '') {
					console.error('fertilizer: -> (stderr) ' + chunk);
				}

			});

		}

		console.warn('');

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.assets = [];

		this.action  = null;
		this.debug   = false;
		this.project = null;
		this.target  = null;
		this.shell   = new _Shell();
		this.stash   = new _Stash({
			type: _Stash.TYPE.persistent
		});

		this._autofixed = false;

		this.__environment = null;
		this.__namespace   = null;
		this.__packages    = {};
		this.__profile     = null;


		this.setAction(states.action);
		this.setDebug(states.debug);
		this.setProject(states.project);
		this.setTarget(states.target);


		_Flow.call(this);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('read-package', function(oncomplete) {

			let action  = this.action;
			let project = this.project;

			if (action !== null && project !== null) {

				console.log('fertilizer: ' + action + '/READ-PACKAGE "' + project + '"');


				if (project !== '/libraries/lychee') {

					console.log('fertilizer: -> Mapping /libraries/lychee/lychee.pkg as "lychee"');

					this.__packages['lychee'] = new _Package({
						url:  '/libraries/lychee/lychee.pkg',
						type: 'source'
					});

				}


				let pkg = new _Package({
					url:  project + '/lychee.pkg',
					type: 'source'
				});

				console.log('fertilizer: -> Mapping ' + pkg.url + ' as "' + pkg.id + '"');

				setTimeout(_ => {
					this.__namespace        = pkg.id;
					this.__packages[pkg.id] = pkg;
					oncomplete(true);
				}, 200);

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('read-assets', function(oncomplete) {

			let action  = this.action;
			let project = this.project;
			let stash   = this.stash;

			if (action !== null && project !== null && stash !== null) {

				console.log('fertilizer: ' + action + '/READ-ASSETS "' + project + '"');


				stash.read([
					project + '/icon.png',
					project + '/manifest.json',
					project + '/package.json'
				], function(assets) {

					this.assets = assets.filter(asset => asset.buffer !== null);

					let meta_icon = this.assets.find(asset => asset.url.endsWith('/icon.png')) || null;
					if (meta_icon === null || meta_icon.buffer === null) {
						meta_icon = _create_meta_icon.call(this);
						this.assets.push(meta_icon);
					}

					let meta_manifest = this.assets.find(asset => asset.url.endsWith('/manifest.json')) || null;
					if (meta_manifest === null || meta_manifest.buffer === null) {
						meta_manifest = _create_meta_manifest.call(this);
						this.assets.push(meta_manifest);
					}

					let meta_package = this.assets.find(asset => asset.url.endsWith('/package.json')) || null;
					if (meta_package === null || meta_package.buffer === null) {
						meta_package = _create_meta_package.call(this);
						this.assets.push(meta_package);
					}

					oncomplete(true);

				}, this);

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('read-assets-crux', function(oncomplete) {

			let action  = this.action;
			let project = this.project;
			let stash   = this.stash;
			let target  = this.target;

			if (action !== null && project !== null && stash !== null && target !== null) {

				console.log('fertilizer: ' + action + '/READ-ASSETS-CRUX "' + project + '" "' + target + '"');


				let platform = target.split('/')[0] || null;
				if (platform !== null) {

					stash.read([
						'/libraries/crux/build/' + platform + '/dist.js'
					], function(assets) {

						let asset = assets[0] || null;
						if (asset !== null) {

							asset.url = './crux.js';

							this.assets.push(asset);

							oncomplete(true);

						} else {
							oncomplete(false);
						}

					}, this);

				} else {
					oncomplete(false);
				}

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('configure-project', function(oncomplete) {

			let action  = this.action;
			let debug   = this.debug;
			let project = this.project;
			let shell   = this.shell;
			let target  = this.target;

			if (action !== null && project !== null && shell !== null && target !== null) {

				console.log('fertilizer: ' + action + '/CONFIGURE-PROJECT "' + project + '"');


				let info = shell.info(project + '/bin/configure.sh');
				if (info !== null && info.type === 'file') {

					console.log('fertilizer: -> Executing "' + project + '/bin/configure.sh"');

					shell.exec(project + '/bin/configure.sh "' + target + '"', result => {

						if (result === false) {

							console.warn('fertilizer: -> FAILURE');

							if (debug === true) {
								_trace_shell(shell.trace(1));
							}

							oncomplete(true);

						} else {
							oncomplete(true);
						}

					});

				} else {
					console.log('fertilizer: -> Skipping "' + project + '/bin/configure.sh"');
					oncomplete(true);
				}

			} else {
				oncomplete(true);
			}

		}, this);

		this.bind('build-environment', function(oncomplete) {

			let action  = this.action;
			let project = this.project;
			let target  = this.target;

			if (action !== null && project !== null && target !== null) {

				console.log('fertilizer: ' + action + '/BUILD-ENVIRONMENT "' + project + '"');


				let pkg = this.__packages[this.__namespace] || null;
				if (pkg !== null) {

					pkg.setType('build');

					let platform = target.split('/')[0];
					let defaults = pkg.getEnvironments({
						platform: platform
					}).find(env => env.id === target) || null;

					if (defaults !== null) {

						let settings = _lychee.assignunlink({}, defaults, {
							id:      project + '/' + target.split('/').pop(),
							debug:   false,
							sandbox: true,
							timeout: 10000,
							type:    'export'
						});

						if (settings.packages instanceof Object) {

							for (let pid in settings.packages) {

								let url = settings.packages[pid];
								if (url.startsWith('./')) {
									settings.packages[pid] = project + '/' + url.substr(2);
								}

							}

						}

						if (settings.profile instanceof Object) {
							this.__profile = settings.profile;
							delete settings.profile;
						} else {
							this.__profile = {};
						}


						_initialize_environment(settings, (environment, sandbox) => {

							environment.debug    = defaults.debug;
							environment.packages = {};
							environment.sandbox  = defaults.sandbox;
							environment.type     = 'build';

							this.__environment = environment;


							// XXX: Build failed and was autofixed
							// and will result in MAIN.destroy(2)
							if (sandbox === null) {
								this._autofixed = true;
							}


							if (typeof environment.global.console.serialize === 'function') {

								let blob = environment.global.console.serialize().blob || null;
								if (blob !== null) {

									(blob.stderr || '').trim().split('\n').map(line => {
										return (line.indexOf(':') !== -1 ? line.split(':')[1].trim() : line.trim());
									}).forEach(line => {
										console.warn('fertilizer: ' + line);
									});

								}

							}


							oncomplete(true);

						});

					} else {
						console.warn('fertilizer: -> Invalid Environment Tags at "' + pkg.url + '/build/' + target + '".');
						oncomplete(false);
					}

					pkg.setType('source');

				}

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('build-assets', function(oncomplete) {

			let action = this.action;
			if (action !== null) {

				console.log('fertilizer: ' + this.action + '/BUILD-ASSETS');
				console.log('fertilizer: -> Skipping');

				oncomplete(true);

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('write-assets', function(oncomplete) {

			let action  = this.action;
			let project = this.project;
			let stash   = this.stash;
			let target  = this.target;

			if (action !== null && project !== null && target !== null) {

				console.log('fertilizer: ' + action + '/WRITE-ASSETS "' + project + '"');


				let assets = this.assets;
				if (assets.length > 0) {

					stash.write(assets.map(asset => {

						let url = asset.url;
						if (url.startsWith(project)) {
							return project + '/build/' + target + url.substr(project.length);
						} else if (url.startsWith('./')) {
							return project + '/build/' + target + url.substr(1);
						}

					}), assets, result => oncomplete(true), this);

				} else {
					oncomplete(true);
				}

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('build-project', function(oncomplete) {

			let action  = this.action;
			let debug   = this.debug;
			let project = this.project;
			let shell   = this.shell;
			let target  = this.target;

			if (action !== null && project !== null && shell !== null && target !== null) {

				console.log('fertilizer: ' + action + '/BUILD-PROJECT "' + project + '"');


				let info = shell.info(project + '/bin/build.sh');
				if (info !== null && info.type === 'file') {

					console.log('fertilizer: -> Executing "' + project + '/bin/build.sh"');

					shell.exec(project + '/bin/build.sh "' + target + '"', result => {

						if (result === false) {

							console.warn('fertilizer: -> FAILURE');

							if (debug === true) {
								_trace_shell(shell.trace(1));
							}

							oncomplete(true);

						} else {
							oncomplete(true);
						}

					});

				} else {
					console.log('fertilizer: -> Skipping "' + project + '/bin/build.sh"');
					oncomplete(true);
				}

			} else {
				oncomplete(true);
			}

		}, this);

		this.bind('package-runtime', function(oncomplete) {

			let action  = this.action;
			let debug   = this.debug;
			let project = this.project;
			let shell   = this.shell;
			let target  = this.target;

			if (action !== null && project !== null && shell !== null && target !== null) {

				console.log('fertilizer: ' + action + '/PACKAGE-RUNTIME "' + project + '"');


				let env      = this.__environment;
				let platform = target.split('/').shift();
				let info     = shell.info('/bin/runtime/' + platform + '/package.sh');
				let variant  = env.variant;

				if (info !== null && info.type === 'file' && variant === 'application') {

					console.log('fertilizer: -> Executing "/bin/runtime/' + platform + '/package.sh ' + project + ' ' + target + '"');

					shell.exec('/bin/runtime/' + platform + '/package.sh ' + project + ' ' + target, result => {

						if (result === false) {

							console.error('fertilizer: -> FAILURE');

							if (debug === true) {
								_trace_shell(shell.trace(1));
							}

							oncomplete(false);

						} else {
							oncomplete(true);
						}

					});

				} else {
					console.log('fertilizer: -> Skipping "/bin/runtime/' + platform + '/bin/package.sh"');
					oncomplete(true);
				}

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('package-project', function(oncomplete) {

			let action  = this.action;
			let debug   = this.debug;
			let project = this.project;
			let shell   = this.shell;
			let target  = this.target;

			if (action !== null && project !== null && shell !== null && target !== null) {

				console.log('fertilizer: ' + action + '/PACKAGE-PROJECT "' + project + '"');


				let info = shell.info(project + '/bin/package.sh');
				if (info !== null && info.type === 'file') {

					console.log('fertilizer: -> Executing "' + project + '/bin/package.sh ' + target + '"');

					shell.exec(project + '/bin/package.sh ' + target, result => {

						if (result === false) {

							console.warn('fertilizer: -> FAILURE');

							if (debug === true) {
								_trace_shell(shell.trace(1));
							}

							oncomplete(true);

						} else {
							oncomplete(true);
						}

					});

				} else {
					console.log('fertilizer: -> Skipping "' + project + '/bin/package.sh"');
					oncomplete(true);
				}

			} else {
				oncomplete(true);
			}

		}, this);

		this.bind('publish-project', function(oncomplete) {

			let action  = this.action;
			let debug   = this.debug;
			let project = this.project;
			let shell   = this.shell;
			let target  = this.target;

			if (action !== null && project !== null && shell !== null && target !== null) {

				console.log('fertilizer: ' + action + '/PUBLISH-PROJECT "' + project + '"');


				let info = shell.info(project + '/bin/publish.sh');
				if (info !== null && info.type === 'file') {

					console.log('fertilizer: -> Executing "' + project + '/bin/publish.sh"');

					shell.exec(project + '/bin/publish.sh "' + target + '"', result => {

						if (result === false) {

							console.warn('fertilizer: -> FAILURE');

							if (debug === true) {
								_trace_shell(shell.trace(1));
							}

							oncomplete(true);

						} else {
							oncomplete(true);
						}

					});

				} else {
					console.log('fertilizer: -> Skipping "' + project + '/bin/publish.sh"');
					oncomplete(true);
				}

			} else {
				oncomplete(true);
			}

		}, this);



		/*
		 * FLOW
		 */

		// this.then('configure-project');

		// this.then('read-package');
		// this.then('read-assets');
		// this.then('read-assets-crux');

		// this.then('build-environment');
		// this.then('build-assets'); // XXX: Done by platform-specific flows
		// this.then('write-assets');
		// this.then('build-project');

		// this.then('package-runtime');
		// this.then('package-project');

		// this.then('publish-project');

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Flow.prototype.serialize.call(this);
			data['constructor'] = 'fertilizer.event.Flow';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setAction: function(action) {

			action = typeof action === 'string' ? action : null;


			if (action !== null) {

				this.action = action;

				return true;

			}


			return false;

		},

		setDebug: function(debug) {

			debug = typeof debug === 'boolean' ? debug : null;


			if (debug !== null) {

				this.debug = debug;

				return true;

			}


			return false;

		},

		setProject: function(project) {

			project = typeof project === 'string' ? project : null;


			if (project !== null) {

				this.project = project;

				return true;

			}


			return false;

		},

		setTarget: function(target) {

			target = typeof target === 'string' ? target : null;


			if (target !== null) {

				this.target = target;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

