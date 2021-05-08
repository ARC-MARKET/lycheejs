
# lychee.js CHANGELOG

All lychee.js versions are released in a quarterly release cycle.

At the end of each quarter, a new release is automatically 
generated, tagged and pushed to GitHub.

We do NOT use semantic versioning as it is assumed to always use
at least the latest quarterly release on the `master` branch or
the `development` branch.

As we cannot influence decisions of our Artificial Intelligence,
some things might break temporarily on the `development` and
`humansneednotapply` branch.

All entries in the changelog are listed in this specific order:
`changed`, `removed`, `added` and `fixed`.


## [2018-Q4] - UNRELEASED

- **Changed**: `lycheejs-*` CLI tools support different roots than `/opt/lycheejs`.
- **Added**: `lychee.assimilate(target, sandbox)` supports sandboxed code execution.


## [2018-Q3] - 2018-09-30

- **Changed**: lychee.net.Tunnel `setType(type)` is renamed into `setProtocol(protocol)`.
- **Changed**: `Stuff` data type uses `Buffer` as `.buffer` property.
- **Changed**: lychee.js Fertilizer supports event flow based platform adapters.
- **Added**: lychee.js Breeder supports `init <identifier>` for mockup purposes.
- **Added**: lychee.js Strainer supports `no-composite`.
- **Added**: lychee.Package supports `getDefinitions(tags)` and `getFiles(tags)`.
- **Added**: lychee.Package supports `getEnvironments(tags)` and `getSimulations(tags)`.
- **Added**: lychee.event.Emitter supports `has(event, callback, scope)` syntax.
- **Added**: lychee.net.Service supports Composite syntax.
- **Fixed**: `node` platform fixes serialization of binary assets.
- **Fixed**: lychee.js Strainer supports memory analysis of lychee.js Crux.
- Changed: lychee.js Harvester stores `pid` in `/tmp/lycheejs-harvester.pid`.
- Changed: `lychee.export(reference, sandbox)` returns exported definition or `null`.
- Changed: lychee.ai.Entity `collides(entity)` returns collision state.
- Changed: lychee.ai.Layer `collides(entity)` returns collision state.
- Changed: lychee.app.Entity `collides(entity)` returns collision state.
- Changed: lychee.app.Layer `collides(entity)` returns collision state.
- Changed: lychee.app.Layer `trace(position)` traces entities.
- Changed: lychee.ui.Entity `collides(entity)` returns collision state.
- Changed: lychee.ui.Layer `collides(entity)` returns collision state.
- Changed: lychee.ui.Layer `trace(position)` traces entities.
- Removed: lychee.app.Entity `collidesWith(entity)`.
- Removed: lychee.ui.Entity `collidesWith(entity)`.
- Removed: lychee.app.Entity `isAtPosition(position)`.
- Removed: lychee.ui.Entity `isAtPosition(position)`.
- Added: `lychee.decycle(target, object, path)` supports de-cycling nested objects.
- Added: lychee.Environment supports `application` and `library` variant.
- Added: lychee.Environment supports detection of cyclic dependencies.
- Added: lychee.codec Stack supports `Date` data type.
- Added: lychee.codec.INI supports INI format with JSON-compatible data types.
- Added: lychee.event.Emitter supports `publish()`, `subscribe()` and `transfer()`.
- Fixed: lychee.Environment supports `requires()` and `includes()` of lychee.js Crux identifiers.
- Fixed: lychee.app.Entity `isAtPosition(position)` supports incremental coordinates.
- Fixed: lychee.ui.Entity `isAtPosition(position)` supports incremental coordinates.
- Fixed: lychee.codec.DIXY `encode(data)` returns `null` in error case.


## [2018-Q2] - 2018-06-29

