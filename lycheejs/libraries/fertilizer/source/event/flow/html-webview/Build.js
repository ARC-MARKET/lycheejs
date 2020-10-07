
lychee.define('fertilizer.event.flow.html-webview.Build').includes([
	'fertilizer.event.Flow'
]).exports((lychee, global, attachments) => {

	const _Flow  = lychee.import('fertilizer.event.Flow');
	const _INDEX = {
		application: attachments['index.html'],
		library:     attachments['index.js']
	};
	const _META  = {
		application: attachments['index.appcache'],
		library:     attachments['package.json']
	};



	/*
	 * HELPERS
	 */

	const _build_index = function(variant, stuff) {

		stuff = stuff instanceof Stuff ? stuff : null;


		if (stuff !== null) {

			let code = stuff.buffer.toString('utf8');
			if (code.includes('${blob}') === false) {
				code = _INDEX[variant].buffer.toString('utf8');
			}


			let env = this.__environment;
			if (env !== null) {

				let lines = code.split('\n');

				let blob      = JSON.stringify(env.serialize(), null, '\t');
				let blob_line = lines.find(line => line.includes('${blob}')) || null;
				if (blob_line !== null) {

					let indent = blob_line.substr(0, blob_line.indexOf(blob_line.trim()));
					if (indent !== '') {
						blob = blob.split('\n').map((line, l) => {
							return l === 0 ? line : indent + line;
						}).join('\n');
					}

				}

				let profile      = JSON.stringify(this.__profile, null, '\t');
				let profile_line = lines.find(line => line.includes('{$profile}')) || null;
				if (profile_line !== null) {

					let indent = profile_line.substr(0, profile_line.indexOf(profile_line.trim()));
					if (indent !== '') {
						profile = profile.split('\n').map((line, l) => {
							return l === 0 ? line : indent + line;
						}).join('\n');
					}

				}

				stuff.buffer = Buffer.from(code.replaceObject({
					id:      env.id,
					blob:    blob,
					profile: profile
				}), 'utf8');

			}

		}

	};

	const _build_meta = function(variant, asset) {

		if (variant === 'application') {

			// XXX: Nothing to do

		} else if (variant === 'library') {

			let buffer = asset.buffer;
			if (buffer instanceof Object) {

				let env = this.__environment;
				if (env !== null) {

					asset.buffer = JSON.parse(JSON.stringify(buffer).replaceObject({
						id: env.id
					}));

				}

			}

		}

	};

	const _create_index = function(variant) {

		let template = null;
		if (variant === 'application') {
			template = lychee.serialize(_INDEX.application);
		} else if (variant === 'library') {
			template = lychee.serialize(_INDEX.library);
		}

		if (template !== null) {

			let asset = lychee.deserialize(template);
			if (asset !== null) {

				let base = asset.url.split('/').pop();
				let name = base.split('.').slice(1).join('.');

				asset.url = './' + name;

			}

			return asset;

		}


		return null;

	};

	const _create_meta = function(variant) {

		let template = null;
		if (variant === 'application') {
			template = lychee.serialize(_META.application);
		} else if (variant === 'library') {
			template = lychee.serialize(_META.library);
		}

		if (template !== null) {

			let asset = lychee.deserialize(template);
			if (asset !== null) {

				let base = asset.url.split('/').pop();
				let name = base.split('.').slice(1).join('.');

				asset.url = './' + name;

			}

			return asset;

		}


		return null;

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

		this.unbind('build-assets');

		this.bind('build-assets', function(oncomplete) {

			let action  = this.action;
			let project = this.project;

			if (action !== null && project !== null) {

				console.log('fertilizer: ' + action + '/BUILD-ASSETS "' + project + '"');


				let env = this.__environment;
				if (env !== null) {

					let base_index = '*';
					let base_meta  = '*';

					let variant = env.variant;
					if (variant === 'application') {

						base_index = 'index.html';
						base_meta  = 'index.appcache';

					} else if (variant === 'library') {

						base_index = 'index.js';
						base_meta  = 'package.json';

					}


					let meta = this.assets.find(asset => asset.url.endsWith('/' + base_meta)) || null;
					if (meta === null || meta.buffer === null) {
						meta = _create_meta.call(this, variant);
						_build_meta.call(this, variant, meta);
						this.assets.push(meta);
					} else {
						_build_meta.call(this, variant, meta);
					}

					let index = this.assets.find(asset => asset.url.endsWith('/' + base_index)) || null;
					if (index === null || index.buffer === null) {
						index = _create_index.call(this, variant);
						_build_index.call(this, variant, index);
						this.assets.push(index);
					} else {
						_build_index.call(this, variant, index);
					}


					oncomplete(true);

				} else {
					oncomplete(false);
				}


			} else {
				oncomplete(true);
			}

		}, this);



		/*
		 * FLOW
		 */

		// this.then('configure-project');

		this.then('read-package');
		this.then('read-assets');
		this.then('read-assets-crux');

		this.then('build-environment');
		this.then('build-assets');
		this.then('write-assets');
		this.then('build-project');

		// this.then('package-runtime');
		// this.then('package-project');

		// this.then('publish-project');

	};


	Composite.prototype = {

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Flow.prototype.serialize.call(this);
			data['constructor'] = 'fertilizer.event.flow.html-webview.Build';


			return data;

		}


	};


	return Composite;

});

