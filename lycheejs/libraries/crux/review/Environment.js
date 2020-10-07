
lychee.specify('lychee.Environment').exports((lychee, sandbox) => {

	const _ENVIRONMENT = lychee.environment;
	const _Definition  = lychee.import('lychee.Definition');
	const _Package     = lychee.import('lychee.Package');



	/*
	 * TESTS
	 */

	sandbox.setStates({
		id:       'lychee-Environment-sandbox',
		debug:    true,
		sandbox:  true,
		packages: {
			lychee: new _Package({
				id:  'lychee',
				url: '/libraries/lychee/lychee.pkg'
			})
		},
		tags: {
			awesome:  [ 'level', '9001' ],
			platform: [ 'node' ]
		},
		target:  'app.Main',
		timeout: 13337,
		type:    'source'
	});

	sandbox.setProperty('id', function(assert, expect) {

		let id = 'sandboxed-environment';


		assert(this.id, sandbox.states.id);

		assert(this.setId(id), true);
		assert(this.id,        id);

	});

	sandbox.setProperty('debug', function(assert, expect) {

		let debug = false;

		assert(this.debug, sandbox.states.debug);

		assert(this.setDebug(debug), true);
		assert(this.debug,           debug);

	});

	sandbox.setProperty('packages', function(assert, expect) {

		let pkg = new _Package({
			lychee: '/libraries/lychee/lychee.pkg'
		});


		assert(this.packages.lychee, sandbox.states.packages.lychee);

		assert(this.setPackages({
			lychee: pkg
		}), true);
		assert(this.packages.lychee, pkg);

	});

	sandbox.setProperty('sandbox', function(assert, expect) {

		assert(this.sandbox, sandbox.states.sandbox);

		assert(this.global.displayName, '_Sandbox');

	});

	sandbox.setProperty('tags', function(assert, expect) {

		assert(this.tags.platform, sandbox.states.tags.platform);
		assert(this.tags.awesome,  sandbox.states.tags.awesome);

		assert(this.setTags({
			not: [ 'allowed', 123 ]
		}), true);
		assert(this.tags.not, [ 'allowed ' ]);

		assert(this.setTags({
			not: 'allowed'
		}), true);
		assert(this.tags.not, undefined);

	});

	sandbox.setProperty('target', function(assert, expect) {

		assert(this.target, sandbox.states.target);

		assert(this.setTarget('not.Allowed'), false);
		assert(this.setTarget('not'),         false);

		assert(this.setTarget('lychee.app.Main'), true);

	});

	sandbox.setProperty('timeout', function(assert, expect) {

		assert(this.timeout, sandbox.states.timeout);

		assert(this.setTimeout(13.37), true);
		assert(this.timeout,           13);

		assert(this.setTimeout(13337), true);
		assert(this.timeout,           13337);

	});

	sandbox.setProperty('type', function(assert, expect) {

		assert(this.type, sandbox.states.type);
		assert(this.setType('build'), true);

		assert(this.setType('not-allowed'), false);
		assert(this.type, 'build');

		assert(this.setType('export'), true);
		assert(this.type, 'export');

		assert(this.setType('source'), true);
		assert(this.type, 'source');

	});

	sandbox.setMethod('load', function(assert, expect) {

		assert(this.setTags({
			platform: [ 'node' ]
		}), true);

		assert(this.setSandbox(true), true);
		assert(this.sandbox, true);

		assert(this.setTimeout(10000), true);
		assert(this.timeout, 10000);

		assert(this.setType('source'), true);
		assert(this.type, 'source');

		assert(this.setPackages(sandbox.states.packages), true);
		assert(this.load('lychee.app.Main'), true);


		expect(assert => {

			setTimeout(_ => {
				assert(lychee.environment.definitions['lychee.app.Main'] instanceof _Definition, true);
			}, 5000);

		});

	});

	sandbox.setMethod('define', function(assert, expect) {

		let definition = new _Definition({
			id:  'sandbox.foo.Bar',
			url: '/tmp/sandbox/foo/Bar.js'
		});

		assert(this.define(definition, true), true);
		assert(this.definitions[definition.id] === definition, true);

	});

	sandbox.setMethod('init', function(assert, expect) {

		assert(this.setDebug(true),               true);
		assert(this.setSandbox(false),            true);
		assert(this.setTimeout(10000),            true);
		assert(this.setType('source'),            true);
		assert(this.setTarget('lychee.app.Main'), true);

		assert(lychee.setEnvironment(this), true);

		expect(assert => {

			assert(this.load('lychee.app.Main'), true);

			expect(assert => {

				this.init(function(isolate) {

					assert(isolate !== null,                    true);
					assert(isolate.lychee instanceof Object,    true);
					assert(lychee.setEnvironment(_ENVIRONMENT), true);

				});

			});

		});

	});

	sandbox.setMethod('resolve', function(assert, expect) {

		assert(this.resolve('./what/ever/Foo.js'),    lychee.ROOT.project + '/what/ever/Foo.js');
		assert(this.resolve('/what/ever/Foo.js'),     lychee.ROOT.lychee  + '/what/ever/Foo.js');
		assert(this.resolve('./what/ever/../Foo.js'), lychee.ROOT.project + '/what/Foo.js');
		assert(this.resolve('/what/ever/../Foo.js'),  lychee.ROOT.lychee  + '/what/Foo.js');

	});

});