- **Changed**: lychee.js Crux replaces old lychee.js Engine Core.
- **Changed**: `settings` is renamed into `states` across the stack.
- **Changed**: lychee.js Strainer supports simulations and reviews.
- **Added**: lychee.Specification allows implementation of behaviour tests.
- **Added**: lychee.Simulation allows simulations of sandboxes on lychee.Environments.
- Added: lychee.js Harvester supports trailing `--debug` flag.
- Added: `harvester.js` supports trailing `--debug` flag.
- Added: `Buffer.alloc()` and `Buffer.from()` to be in sync with updated node.js API.
- Added: `./bin/configure.js` supports reviews and specifications.
- Fixed: `./bin/maintenance/do-install.sh` updates package-manager caches.
- Fixed: lychee.js Breeder supports project folders that are symbolic links.


## [2018-Q1] - 2018-03-31

- **Changed**: `./bin/configure.js` supports source maps for core and platform adapters.
- **Added**: lychee.js Strainer supports transcriptions.
- **Fixed**: lychee.js Fertilizer's `auto` action exits correctly when subprocesses fail.
- Changed: lychee.js Harvester API deprecates unnecessary `web` object.
- Changed: lychee.Environment retries `10` times in case of unloaded packages.
- Added: `html` platform supports now IE11 (added missing polyfills).
- Added: `lychee.export(reference, sandbox)` exports a definition to a given sandbox.
- Added: lychee.ENVIRONMENTS represents lychee.Environment cache.
- Added: lychee.SIMULATIONS represents lychee.Simulation cache.
- Added: lychee.ui.Element supports same `type` as lychee.ui.Blueprint.
- Added: lychee.crypto.BLAKE2B.
- Fixed: `Music` data type parallelizes the load process of buffers.
- Fixed: `Sound` data type parallelizes the load process of buffers.
- Fixed: lychee.Simulation respects correct `target` of lychee.Environment.
- Fixed: lychee.Stash supports Music and Sound data types.
- Fixed: lychee.js Studio supports Music and Sound data types.
- Fixed: lychee.ui.element Stack supports correct `relayout` event flow.
- Fixed: lychee.ui.entity.Select supports the rendering of buffers.


## [2017-Q4] - 2017-12-20

- **Changed**: lychee.pkg environment settings changes to `{ packages: { namespace: url }}`.
- **Changed**: lychee.Definition has `export(sandbox)` method to be independent of lychee.Environment.
- **Removed**: `lychee.pkginit()` and `lychee.envinit()`.
- **Added**: `lychee.pkg(type, id, callback)` to ease up reusage of package-defined environments.
- **Added**: `lychee.init(env, settings, callback)` to ease up initialization process.
- **Added**: Platform-specific `feature.js` to allow feature detection that lychee.js Strainer understands.
- **Added**: lychee.js Strainer supports platform-specific APIs via feature detection.
- Changed: lychee.Package supports Composite syntax.
- Added: lychee.js Strainer supports autofixes for lychee.Definition syntax.
- Added: lychee.FEATURES represents feature detection.
- Added: lychee.FILENAME represents current definition url.
- Added: lychee.PLATFORMS represents supported platforms.
- Added: lychee.Specification and lychee.Simulation to allow integration tests per-environment-sandbox.
- Added: `lychee.blobof(template, blob)` allows validation of deserializations without memory usage.
- Added: lychee.codec.DIXY supports DIXY format with JSON-compatible data types.
- Fixed: lychee.codec.BENCODE supports JSON-compatible data types.


## [2017-Q3] - 2017-09-28

- **Changed**: harvester.mod.Harvester supports proper git flow.
- **Changed**: lychee.Definition supports Composite syntax.
- **Removed**: Legacy Cultivator Projects.
- **Added**: lychee.js Strainer supports Static Code Analysis, Memory Tracing and Knowledge Tracing.
- Changed: lychee.codec.BENCODE support special primitives (undefined, Infinity, NaN).
- Changed: lychee.codec.BITON supports special primitives (undefined, Infinity, NaN).
- Changed: lychee.codec.JSON support special primitives (undefined, Infinity, NaN).
- Added: lychee.js Helper supports cached builds.
- Fixed: Harvester Mods use sandboxed node.js binaries.
- Fixed: lychee.ai.bnn.Brain correctly boosts gradients.


## [2017-Q2] - 2017-06-28

