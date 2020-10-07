
# Feature Detection

The [lychee.Definition](./definitions.md) format allows to
integrate Feature Detection into the Implementation's source
code, so that the [lychee.Environment](./environments.md)
automatically traces the requirements and dependencies for
all Definitions in the current (or exported) sandbox.

## Basic Concept

Every Definition is automatically cross-platform and
cross-compileable to other platforms. Every Definition is
therefore automatically loaded and evaluated based on the
current `lychee.environment`'s `states` and `tags`.

Every `lychee.Environment` can be built and simulated in
any runtime. Every Definition is assumed to be isomorphic
by default. If a Definition is not isomorphic, it has to
define its own requirements via the `supports()` and
`tags()` method.

## Definition Tags

Each Definition can have multiple tags, where tags in
combination represent the featureset that the Project
or Library wants to deliver.

By default, the [Environments](./environments.md) are
only respecting the `platform` tag. Therefore the
`platform` tag is a reserved key for the cross-compilation
purpose and integration with the [lychee.js Fertilizer](../software/lycheejs-fertilizer.md).

Tags are able to inherit features from other tags
incrementally by using a `-` (dash). For example,
the `html-nwjs` tag is incrementally inheriting
Definitions from the `html` tag.

This allows to arrange tags both in a flexible
manner and without the duplication of tag-specific
Definition Implementations.

```javascript
lychee.define('app.Example').tags({
	platform: 'html'
}).exports((lychee, global, attachments) => {

	const Composite = function(data) {

		let states = Object.assign({}, data);


		states = null;

	};


	Composite.prototype = {

	};


	return Composite;

});
```

## Definition Features

If a Definition is a platform-specific Implementation,
it most likely also has different requirements of
`native` APIs of the current runtime it delivers to.

These requirements can be integrated with the [Environment](./environments.md)
sandox by offering a `supports()` callback that checks
all requirements incrementally and then returns either
`true` or `false`.

```javascript
lychee.define('app.Renderer').tags({
	platform: 'html'
}).includes([
	'lychee.Renderer'
]).supports((lychee, global) => {

	if (
		typeof global.document !== 'undefined'
		&& typeof global.document.createElement === 'function'
		&& typeof global.CanvasRenderingContext2D !== 'undefined'
	) {
		return true;
	}


	return false;

}).exports((lychee, global, attachments) => {

	const _document = global.document;
	const _Renderer = lychee.import('lychee.Renderer');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.__canvas  = _document.createElement('canvas');
		this.__context = this.__canvas.getContext('2d');


		_Renderer.call(this, states);

		states = null;

	};


	Composite.prototype = {

	};


	return Composite;

});
```

## Package Integration

As the `tags` of a Definition are tightly integrated
with the `lychee.pkg` file, it is also important to
set those up there. The [Packages](./packages.md)
chapter covers more details on the `lychee.pkg`
format and its concept.

