
lychee.specify('lychee.Definition').exports((lychee, sandbox) => {

	const _Definition = lychee.import('lychee.Definition');
	const _Config     = lychee.import('Config');
	const _Font       = lychee.import('Font');
	const _Music      = lychee.import('Music');
	const _Sound      = lychee.import('Sound');
	const _Texture    = lychee.import('Texture');
	const _Stuff      = lychee.import('Stuff');



	/*
	 * TESTS
	 */

	sandbox.setStates({
		id:  'sandbox.foo.bar.Qux',
		url: '/tmp/sandbox/source/foo/bar/Qux.js'
	});

	sandbox.setBlob({
		exports: 'function(lychee, global, attachments) {\n\n\tconst Module = {};\n\n\treturn Module;\n\n}',
		includes: [
			'sandbox.foo.Bar',
			'sandbox.foo.Qux'
		],
		requires: [
			'sandbox.foo.Doo'
		],
		tags: {
			foo: 'bar',
			bar: 'qux'
		}
	});

	sandbox.setProperty('id', function(assert, expect) {

		let id    = 'sandbox.foo.Bar';
		let check = 'not.Allowed$';


		assert(this.id, sandbox.states.id);

		assert(this.setId(id), true);
		assert(this.id,        id);

		assert(this.setId(check), false);
		assert(this.id,           id);

		assert(this.setId(sandbox.states.id), true);
		assert(this.id, sandbox.states.id);

	});

	sandbox.setProperty('url', function(assert, expect) {

		let url = '/tmp/sandbox/source/foo/Bar.js';

		assert(this.url, '/tmp/sandbox/source/foo/bar/Qux.js');

		assert(this.setUrl(url), true);
		assert(this.url,         url);

		assert(this.setId(''), false);
		assert(this.id,        'sandbox.foo.bar.Qux');

	});

	sandbox.setMethod('attaches', function(assert, expect) {

		let config = new _Config();


		assert(this._attaches.json instanceof _Config, false);
		assert(this._attaches.json === config,         false);

		this.attaches({
			json: config
		});

		assert(this._attaches.json, config);


		expect(assert => {

			this._includes = [];
			this._requires = [];

			this.exports(function(lychee, global, attachments) {
				assert(attachments['json'], config);
				return {};
			});

			expect(assert => {

				let scope  = {};
				let result = this.export(scope);

				this.deserialize({
					includes: sandbox.blob.includes,
					requires: sandbox.blob.requires,
					exports:  sandbox.blob.exports
				});

				assert(result, true);

			});

		});

	});

	sandbox.setMethod('check', function(assert, expect) {

		assert(this._tags, sandbox.blob.tags);


		let check1 = this.check({ foo: 'bar' });
		let check2 = this.check({ bar: [ 'qux', 'doo' ] });
		let check3 = this.check({ foo: 'qux' });
		let check4 = this.check({ bar: [ 'doo', 'foo' ] });

		assert(check1.tagged,    true);
		assert(check1.supported, true);

		assert(check2.tagged,    true);
		assert(check2.supported, true);

		assert(check3.tagged,    false);
		assert(check3.supported, true);

		assert(check4.tagged,    false);
		assert(check4.supported, true);

	});

	sandbox.setMethod('export', function(assert, expect) {

		assert(this.id, sandbox.states.id);


		expect(assert => {

			this._includes = [];
			this._requires = [];

			this.exports(function(lychee, global, attachments) {
				return { id: 'unique' };
			});

			expect(assert => {

				let scope  = {};
				let result = this.export(scope);

				assert(result, true);
				assert(scope['sandbox']['foo']['bar']['Qux'].id, 'unique');

			});

			this.deserialize({
				includes: sandbox.blob.includes,
				requires: sandbox.blob.requires,
				exports:  sandbox.blob.exports
			});

		});

	});

	sandbox.setMethod('exports', function(assert, expect) {

		assert(this.id, sandbox.states.id);


		expect(assert => {

			this._includes = [];
			this._requires = [];

			this.exports(function(lychee, global, attachments) {
				return { id: 'unique' };
			});

			expect(assert => {

				let scope  = {};
				let result = this.export(scope);

				assert(result, true);
				assert(scope['sandbox']['foo']['bar']['Qux'].id, 'unique');

			});

			this.deserialize({
				includes: sandbox.blob.includes,
				requires: sandbox.blob.requires,
				exports:  sandbox.blob.exports
			});

		});

	});

	sandbox.setMethod('includes', function(assert, expect) {

		assert(this._includes,        sandbox.blob.includes);
		assert(this._includes.length, sandbox.blob.includes.length);

		this.includes([
			'sandbox.foo.Bar'
		]);

		assert(this._includes.length, sandbox.blob.includes.length);

		this.includes([
			'sandbox.foo.Foo'
		]);

		assert(this._includes.length, sandbox.blob.includes.length + 1);

	});

	sandbox.setMethod('requires', function(assert, expect) {

		assert(this._requires,        sandbox.blob.requires);
		assert(this._requires.length, sandbox.blob.requires.length);

		this.requires([
			'sandbox.foo.Doo'
		]);

		assert(this._requires.length, sandbox.blob.requires.length);

		this.requires([
			'sandbox.foo.Foo'
		]);

		assert(this._requires.length, sandbox.blob.requires.length + 1);

	});

	sandbox.setMethod('supports', function(assert, expect) {

		assert(this._supports, null);

		this.supports(function(lychee, global) {
			return true;
		});

		let check1 = this.check({});
		assert(check1.supported, true);


		this.supports(function(lychee, global) {
			return false;
		});

		let check2 = this.check({});
		assert(check2.supported, false);

	});

	sandbox.setMethod('tags', function(assert, expect) {

		assert(this._tags, sandbox.blob.tags);

		this.tags({ qux: 'doo' });
		assert(this._tags.qux, 'doo');

	});

});