- **Changed**: Libraries and Projects refactor to match lychee.js Strainer's expectations.
- **Changed**: lychee.js Strainer supports mutations, traces and dynamic memory lookups.
- **Changed**: All helper scripts support `--autocomplete` syntax.
- **Changed**: lychee.js Harvester synchronizes platform tags.
- **Added**: lychee.js Harvester supports `git fetch` and `git checkout`.
- **Added**: lychee.js Studio supports Font and Sprite generation.
- **Added**: lychee.js Helper supports bash autocompletion.
- **Added**: Integration of `nidium` platform.
- Changed: lychee.app.Entity supports `setStates()` method.
- Changed: lychee.ui.Entity supports `setStates()` method.
- Changed: lychee.app.State `query()` handles invalid queries correctly.
- Changed: lychee.Renderer `drawBuffer()` handles `map` and rotations.
- Changed: lychee.net.protocol.WS detects fragments dynamically.
- Removed: lychee.app.Entity deprecates `getStateMap()` method.
- Removed: lychee.ui.Entity deprecates `getStateMap()` method.
- Removed: lychee.app.Sprite deprecates `getMap()` method.
- Removed: lychee.ui.Sprite deprecates `getMap()` method.
- Added: lychee.js Fertilizer supports `*/target` and `platform/*` syntax.
- Added: lychee.js Strainer supports `quickfix mode` syntax.
- Added: lychee.app.Main supports auto-sync of Stash and Storage instances.
- Added: Project Immune as an RTS Game demo.
- Added: lychee.app.Layer `query()` method.
- Added: lychee.data.tree Stack implementation.
- Fixed: `lychee.inject()` and `lychee.define()` supports proper mappings of packages.
- Fixed: lychee.ui.entity.Upload supports file dialog correctly (Browser-Bug).
- Fixed: `Font.prototype.measure()` improves cache usage and temporary usage.


## [2017-Q1] - 2017-03-28

- **Changed**: Each Project and Library can have binaries (`./bin`).
- **Changed**: All helper scripts support the `LYCHEEJS_ROOT` environment variable.
- **Added**: lychee.js Helper supports `run:platform/identifier` syntax.
- **Added**: lychee.js Legacy Library as `/libraries/legacy`.
- **Fixed**: lychee.app.Sprite and `lychee.ui.Sprite` renders effects correctly.
- Changed: Project Pong refactor to fit AI-relevant requirements.
- Added: lychee.ai Stack refactor to fit `NEAT` requirements.
- Added: lychee.policy Stack implements feature vectorization adapters.
- Added: Project Pong-BNN as a Backpropagated NN demo.
- Added: Project Flappy-ENN as an Evolutionary NN demo.
- Added: lychee.js Harvester synchronizes to the Web.
- Added: lychee.js Harvester beautifies JSON files.
- Fixed: lychee.Stash creates recursive directories correctly.
- Fixed: `html` platform plays `Music` and `Sound` correctly via (new) Promise API.


## [2016-Q4] - 2016-12-28

- **Changed**: `lychee.Environment.__FEATURES` represents Feature Prediction (by `bootstrap.js`).
- **Added**: `lychee.assimilate(target)` to include non-packaged non-lychee Assets and Implementations.
- Changed: ES6 Migration for integration scripts (`./bin`).
- Changed: Performance improvements for `lychee.interfaceof` using a cache.
- Added: lychee.js Strainer supports ESLint and automated code-refactoring features.
- Added: lychee.js Strainer understands `Callback`, `Composite` or `Module` API.
- Added: lychee.js Harvester uses a Watcher and faster bootup cycle.
- Added: lychee.ai.enn Stack implements a feed-forward NN architecture.
- Added: lychee.ai.bnn Stack implements a backpropagated NN architecture.
- Fixed: lychee.js Fertilizer supports `html` Application Cache manifests.
- Fixed: lychee.app.Main `changeState()` handles invalid states correctly.
- Fixed: `html-nwjs` platform has correct peer-to-peer Networking.


## [2016-Q3] - 2016-09-28

