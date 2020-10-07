
lychee.specify('lychee').exports((lychee, sandbox) => {

	const _Definition    = lychee.import('lychee.Definition');
	const _Environment   = lychee.import('lychee.Environment');
	const _Simulation    = lychee.import('lychee.Simulation');
	const _Specification = lychee.import('lychee.Specification');
	const _JSON          = lychee.import('lychee.codec.JSON');



	/*
	 * TESTS
	 */

	sandbox.setMethod('assignsafe', function(assert, expect) {

		let object1 = { foo: null, bar: 'qux', doo: 1337 };
		let object2 = { foo: null, bar: 'qux', doo: 1337 };
		let object3 = { foo: 'bar', qux: 1337 };
		let object4 = { foo: 'bar', qux: 1337 };
		let object5 = { foo: [ 'bar', 13.37 ] };
		let object6 = { foo: [ 'bar', 13.37 ] };


		assert(this.assignsafe(object1, { foo: {}    }), { foo: {},   bar: 'qux', doo: 1337 });
		assert(this.assignsafe(object2, { foo: 'not' }), { foo: null, bar: 'qux', doo: 1337 });

		assert(this.assignsafe(object3, { foo: 'qux' }), { foo: 'qux', qux: 1337  });
		assert(this.assignsafe(object4, { qux: 13.37 }), { foo: 'bar', qux: 13.37 });

		assert(this.assignsafe(object5, { foo: [ 'qux' ]       }), { foo: [ 'qux', 13.37 ] });
		assert(this.assignsafe(object6, { foo: [ 'qux', 1337 ] }), { foo: [ 'qux', 1337  ] });

	});

	sandbox.setMethod('assignunlink', function(assert, expect) {

		let object1 = { foo: { bar: { qux: 1337  } } };
		let object2 = { foo: { bar: { qux: 'doo' } } };
		let object3 = { foo: { bar: [ 'qux', 13.37 ] } };


		let source1 = { foo: { bar: { qux: 13.37 } } };
		let check1  = this.assignunlink(object1, source1);

		assert(check1.foo     === source1.foo,     false);
		assert(check1.foo.bar === source1.foo.bar, false);

		assert(check1.foo.bar.qux,  13.37);
		assert(source1.foo.bar.qux, 13.37);


		let source2 = { foo: { bar: { qux: 'foo' } } };
		let check2  = this.assignunlink(object2, source2);

		assert(check2.foo     === source2.foo,     false);
		assert(check2.foo.bar === source2.foo.bar, false);

		assert(check2.foo.bar.qux,  'foo');
		assert(source2.foo.bar.qux, 'foo');


		let source3 = { foo: { bar: [ 'foo', 1337 ] } };
		let check3  = this.assignunlink(object3, source3);

		assert(check3.foo     === source3.foo,     false);
		assert(check3.foo.bar === source3.foo.bar, false);

		assert(check3.foo.bar[0],  'foo');
		assert(check3.foo.bar[1],  1337);

		assert(source3.foo.bar[0], 'foo');
		assert(source3.foo.bar[1], 1337);

	});

	sandbox.setMethod('blobof', function(assert, expect) {

		let blob1 = { constructor: 'lychee.Definition', arguments: [ 'sandbox.foo.Bar' ], blob: null };
		let blob2 = { reference: 'lychee.codec.JSON', blob: null };


		assert(this.blobof(_Definition, blob1), true);
		assert(this.blobof(_JSON, blob2), true);

	});

	sandbox.setMethod('diff', function(assert, expect) {

		let object1 = { foo: 'bar', qux: { doo: [ 'foo', 13.37 ] } };
		let object2 = { foo: 'bar', qux: { doo: [ 'foo', 13.37 ] } };
		let object3 = { foo: 'qux', qux: { doo: [ 'foo', 13.37 ] } };
		let object4 = { foo: 'qux', qux: { doo: [ 'foo', 1337  ] } };


		assert(this.diff(object1, object1), false);
		assert(this.diff(object2, object2), false);
		assert(this.diff(object3, object3), false);
		assert(this.diff(object4, object4), false);

		assert(this.diff(object1, object2), false);
		assert(this.diff(object1, object3), true);
		assert(this.diff(object1, object4), true);
		assert(this.diff(object3, object4), true);

	});

	sandbox.setMethod('enumof', function(assert, expect) {

		let Enum = {
			foo: 1,
			bar: 2
		};

		assert(this.enumof(Enum, Enum.foo), true);
		assert(this.enumof(Enum, Enum.bar), true);

		assert(this.enumof(Enum, 'qux'),     false);
		assert(this.enumof(Enum, 3),         false);
		assert(this.enumof(Enum, undefined), false);
		assert(this.enumof(Enum, null),      false);

	});

	sandbox.setMethod('interfaceof', function(assert, expect) {

		let AppLayer    = this.import('lychee.app.Layer');
		let UiLayer     = this.import('lychee.ui.Layer');
		let VerletLayer = this.import('lychee.verlet.Layer');

		let instance1 = new AppLayer();
		let instance2 = new UiLayer();
		let instance3 = new VerletLayer();


		assert(this.interfaceof(AppLayer, instance1), true);
		assert(this.interfaceof(AppLayer, instance2), true);
		assert(this.interfaceof(AppLayer, instance3), true);

		assert(this.interfaceof(UiLayer,  instance1), true);
		assert(this.interfaceof(UiLayer,  instance2), true);
		assert(this.interfaceof(UiLayer,  instance3), true);

		assert(this.interfaceof(VerletLayer, instance1), false);
		assert(this.interfaceof(VerletLayer, instance2), false);
		assert(this.interfaceof(VerletLayer, instance3), true);

	});

	sandbox.setMethod('deserialize', function(assert, expect) {

		let instance = new _Definition({
			id:  'sandbox.foo.Bar',
			url: '/tmp/sandbox/source/foo/Bar.js'
		});

		instance.includes([
			'sandbox.foo.Qux',
			'sandbox.bar.Qux'
		]);


		let blob  = this.serialize(instance);
		let check = this.deserialize(blob);

		assert(check instanceof _Definition, true);
		assert(check.id, 'sandbox.foo.Bar');
		assert(check.url, '/tmp/sandbox/source/foo/Bar.js');
		assert(check._includes, [
			'sandbox.foo.Qux',
			'sandbox.bar.Qux'
		]);

	});

	sandbox.setMethod('serialize', function(assert, expect) {

		let instance = new _Definition({
			id:  'sandbox.foo.Bar',
			url: '/tmp/sandbox/source/foo/Bar.js'
		});

		instance.includes([
			'sandbox.foo.Qux',
			'sandbox.bar.Qux'
		]);


		let blob = this.serialize(instance);

		assert(blob.constructor, 'lychee.Definition');
		assert(blob.arguments instanceof Array, true);
		assert(blob.arguments[0], {
			id: 'sandbox.foo.Bar',
			url: '/tmp/sandbox/source/foo/Bar.js'
		});
		assert(blob.blob.includes, [
			'sandbox.foo.Qux',
			'sandbox.bar.Qux'
		]);

	});

	sandbox.setMethod('assimilate', function(assert, expect) {

		// TODO: Implement lychee.assimilate() tests

	});

	sandbox.setMethod('define', function(assert, expect) {

		let id    = 'sandbox.foo.Bar';
		let def   = this.define(id);
		let env   = this.environment;
		let scope = {};


		assert(def instanceof _Definition, true);
		assert(def.id, id);

		expect(assert => {

			def.exports(function(lychee, global, attachments) {
				assert(env.definitions[id] === def, true);
				return {};
			});

			this.export(id, scope);

		});

	});

	sandbox.setMethod('export', function(assert, expect) {

		let id    = 'sandbox.foo.Bar';
		let def   = this.define(id);
		let env   = this.environment;
		let scope = {};


		assert(def instanceof _Definition, true);
		assert(def.id, id);

		expect(assert => {

			def.exports(function(lychee, global, attachments) {
				assert(env.definitions[id] === def, true);
				return {};
			});

			this.export(id, scope);

		});

	});

	sandbox.setMethod('import', function(assert, expect) {

		let Environment = this.import('lychee.Environment');
		let Main        = this.import('lychee.app.Main');


		assert(Environment !== null, true);
		assert(Main !== null, true);

		assert(Environment.displayName, 'lychee.Environment');
		assert(Main.displayName, 'lychee.app.Main');

	});

	sandbox.setMethod('init', function(assert, expect) {

		// TODO: Implement lychee.init() tests

	});

	sandbox.setMethod('inject', function(assert, expect) {

		// TODO: Implement lychee.inject() tests

	});

	sandbox.setMethod('pkg', function(assert, expect) {

		// TODO: Implement lychee.pkg() tests

	});

	sandbox.setMethod('specify', function(assert, expect) {

		let id    = 'sandbox.foo.Bar';
		let spec  = this.specify(id);
		let sim   = this.simulation;
		let scope = {};


		assert(spec instanceof _Specification, true);
		assert(spec.id, id);

		expect(assert => {

			spec.exports(function(lychee, sandbox) {
				assert(sim.specifications[id] === spec, true);
				return {};
			});

			spec.export(id, scope);

		});

	});

	sandbox.setMethod('setEnvironment', function(assert, expect) {

		let env1 = this.environment;
		let env2 = new _Environment();


		assert(this.environment, env1);
		assert(this.setEnvironment(env2), true);
		assert(this.environment, env2);

		assert(this.setEnvironment(null), false);
		assert(this.environment !== env1, true);
		assert(this.environment !== env2, true);

		assert(this.setEnvironment(env1), true);
		assert(this.environment, env1);

	});

	sandbox.setMethod('setSimulation', function(assert, expect) {

		let sim1 = this.simulation;
		let sim2 = new _Simulation();


		assert(this.simulation, sim1);
		assert(this.setSimulation(sim2), true);
		assert(this.simulation, sim2);

		assert(this.setSimulation(null), false);
		assert(this.simulation !== sim1, true);
		assert(this.simulation !== sim2, true);

		assert(this.setSimulation(sim1), true);
		assert(this.simulation, sim1);

	});

});

