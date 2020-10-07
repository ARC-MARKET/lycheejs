
# Environments

The [lychee.Environment](/libraries/crux/source/Environment.js)
allows a cross-platform way to initialize an Environment
and/or a Sandbox that allows traces of dependencies at
execution time.

It also integrates [Feature Prediction](./feature-prediction.md)
mechanisms when the `type` is set to `export` or `source`.


## Basic Concept

The `lychee.Environment` instances are available via the
public `lychee.ENVIRONMENTS` constant that uses the Environment's
`id` property combined with its Project's or Library's path
as an identifier. An example is `/libraries/lychee/custom`
or `/libraries/lychee/main` and `/libraries/lychee/dist`.

Each Project or Library can have an unlimited amount of
Environments. Typically when an Environment is built and
distributed, these contain usually a single Environment
with the type `build` or `export`.

## Serialization

All Environment instances are serializable, deserializable
and reproducible across all platforms, which means an
Environment running on `html-webview` can also be cloned
and reproduced on a `node` platform. The output of a simple
`environment.serialize()` call can be transferred as JSON.

## Environment Types

The `source` type is an Environment that is built from the
source files (located in the `/source` folder of a Project
or Library) and allows to actively work on its Definitions
without having to execute any kind of build pipeline.

```javascript
// Source-Type Environment
let environment = new lychee.Environment({
	packages: {
		app:    './lychee.pkg',
		lychee: '/libraries/lychee/lychee.pkg'
	},
	sandbox: false,
	tags: {
		platform: [ 'html' ]
	},
	target:  'app.Main',
	type:    'source',
	variant: 'application'
});

environment.init(sandbox => {

	sandbox.MAIN = new sandbox.app.Main({
		hoo: 'ray'
	});
	sandbox.MAIN.init();

});
```

The `export` type is an Environment similar to the `source`
type, but essentially ignores dependencies that can not run
in the current runtime. It caches and determines required
features for the Environment to run on future platforms
for the specified `target` and matched `tags`.

```javascript
// Export-Type Environment
let environment = new lychee.Environment({
	packages: {
		app:    './lychee.pkg',
		lychee: '/libraries/lychee/lychee.pkg'
	},
	sandbox: false,
	tags: {
		platform: [ 'node-sdl' ] // cross-export, eh?
	},
	target:  'app.Main',
	type:    'export',
	variant: 'application'
});

environment.init(sandbox => {

	// Environment is ready for export
	let data = environment.serialize();

	FILESYTEM.write('snapshot.json', JSON.stringify(data, null, '\t'));

});
```

The `build` type is an Environment snapshot and is defined
in a single file (located in the `/build` folder of a Project
or Library) and allows quick deserialization of everything
the Environment needs, including all [Assets](./lycheejs-crux.md).

As these snapshots typically are really big (multiple MB in
size) it can also include advanced Timeline or Event Graph
data when being serialized on any peer-side. They are also
used for live-in-memory updates when the [lychee.js Harvester](../software/lycheejs-harvester.md)
publishes updates to connected client-side Applications.

```javascript
// Build-Type Environment (node.js example)
const lychee = require(_ROOT + '/libraries/crux/build/node/dist.js')(__dirname);
require(_ROOT + '/libraries/lychee/build/node/dist/index.js');


let environment = lychee.ENVIRONMENTS['/libraries/lychee/dist'];
if (environment.type === 'build') {

	lychee.init(environment, {
		profile: {
			hoo: 'ray'
		}
	});

}
```

## Fertilizers

The cross-compilation toolchain in the lychee.js Engine uses
the serialized form of an Environment in order to bundle it
with external runtimes as binaries. This is done by the
[lychee.js Fertilizer](../software/lycheejs-fertilizer.md)
and its runtimes.

Every Environment can be serialized anywhere at any time, so
no matter what Software Bot runs in which runtime, it can
always reproduce a serialized Environment snapshot in an
identical manner. As UI events, NET events and their timeline
are also completely serializable, the [Simulation](./simulations.md)
can reproduce exactly what happened in an Application.

Every Project or Library can be built both as a `library` or
`application` variant which are defined in the `lychee.pkg`
file. This allows the creation of A/B forks where onle a
single [Definition](./definitions.md) is replaced. This is
done by the [lychee.js Breeder](../software/lycheejs-breeder.md).

## Active Environments

The default Environment (accessible via `lychee.environment`)
is used as a target to export [Definitions](./definitions.md).

The `lychee.define()` method in each [Definition](./definitions.md)'s
Implementation automatically dispatches itself to the `environment.define(definition)`
method. This allows multiple definitions with the same identifier
for multiple sandboxed Environment instances for multiple
(currently supported or unsupported) platforms.

The usage of multiple Environments in parallel is possible
while setting the `sandbox` property to `true`. This ensures
that the `global` scope is not polluted.

```javascript
// Setup Default Environment
console.log(lychee.environment === null);
lychee.init(null);
console.log(lychee.environment instanceof lychee.Environment);

// lychee.define() to create Definition
lychee.define('foo.Bar').exports((lychee, global, attachments) => {
	const Module = {};
	return Module;
});

// Automatically dispatched to lychee.environment instance
let definition = lychee.environment.definitions['foo.Bar'] || null;
if (definition !== null) {
	console.log(definition);
}
```

