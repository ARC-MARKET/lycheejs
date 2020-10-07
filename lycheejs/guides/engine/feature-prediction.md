
# Feature Prediction

The [Feature Detection](./feature-detection.md) concept
allows to define the required featureset for each Definition,
given the idea that the same Definition exists via multiple
Implementations among several `tags` with the same `key`,
but a different `value`.

As by default only the `platform` tag is respected by the
[lychee.js Fertilizer](../software/lycheejs-fertilizer.md),
the following examples will explain how to setup a new
`platform` from scratch and how to integrate it with the
existing lychee.js Engine stack.

The list of supported platforms is explained in the [README](/README.md)
and the [lychee.js Crux](./lycheejs-crux.md) chapter.

## lychee.FEATURES

Each `platform` requires a mockup of the `global` scope in
order to let the [lychee.js Fertilizer](../software/lycheejs-fertilizer.md)
know what features to expect and what features to isolate
for a new `sandbox` in the [Environments](./environments.md)
and [Simulations](./simulations.md).

```javascript
let features = lychee.FEATURES['html-nwjs'] || null;
if (features !== null) {
	// Mockup of the global scope required
	// for the html-nwjs platform build
	console.log(features);
}
```

These mockups are always used when the `target` platform
does not match the current runtime. So, for example, when
the [lychee.js Fertilizer](../software/lycheejs-fertilizer.md)
that runs in `node` is exporting an Environment that runs
on the `html` platform.

The Feature Prediction is activated only when the `sandbox`
of the Environment is set to `true`. Otherwise the `global`
scope of the current runtime is used.

## Implementing support for an unknown platform

The huge advantage is that all lychee.js Projects or Libraries
can build themselves (which is essentially what the [/bin/configure.sh](/bin/configure.sh)
script does) without any external already-bootstrapped compiler.

Remember: Every [Environment](./environments.md) can be a `sandbox`
and can be an `export` type - and as every Definition can run
anywhere, there's no limit where the code of the Implementation
can actually be re-used.

## html-electron Example

If a new `platform` or runtime is unsupported in the upstream
lychee.js Engine stack, the `lychee.FEATURES[platform]` object
can be modified in order to tell the [Environment](./environments.md)
what `global` features are expected to exist in order to support
this platform.

```javascript
lychee.pkg('build', 'html-electron/main', (environment, profile) => {

	// html-electron automatically inherits from html

	lychee.FEATURES['html-electron'] = {
		location: {
			hash: '#example-hash'
		},
		onhashchange: function(event) {}
	};


	lychee.init(environment, {
		debug:   false,
		sandbox: true,
		profile: profile
	});

});
```

Again, remember, above code is not platform-specific for the
`html` platform and would work perfectly fine inside a `node`
runtime. The Sandboxes and Feature Detection together allow
to create [Environments](./environments.md) and [Simulations](./simulations.md)
wherever possible.