- Changed: Integration of [@humansneednotapply](https://github.com/humansneednotapply) Account.
- Changed: Integration of `.github/TOKEN` file.
- Changed: License to MIT/GPL3/CC4-BY-SA.
- Changed: New Welcome Page for easier Project-based workflow.
- Removed: fyto.js was deprecated, lycheejs-legacy is embraced.
- Added: lychee.js Editor allows `project` changes.
- Fixed: lychee.ui Entities.
- Fixed: lychee.effect Stack is completely delay-compatible.


## [2016-Q2] - 2016-06-27

- **Changed**: ES6 Migration for all lychee.js Definitions (`/libraries` and `/projects`).
- Changed: lychee.js Harvester uses event/socket-driven API.
- Changed: lychee.Definition sandbox with Feature Detection.
- Changed: lychee.Environment sandbox with Feature Prediction.
- Changed: lychee.js Harvester uses lychee.net.protocol.HTTP.
- Changed: lychee.js Ranger uses new Harvester API.
- Changed: lychee.codec Stack replaces lychee.data Stack.
- Added: Maintenance scripts (`/bin/maintenance/`).
- Added: lychee.js Fertilizer supports `html` Applications and Libraries.
- Added: lychee.js Breeder supports `init`, `fork` and `pull` actions.
- Added: lychee.ui Stack automates UI/UX Flow (Blueprint and Element).
- Added: lychee.net Stack supports all platform tags peer-to-peer.
- Added: lychee.Stash adapter allows Asset-compatible storage.
- Added: lychee.Storage adapter allows Key/Value storage.


## [2016-Q1] - 2016-03-25

- **Changed**: Migrated all Libraries to `/libraries` folder.
- **Changed**: Migrated all Projects to `/projects` folder.
- **Changed**: lychee.game renamed to lychee.app Stack.
- Changed: Renamed `sorbet` Project to lychee.js Harvester.
- Changed: Project Lethalmaze as multiplayer tank game.
- Changed: Project Boilerplate is compatible with AI.
- Added: lychee.js Harvester is a reusable library and project.
- Added: GNU/Linux, OSX and BSD Development Host support.


## [2015-Q4] - 2015-11-30

- **Removed**: Windows Development Host support.
- Changed: Major Redesign of lychee.ui Stack.
- Changed: Better Guides to `/guides` folder.
- Added: Project Over-There (NASA hackathon).
- Added: Platform support for `node`, `html-nwjs` and `html-webview`.
- Added: lychee.ui and lychee.effect Stack.


# GIT CHANGELOG

- [Unreleased](https://github.com/cookiengineer/lycheejs/compare/2018-Q3...HEAD)
- [2018-Q3](https://github.com/cookiengineer/lycheejs/compare/2018-Q2...2018-Q3)
- [2018-Q2](https://github.com/cookiengineer/lycheejs/compare/2018-Q1...2018-Q2)
- [2018-Q1](https://github.com/cookiengineer/lycheejs/compare/2017-Q4...2018-Q1)
- [2017-Q4](https://github.com/cookiengineer/lycheejs/compare/2017-Q3...2017-Q4)
- [2017-Q3](https://github.com/cookiengineer/lycheejs/compare/2017-Q2...2017-Q3)
- [2017-Q2](https://github.com/cookiengineer/lycheejs/compare/2017-Q1...2017-Q2)
- [2017-Q1](https://github.com/cookiengineer/lycheejs/compare/2016-Q4...2017-Q1)
- [2016-Q4](https://github.com/cookiengineer/lycheejs/compare/2016-Q3...2016-Q4)
- [2016-Q3](https://github.com/cookiengineer/lycheejs/compare/2016-Q2...2016-Q3)
- [2016-Q2](https://github.com/cookiengineer/lycheejs/compare/2016-Q1...2016-Q2)
- [2016-Q1](https://github.com/cookiengineer/lycheejs/compare/2015-Q4...2016-Q1)
- [2015-Q4](https://github.com/cookiengineer/lycheejs/compare/a285915ac5ac541b622fece52a039fbf2051f469...2015-Q4)

