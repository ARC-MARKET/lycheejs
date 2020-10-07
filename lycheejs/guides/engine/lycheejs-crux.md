
# lychee.js Crux

The lychee.js Crux Library is the core of the lychee.js
Engine. It is the heart of the [Feature Detection](./feature-detection.md)
concept and includes all Definitions that are essential
to get either [Environments](./environments.md) or
[Simulations](./simulations.md) up and running which
then support the lychee.js Definition syntax.

All platform adapters are incrementally implemented,
whereas the notation of `html-webview` means that the
platform is inheriting its reflected behaviour from
the `html` platform.


## Polyfills

Some Polyfills are necessary to have the same ES2016+
level integration on all platforms. These Polyfills
are implemented in the identical manner as the ECMAScript
specification.

In any case, when there's a specified API in future
available, all code internally will be migrated to
prefer the specified API over the internal API.

- [console](/libraries/crux/source/platform/html/console.js) is the `Console API` implemented and polyfilled incrementally.
- [Buffer](/libraries/crux/source/platform/html/Buffer.js) is a binary buffer that converts between different encodings.
- `Boolean.prototype.toJSON()`, `Date.prototype.toJSON()`, `Number.prototype.toJSON()`, `String.prototype.toJSON()`
- `Array.from()`, `Array.prototype.find()`, `Array.prototype.includes()`, `Array.prototype.unique()`
- `Object.assign()`, `Object.entries()`, `Object.filter()`, `Object.find()`, `Object.map()`, `Object.sort()`, `Object.values()`
- `String.prototype.endsWith()`, `String.prototype.includes()`, `String.prototype.replaceObject()`, `String.prototype.startsWith()`

## Asset Definitions

The Asset Definitions are implemented incrementally per
platform, which means that each newly created platform
should implement at least the `Stuff` data type in order
to be able to load binary `Buffer` instances and execute
code.

These Asset Definitions are available for usage with the
lychee.js Engine stack across all platforms. The `buffer`
property of each Asset instance can be different from
others, but in general is serializable to at least a
`base64` encoded string.

- [Config](/libraries/crux/source/platform/html/Config.js) is a `JSON` abstraction that can also be used for `REST` APIs.
- [Font](/libraries/crux/source/platform/html/Font.js) is a Blitmap-Font implementation that integrates with [lychee.js Studio](../software/lycheejs-studio.md).
- [Music](/libraries/crux/source/platform/html/Music.js) is a repeating Audio Stream implementation for `ogg` and `mp3` files.
- [Sound](/libraries/crux/source/platform/html/Sound.js) is a non-repeating Audio Stream implementation for `ogg` and `mp3` files.
- [Stuff](/libraries/crux/source/platform/html/Stuff.js) is a Data Stream implementation for both binary buffers and encoded files.
- [Texture](/libraries/crux/source/platform/html/Texture.js) is a Texture Atlas implementation for `png` files.

```javascript
let config = new Config('/libraries/harvester/profiles/development.json');

config.onload = result => {

	if (result === true) {
		console.log(config.buffer instanceof Object);
	} else {
		console.log(config.buffer === null);
	}

};

config.load();
```

## URL Resolutions

All Asset Definitions resolve the `url` property based on the
`lychee.environment.resolve()` method and on the following
two global (user-configurable) constants.

- `lychee.ROOT.lychee` represents the global sandboxed root. If the URL starts with `/`, the url is always prefixed with `lychee.ROOT.lychee`.
- `lychee.ROOT.project` represents the project root. If the URL starts with `./`, the url is always prefixed with `lychee.ROOT.project`.

```javascript
console.log(lychee.ROOT.lychee);  // "/opt/lycheejs"
console.log(lychee.ROOT.project); // "/projects/my-project"

let config = new Config('/libraries/lychee/lychee.pkg');
let stuff  = new Stuff('./source/Main.js');

console.log(config.url); // "/opt/lycheejs/libraries/lychee/lychee.pkg"
console.log(stuff.url);  // "/opt/lycheejs/projects/my-project/source/Main.js"
```

## Crux Definitions

- [lychee.Asset](/libraries/crux/source/Asset.js) implements a Wrapper that allows creation of any Asset.
- [lychee.Debugger](/libraries/crux/source/Debugger.js) implements a networked Debugger that allows automated debugging of remote Projects and Libraries.
- [lychee.Definition](/libraries/crux/source/Definition.js) implements a Definition System that allows Feature Detection.
- [lychee.Environment](/libraries/crux/source/Environment.js) implements the [Environment API](./environments.md).
- [lychee.Package](/libraries/crux/source/Package.js) implements an intelligent Package System that allows Feature Prediction.
- [lychee.Simulation](/libraries/crux/source/Simulation.js) implements the [Simulation API](./simulations.md).
- [lychee.Specification](/libraries/crux/source/Specification.js) implements an automated Fuzz-Test API that allows descriptions of Definition Behaviours.

```javascript
// node.js Example
const _ROOT  = process.env.LYCHEEJS_ROOT || '/opt/lycheejs';
const lychee = require(_ROOT + '/libraries/crux/build/node/dist.js')(__dirname);

// lychee.js Crux Definitions
Object.keys(lychee).forEach(key => {
	console.log('lychee.' + key, typeof lychee[key]);
});

// Console Output is ...
// (L) lychee.debug boolean
// (L) lychee.environment object
// (L) etc. pp.
```

## Feature Detection

The Feature Detection aspects of the lychee.js Engine
is reflected in the global `lychee.FEATURES` constant
for each platform.

All platform-specific APIs are reflected in there, so
that the `lychee.Environment` and `lychee.Simulation`
can predict what kind of features are expected for
the build or simulation of a foreign environment in
the current environment.

- `lychee.FEATURES['html']` represents the [html](/libraries/crux/source/platform/html/FEATURES.js) platform.
- `lychee.FEATURES['html-nwjs']` represents the [html-nwjs](/libraries/crux/source/platform/html-nwjs/FEATURES.js) platform.
- `lychee.FEATURES['html-webview']` represents the [html-webview](/libraries/crux/source/platform/html-webview/FEATURES.js) platform.
- `lychee.FEATURES['nidium']` represents the [nidium](/libraries/crux/source/platform/nidium/FEATURES.js) platform.
- `lychee.FEATURES['node']` represents the [node](/libraries/crux/source/platform/node/FEATURES.js) platform.
- `lychee.FEATURES['node-sdl']` represents the [node-sdl](/libraries/crux/source/platform/node-sdl/FEATURES.js) platform.

