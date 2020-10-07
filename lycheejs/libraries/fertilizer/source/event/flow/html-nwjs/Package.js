
lychee.define('fertilizer.event.flow.html-nwjs.Package').requires([
	'fertilizer.data.Shell',
	'lychee.event.Queue'
]).includes([
	'fertilizer.event.Flow'
]).exports((lychee, global, attachments) => {

	const _Flow   = lychee.import('fertilizer.event.Flow');
	const _Queue  = lychee.import('lychee.event.Queue');
	const _Shell  = lychee.import('fertilizer.data.Shell');
	const _ASSETS = {
		linux: [
			'icudtl.dat',
			'natives_blob.bin',
			'nw',
			'nw_100_percent.pak',
			'nw_200_percent.pak',
			'resources.pak',
			'v8_context_snapshot.bin',
			'lib/libffmpeg.so',
			'lib/libnode.so',
			'lib/libnw.so',
			'locales/en-US.pak',
			'swiftshader/libEGL.so',
			'swiftshader/libGLESv2.so'
		],
		macos: [
		],
		windows: [
			'd3dcompiler_47.dll',
			'ffmpeg.dll',
			'icudtl.dat',
			'libEGL.dll',
			'libGLESv2.dll',
			'natives_blob.bin',
			'node.dll',
			'nw_100_percent.pak',
			'nw_200_percent.pak',
			'nw.dll',
			'nw_elf.dll',
			'nw.exe',
			'resources.pak',
			'v8_context_snapshot.bin',
			'locales/en-US.pak',
			'swiftshader/libEGL.dll',
			'swiftshader/libGLESv2.dll'
		]
	};


	// XXX: html-nwjs runtime for MacOS contains hundreds of files...
	(function(shell) {

		shell.tree('/bin/runtime/html-nwjs/macos/x86_64', urls => {

			let filtered = urls.filter(url => url.startsWith('./nwjs.app'));
			if (filtered.length > 0) {

				filtered.sort().forEach(url => {
					_ASSETS.macos.push(url.substr(2));
				});

			}

		});

	})(new _Shell());



	/*
	 * HELPERS
	 */

	const _write_binaries = function(urls, binaries, oncomplete) {

		let stash = this.stash;
		if (stash !== null) {
			stash.write(urls, binaries, result => oncomplete(result), this);
		} else {
			oncomplete(false);
		}

	};

	const _package_linux = function(arch, zip, oncomplete) {

		let project = this.project;
		let shell   = this.shell;
		let stash   = this.stash;
		let target  = this.target;

		if (project !== null && shell !== null && stash !== null && target !== null) {

			let prefix1 = project + '/build/' + target + '-linux-' + arch;
			let prefix2 = '/bin/runtime/html-nwjs/linux/' + arch;


			stash.read(_ASSETS.linux.map(file => prefix2 + '/' + file), function(binaries) {

				let runtime = binaries.find(asset => asset.url.endsWith('/nw')) || null;
				if (runtime !== null) {
					runtime.url    = project + '/' + project.split('/').pop();
					runtime.buffer = Buffer.concat([ runtime.buffer, zip.buffer ], runtime.buffer.length + zip.buffer.length);
				}

				let urls = binaries.map(asset => {

					let url = asset.url;
					if (url.startsWith(prefix2)) {
						return prefix1 + url.substr(prefix2.length);
					} else if (url.startsWith('./')) {
						return prefix1 + url.substr(1);
					} else if (url.startsWith(project)) {
						return prefix1 + url.substr(project.length);
					}

					return url;

				});

				setTimeout(_ => _write_binaries.call(this, urls, binaries, oncomplete), 100);

			}, this);

		} else {
			oncomplete(false);
		}

	};

	const _package_macos = function(arch, zip, oncomplete) {

		let project = this.project;
		let shell   = this.shell;
		let stash   = this.stash;
		let target  = this.target;

		if (project !== null && shell !== null && stash !== null && target !== null) {

			let prefix1 = project + '/build/' + target + '-macos-' + arch;
			let prefix2 = '/bin/runtime/html-nwjs/macos/' + arch;

			let app_nw = lychee.deserialize(lychee.serialize(zip));
			if (app_nw !== null) {

				app_nw.url = prefix2 + '/nwjs.app/Contents/Resources/app.nw';


				stash.read(_ASSETS.macos.map(file => prefix2 + '/' + file), function(binaries) {

					binaries = binaries.concat(app_nw);


					let info_plist = binaries.find(asset => asset.url.endsWith('nwjs.app/Contents/Info.plist')) || null;
					if (info_plist !== null) {

						let template = info_plist.buffer.toString('utf8');
						template = template.replace('__NAME__', project.split('/').pop());
						info_plist.buffer = Buffer.from(template, 'utf8');

					}


					let urls = binaries.map(asset => {

						let url = asset.url;
						if (url.startsWith(prefix2)) {
							return prefix1 + url.substr(prefix2.length);
						} else if (url.startsWith('./')) {
							return prefix1 + url.substr(1);
						} else if (url.startsWith(project)) {
							return prefix1 + url.substr(project.length);
						}

						return url;

					}).map(url => {

						if (url.startsWith(prefix1 + '/nwjs.app/')) {
							return prefix1 + '/' + project.split('/').pop() + '.app/' + url.substr(prefix1.length + 10);
						}

						return url;

					});

					setTimeout(_ => _write_binaries.call(this, urls, binaries, oncomplete), 100);

				}, this);

			} else {
				oncomplete(false);
			}

		} else {
			oncomplete(false);
		}

	};

	const _package_windows = function(arch, zip, oncomplete) {

		let project = this.project;
		let shell   = this.shell;
		let stash   = this.stash;
		let target  = this.target;

		if (project !== null && shell !== null && stash !== null && target !== null) {

			let prefix1 = project + '/build/' + target + '-windows-' + arch;
			let prefix2 = '/bin/runtime/html-nwjs/windows/' + arch;


			stash.read(_ASSETS.windows.map(file => prefix2 + '/' + file), function(binaries) {

				let runtime = binaries.find(asset => asset.url.endsWith('/nw.exe')) || null;
				if (runtime !== null) {
					runtime.url    = project + '/' + project.split('/').pop() + '.exe';
					runtime.buffer = Buffer.concat([ runtime.buffer, zip.buffer ], runtime.buffer.length + zip.buffer.length);
				}

				let urls = binaries.map(asset => {

					let url = asset.url;
					if (url.startsWith(prefix2)) {
						return prefix1 + url.substr(prefix2.length);
					} else if (url.startsWith('./')) {
						return prefix1 + url.substr(1);
					} else if (url.startsWith(project)) {
						return prefix1 + url.substr(project.length);
					}

					return url;

				});

				setTimeout(_ => _write_binaries.call(this, urls, binaries, oncomplete), 100);

			}, this);

		} else {
			oncomplete(false);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		_Flow.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.unbind('package-runtime');

		this.bind('package-runtime', function(oncomplete) {

			let action  = this.action;
			let project = this.project;
			let shell   = this.shell;
			let target  = this.target;

			if (action !== null && project !== null && shell !== null && target !== null) {

				console.log('fertilizer: ' + action + '/PACKAGE-RUNTIME "' + project + '"');


				let env = this.__environment;
				if (env !== null && env.variant === 'application') {

					let assets = this.assets.filter(asset => asset !== null && asset.buffer !== null);
					if (assets.length > 0) {

						assets.forEach(asset => {

							if (asset.url.startsWith(project + '/')) {
								asset.url = './' + asset.url.substr(project.length + 1);
							}

						});

						shell.zip(assets, function(zip) {

							if (zip !== null) {

								let queue = new _Queue();

								queue.then({ name: 'Linux x86',      method: _package_linux.bind(this,   'x86',    zip) });
								queue.then({ name: 'Linux x86_64',   method: _package_linux.bind(this,   'x86_64', zip) });
								queue.then({ name: 'MacOS x86_64',   method: _package_macos.bind(this,   'x86_64', zip) });
								queue.then({ name: 'Windows x86',    method: _package_windows.bind(this, 'x86',    zip) });
								queue.then({ name: 'Windows x86_64', method: _package_windows.bind(this, 'x86_64', zip) });

								queue.bind('update', (entry, oncomplete) => {

									console.log('fertilizer: -> "' + entry.name + '"');

									entry.method(result => {

										if (result === true) {
											console.info('fertilizer: -> SUCCESS');
										} else {
											console.warn('fertilizer: -> FAILURE');
										}

										oncomplete(true);

									});

								}, this);

								queue.bind('complete', _ => oncomplete(true), this);
								queue.bind('error',    _ => oncomplete(false), this);
								queue.init();

							} else {
								oncomplete(false);
							}

						}, this);

					}

				} else {
					console.log('fertilizer: -> Skipping "' + target + '".');
					oncomplete(true);
				}

			} else {
				oncomplete(false);
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
		// this.then('build-assets');
		// this.then('write-assets');
		// this.then('build-project');

		this.then('package-runtime');
		this.then('package-project');

		// this.then('publish-project');

	};


	Composite.prototype = {

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Flow.prototype.serialize.call(this);
			data['constructor'] = 'fertilizer.event.flow.html-nwjs.Package';


			return data;

		}

	};


	return Composite;

});

