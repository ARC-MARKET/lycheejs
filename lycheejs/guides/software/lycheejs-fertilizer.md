
# lychee.js Fertilizer

The `lycheejs-fertilizer` is the Cross-Compiler
Toolchain and Build Pipeline that automates the
build and packaging process of all runtimes behind
the scenes.

Depending on each Project's or Library's `lychee.pkg`
file, the whole build pipeline is automated.

The `raw` generated source files are written to
a Project's or Library's `/build/<platform>/<target>`
folder.

After a successful build process, all generated
files are written to a Project's or Library's
`/build/<platform>/<target>-<distribution>-<architecture>`
folder.


## Usage

The default action shows the Help with Usage Notes and
Examples.

```bash
# Usage: lycheejs-fertilizer [Action] [Library/Project] [Target] [Flag]

cd /opt/lycheejs;

lycheejs-fertilizer; # show help
```

**Actions**:

- `configure` configures all metadata.
- `build` builds and generates all assets.
- `package` packages the assets with a runtime.
- `publish` publishes the bundled package.

**Targets**:

The build targets are defined in each Project's or Library's
`lychee.pkg` file inside the `/build/environments` section.

Example entry (taken from the Boilerplate):

```javascript
// lychee.pkg/build/environments
{
	"html-nwjs/main": {
		"debug": false,
		"packages": {
			"app": "./lychee.pkg"
		},
		"profile": {
			"client": "/api/server/connect?identifier=/projects/boilerplate"
		},
		"sandbox": false,
		"tags": {
			"platform": [
				"html-nwjs",
				"html"
			]
		},
		"target": "app.Main",
		"variant": "application"
	}
}
```

Depending on the configuration of the build environment,
the build process differs for the `variant`.

The `variant` of a `lychee.Environment` can be set to:

- `application` causes binaries to be generated.
- `library` causes isomorphic libraries to be generated.

**Flags**:

- `--debug` enables debug messages.
- `--sandbox` sandboxes the instance and isolates the build environment.

## Fertilize a Project

The `fertilize` action fertilizes a Project completely
autonomously. If there's no `[Target]` parameter given,
the lychee.js Fertilizer will build all targets that are
configured in the Project's `lychee.pkg` file.

```bash
cd /opt/lycheejs;

lycheejs-fertilizer fertilize /projects/boilerplate;           # all targets
lycheejs-fertilizer fertilize /projects/boilerplate node/main; # single target
```

## Fertilize a Library

The `fertilize` action fertilizes a Library completely
autonomously. If there's no `[Target]` parameter given,
the lychee.js Fertilizer will build all targets that are
configured in the Library's `lychee.pkg` file.

```bash
cd /opt/lycheejs;


lycheejs-fertilizer fertilize /libraries/lychee;           # all targets
lycheejs-fertilizer fertilize /libraries/lychee node/dist; # single target
```

## Custom Build Process

The build process in general is split up in three major
steps `configure`, `build` and `package`.

An optional step `publish` is reserved for peer-to-peer
publishing of generated software, but is not triggered
by the lychee.js Fertilizer itself.

The lychee.js Fertilizer will also call bash scripts in
the Project's or Library's `/bin` folder, where `[Target]`
represents the same value as in the `lycheejs-fertilizer`
CLI parameter:

- `/bin/configure.sh [Target]` after the `configure` step was completed.
- `/bin/build.sh [Target]` after the `build` step was completed.
- `/bin/package.sh [Target]` after the `package` step was completed.


Each of the bash scripts must follow the following rules:

- `echo "SUCCESS"; exit 0;` in the succeeding case.
- `echo "FAILURE"; exit 1;` in the failing case.

Example implementations of those custom build scripts
are also integrated in the Boilerplate:

- [/bin/configure.sh](/projects/boilerplate/bin/configure.sh)
- [/bin/build.sh](/projects/boilerplate/bin/build.sh)
- [/bin/package.sh](/projects/boilerplate/bin/package.sh)

