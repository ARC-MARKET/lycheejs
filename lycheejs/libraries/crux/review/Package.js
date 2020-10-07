
lychee.specify('lychee.Package').exports((lychee, sandbox) => {

	const _Config      = lychee.import('Config');
	const _Environment = lychee.import('lychee.Environment');



	/*
	 * TESTS
	 */

	sandbox.setStates({
		id:   'lychee',
		url:  '/libraries/lychee/lychee.pkg',
		type: 'source'
	});

	sandbox.setProperty('config', function(assert, expect) {

		assert(this.config instanceof _Config, true);
		assert(this.config.buffer instanceof Object, true);
		assert(this.config.url, sandbox.states.url);

	});

	sandbox.setProperty('environment', function(assert, expect) {

		assert(this.environment, null);

	});

	sandbox.setProperty('id', function(assert, expect) {

		let id1 = 'invalid-id';
		let id2 = 'valid';


		assert(this.id, sandbox.states.id);

		assert(this.setId(id1), false);
		assert(this.id, sandbox.states.id);

		assert(this.setId(id2), true);
		assert(this.id, id2);

		assert(this.setId(sandbox.states.id), true);
		assert(this.id, sandbox.states.id);

	});

	sandbox.setProperty('url', function(assert, expect) {

		let url1 = 'invalid-url';
		let url2 = '/libraries/valid/lychee.pkg';


		assert(this.url, sandbox.states.url);

		assert(this.setUrl(url1), false);
		assert(this.url, sandbox.states.url);

		assert(this.setUrl(url2), true);
		assert(this.url, url2);
		assert(this.root, '/libraries/valid');

		assert(this.setUrl(sandbox.states.url), true);
		assert(this.url, sandbox.states.url);

	});

	sandbox.setProperty('type', function(assert, expect) {

		assert(this.type, sandbox.states.type);

		assert(this.setType('build'), true);
		assert(this.type, 'build');

		assert(this.setType('review'), true);
		assert(this.type, 'review');

		assert(this.setType('source'), true);
		assert(this.type, 'source');

		assert(this.setType('invalid'), false);
		assert(this.type, 'source');

	});

	sandbox.setMethod('getDefinitions', function(assert, expect) {

		let definitions = this.getDefinitions();

		assert(definitions instanceof Array, true);

		assert(definitions.includes('Input'), true);
		assert(definitions.includes('Renderer'), true);
		assert(definitions.includes('Stash'), true);
		assert(definitions.includes('Storage'), true);
		assert(definitions.includes('Viewport'), true);
		assert(definitions.includes('net.Client'), true);
		assert(definitions.includes('net.Remote'), true);
		assert(definitions.includes('net.Server'), true);

	});

	sandbox.setMethod('getFiles', function(assert, expect) {

		let files = this.getFiles();

		assert(files instanceof Array, true);

		assert(files.includes('platform/html/Input.js'), true);
		assert(files.includes('platform/html/Renderer.js'), true);
		assert(files.includes('platform/html/Stash.js'), true);
		assert(files.includes('platform/html/Storage.js'), true);
		assert(files.includes('platform/html/Viewport.js'), true);
		assert(files.includes('platform/html/net/Client.js'), true);
		assert(files.includes('platform/html/net/Remote.js'), true);
		assert(files.includes('platform/html/net/Server.js'), true);

	});

	sandbox.setMethod('load', function(assert, expect) {

		assert(this.load('Renderer'), false);
		assert(this.load('Renderer', { platform: [ 'html' ] }), true);

		assert(this.load('app.Main'), true);
		assert(this.load('net.remote.Debugger'), true);

		assert(this.load('DoesNotExist'), false);
		assert(this.load('does.not.Exist'), false);

	});

	sandbox.setMethod('resolve', function(assert, expect) {

		assert(this.resolve('Renderer'), []);
		assert(this.resolve('Renderer', { platform: [ 'html' ] }), [ 'platform/html/Renderer' ]);
		assert(this.resolve('Renderer', { platform: [ 'node' ] }), [ 'platform/node/Renderer' ]);
		assert(this.resolve('Renderer', { platform: [ 'html', 'node' ] }), [ 'platform/html/Renderer', 'platform/node/Renderer' ]);

		assert(this.resolve('app.Main'), [ 'app/Main' ]);
		assert(this.resolve('net.remote.Debugger'), [ 'net/remote/Debugger' ]);

	});

});

