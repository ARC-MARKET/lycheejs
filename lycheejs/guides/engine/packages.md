
# Packages

The [lychee.Package](/libraries/crux/source/Package.js)
format allows a cross-platform way to define a Package's
structure, their folder/file graph and the [Environments](./environments.md)
and [Simulations](./simulations.md) that can be either
platform-specific or isomorphic in their nature.


## Basic Layout

This describes the JSON structure of a typical `lychee.pkg`
file, given that the `files` exist in the Filesystem.

The `lychee.pkg` file itself is completely auto-generated
by the [lychee.js Studio](../software/lycheejs-studio.md)
and the [lychee.js Harvester](../software/lycheejs-harvester.md).

In theory, it should never be necessary to modify the file,
but its structure and purpose is documented here to explain
the relations to more advanced APIs that re-use the `lychee.pkg`
file and its provided data.

- `/api` contains all auto-checked API Knowledge data by the [lychee.js Strainer](../software/lycheejs-strainer.md).
- `/asset` contains all raw assets of the Project or Library that the lychee.js Engine cannot understand.
- `/build` contains all auto-fertilized builds by the [lychee.js Fertilizer](../software/lycheejs-fertilizer.md).
- `/build/environments` can be modified to setup additional [Environments](./environments.md).
- `/review` contains all Simulations and Specifications that the [lychee.js Strainer](../software/lycheejs-strainer.md) learns from.
- `/review/simulations` can be modified to setup additional [Simulations](./simulations.md).
- `/source` contains all [Definitions](./definitions.md) and [Assets](./lycheejs-crux.md).
- `/source/tags` defines all `tags` for the Project or Library, for example the `platform` tag.


```javascript
{
	"api": {                             // Auto-generated API Knowledge
		"files": {
			"Main": [                    // app.Main API data
				"json"
			]
		}
	},
	"build": {
		"environments": {                // All Environments
			"html-nwjs/dist": {          // html-nwjs/dist target
				"packages": {
					"app": "./lychee.pkg"
				},
				"tags": {
					"platform": [
						"html-nwjs",     // prefer html-nwjs platform adapters
						"html"           // fallback to html platform adapters
					]
				},
				"target": "app.Main",    // build target
				"variant": "library"     // build as library for inclusion
			},
			"html-nwjs/main": {          // html-nwjs/main target
				"packages": {
					"app": "./lyche.pkg"
				},
				"tags": {
					"platform": [
						"html-nwjs",     // prefer html-nwjs platform adapters
						"html"           // fallback to html platform adapters
					]
				},
				"target": "app.Main",    // build target
				"variant": "application" // build as application (fertilized with runtime)
			}
		},
		"files": {
			"html-nwjs": {
				"dist": {},              // "html-nwjs/dist" target build output folder
				"main": {}               // "html-nwjs/main" target build output folder
			}
		}
	},
	"review": {
		"simulations": {                 // All Simulations
		},
		"files": {                       // All Specifications
			"Main": [
				"js"
			]
		}
	},
	"source": {
		"tags": {                        // All defined Tags
			"platform": {
				"html": "platform/html",
				"html-nwjs": "platform/html-nwjs"
			}
		},
		"files": {
			"platform": {                // Note the tags[platform] map above
				"html-nwjs": {
					"Client": [          // Platform-specific app.Client
						"js"
					]
				},
				"html": {
					"Client": [          // Platform-specific app.Client
						"js"
					]
				}
			},
			"Main": [                    // app.Main
				"js",                    // app.Main Implementation
				"json"                   // Config instance mapped to attachments[json]
			]
		}
	}
}
```

## Basic Usage

The `lychee.pkg(type, identifier, callback)` method allows
to instanciate the [Environment](./environments.md) or
[Simulation](./simulations.md) via the `type` and `identifier`
parameter.

The `./lychee.pkg` URL is resolved via `lychee.ROOT.project`.

```javascript
lychee.init(null);
lychee.pkg('build', 'html-nwjs/main', (environment, profile) => {

	if (environment !== null) {

		lychee.init(environment, {
			debug:   true,
			profile: profile
		});

	}

});
```

## Advanced Usage

The `lychee.init(environment || simulation, states, callback)`
method allows to instanciate the [Environment](./environments.md)
or [Simulation](./simulations.md) and generates the source code
for the initialization of the `target` automatically.

If the `callback` parameter is set, the initialization source
code has to be provided manually.

```javascript
lychee.init(null);
lychee.pkg('build', 'html-nwjs/main', (environment, profile) => {

	if (environment !== null) {

		lychee.init(environment, {
			debug: true
		}, sandbox => {

			let app    = sandbox.app;
			let lychee = sandbox.lychee;

			sandbox.MAIN = new app.Main(settings.profile || {});
			sandbox.MAIN.init();

		});

	}

});
```

## Custom Usage

Additionally, the `lychee.init(environment || simulation, states, callback)`
method allows to instanciate custom [Environments](./environments.md)
or [Simulations](./simulations.md) with a custom instance.

```javascript
let env = new lychee.Environment({
	debug: true,
	packages: {
		app: './lychee.pkg',
		lychee: '/libraries/lychee/lychee.pkg'
	},
	profile: {
		hoo: 'ray!'
	},
	sandbox: true,
	tags: {
		platform: [
			'html-nwjs',
			'html'
		]
	},
	target: 'app.Main',
	type: 'source',
	variant: 'application'
});

lychee.init(env, {
	sandbox: false // overwrites above sandbox flag
});
```

## lychee.Package API

The [lychee.Package](/libraries/crux/source/Package.js)
offers additional functionality for the automated usage
of the `lychee.pkg` data.

These methods are helpful for the integration into more
advanced build pipelines or build logics, such as the
[/libraries/crux/bin/configure.js](/libraries/crux/bin/configure.js).

These methods also include the logical abstraction of
platform-specific or tag-specific Definitions that are
part of specialized builds and/or are available in
multiple Implementations.

The `tags` parameter for each method is optional, if it
is set it filters the returned Array values.

```javascript
let pkg = new lychee.Package({
	id:  'lychee',
	url: '/libraries/lychee/lychee.pkg'
});

setTimeout(_ => {

	let files      = pkg.getFiles();
	let files_html = pkg.getFiles({
		platform: 'html'
	});

	console.log(files);
	console.log(files_html);

	let definitions_html = pkg.getDefinitions({
		platform: 'html'
	});
	let namespaces_html  = pkg.getNamespaces({
		platform: 'html'
	});

	console.log(definitions_html);
	console.log(namespaces_html);

}, 200);
```

