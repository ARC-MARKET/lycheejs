
# lychee.js Strainer

The `lycheejs-strainer` is a Command-Line Wizard that helps
to lint, parse and understand Projects and Libraries and
their Definitions.

It can be seen as a tool that automatically guesses how
your code works and that builds up a knowledge graph,
which in return is used by the Artificial Intelligence.


## Requirements

The lychee.js Strainer uses `eslint` to parse the definition
files, so you have to install `eslint` globally and link it
locally into your `/opt/lycheejs` installation.

```bash
sudo npm install -g eslint;

cd /opt/lycheejs;
npm link eslint;
```


## Usage

The default action shows the Help with Usage Notes and
Examples.

```bash
# Usage: lycheejs-strainer [Action] [Library/Project] [Flag]

cd /opt/lycheejs;

lycheejs-strainer; # show help
```

**Actions**:

- `check` checks, lints and fixes a Project or Library.
- `simulate` simulates all defined `lychee.Simulation` instances.
- `transcribe` transcribes a Project or Library from an API knowledge base.

**Flags**:

- `--debug` enables debug messages.

## Error Format

The error format is very specific to how linters output errors and it is
defined as `%path%:%line%:%column%: error message [error-rule]` whereas
the path is relative to the lychee.js Engine root (`/opt/lycheejs`).

The exit code of the `lycheejs-strainer` process will be `0` in case
there was not a single error. In case a mistake is found, the exit
code is `1`.

Example Output:

```bash
[$] cd /opt/lycheejs;
[$] lycheejs-strainer check /libraries/lychee;
(...)
 (W) Invalid Config at "/libraries/lychee/api/strainer.pkg" (No JSON file).
 (W) /opt/lycheejs/libraries/lychee/api/strainer.pkg
 (E) strainer: /libraries/lychee/source/ai/neat/Pool.js:16:7: 'states' is assigned a value but never used. Allowed unused vars must match /^_[A-Za-z]+/. [no-unused-vars]
 (E) strainer: /libraries/lychee/source/ai/neat/Species.js:6:7: 'states' is assigned a value but never used. Allowed unused vars must match /^_[A-Za-z]+/. [no-unused-vars]
 (E) strainer: /libraries/lychee/source/ui/entity/Input.js:592:22: Invalid parameter values for "value" for method "setValue()". [no-parameter-value]
 (E) strainer: /libraries/lychee/source/verlet/Constraint.js:15:0: Composite has too many arguments. [no-composite]
 (E) strainer: FAILURE ("/libraries/lychee")
```


## Check a Project

The `check` action checks, parses, lints and fixes a Project
or Library completely autonomously.

Afterwards, the generated API knowledge base will be written
to the Project's or Library's `/api` folder.

```bash
cd /opt/lycheejs;

lycheejs-strainer check /libraries/lychee;     # check library
lycheejs-strainer check /projects/boilerplate; # check project
```

## Simulate a Project

The `simulate` action simulates all `lychee.Simulation` instances
that are configured in the `lychee.pkg` file.

```bash
cd /opt/lycheejs;

lycheejs-strainer simulate /libraries/lychee; # all simulations
```

## Transcribe a Project

```bash
cd /opt/lycheejs;

lycheejs-strainer check /projects/boilerplate;                           # generate api knowledge
lycheejs-strainer transcribe /projects/boilerplate /projects/my-project; # transcribe api knowledge
```

