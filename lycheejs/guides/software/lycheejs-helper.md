
# lychee.js Helper

The `lycheejs-helper` is a low-level bash script
that integrates the typical POSIX environment with
the lychee.js Software.

It integrates many useful features for both application
interaction and rapid prototyping.


## Usage

The default action shows the Help with Usage Notes and
Examples.

```bash
# Usage: lycheejs-helper lycheejs://[Action]=[Library/Project]
#        lycheejs-helper lycheejs://[Action]=[Command/Profile]?data=[Data]
#        lycheejs-helper [Helper]:[Platform/Identifier]
#        lycheejs-helper [Action] [Library/Project]
#        lycheejs-helper [Action] [Command/Profile] [Data]


cd /opt/lycheejs;

lycheejs-helper; # show help
```

**Protocol Helper**:

The `lycheejs-helper` allows to be integrated with the
custom `lycheejs://` protocol. This works for many
operating systems, including BSD, Linux and MacOS.

The `lycheejs://` protocol is useful for interaction
with other programs, for example when a user opens
a `lycheejs://` link inside the web browser, the
`lycheejs-helper` binary will be called with its
arguments.

```bash
# Legacy systems might use xdg-open instead of gio

gio open lycheejs://boot=development;            # boot lycheejs-harvester
gio open lycheejs://start=/projects/boilerplate; # start project server
gio open lycheejs://cmd=lycheejs-ranger;         # start lycheejs-ranger
gio open lycheejs://unboot;                      # unboot lycheejs-harvester
```

**Runtime Helper**:

- `which:[Platform]` resolves a runtime execution path (can be used as shebang).
- `env:[Platform] [File]` executes a `[File]` in a runtime.
- `run:[Platform/Identifier]` executes a project in a fertilized runtime.

Examples:

```bash
[$] lycheejs-helper which:node; # resolves runtime
/opt/lycheejs/bin/runtime/node/linux/x86_64/node

[$] lycheejs-helper env:node; # executes runtime
```

```bash
lycheejs-fertilizer fertilize html-nwjs/main /projects/boilerplate;
lycheejs-helper run:html-nwjs/main /projects/boilerplate;
```

**Project Interaction**:

- `edit [Library/Project]` opens the Project or Library in lychee.js Studio.
- `file [Library/Project]` opens the Project or Library in the file manager.
- `start [Library/Project]` starts the Project's or Library's server.
- `stop [Library/Project]` stops the Project's or Library's server.

Examples:

```bash
[$] lycheejs-helper file /projects/boilerplate; # opens file manager
[$] lycheejs-helper edit /projects/boilerplate; # opens lycheejs-studio
```

```bash
cd /opt/lycheejs;

lycheejs-harvester start development;        # boot harvester
lycheejs-helper stop /projects/boilerplate;  # stop server
lycheejs-helper start /projects/boilerplate; # start server
```

**OS Interaction**:

- `cmd [Command] [Data]` executes a command with `[Data]` as parameter.
- `web [URL]` opens the web browser with a `[URL]` as parameter.

Examples:

```bash
lycheejs-helper "lycheejs://cmd=lycheejs-ranger?data="$(echo '{"foo":"bar"}' | base64);
lycheejs-helper cmd "lycheejs-ranger?data="$(echo '{"foo":"bar"}' | base64);
```

```bash
lycheejs-helper "lycheejs://web=https://lychee.js.org";
lycheejs-helper web "https://lychee.js.org";
```


## Shebang Usage

The `lycheejs-helper` command can also be used as a shebang
and replace the `/bin/env` binary.

Example (node script):

```javascript
#!/usr/bin/local/lycheejs-helper env:node

const _ROOT = process.env.LYCHEEJS_ROOT || '/opt/lycheejs';
require(_ROOT + '/libraries/crux/build/node/dist.js')(__dirname);


lychee.init(null);

console.log(lychee.VERSION);
```


## Bash Usage

The `lycheejs-helper` command can also be used in order to
ease up the integration of bash scripts while providing a
simple way to execute files in specific runtimes.

Example (bash script):

```bash
#!/bin/bash

lycheejs-helper env:node /opt/lycheejs/projects/boilerplate/harvester.js;
```

