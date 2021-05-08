
# lychee.js Strainer Fixer

The `lycheejs-strainer-fixer` is a Command-Line Linter that
helps to lint, parse and understand single files and their
contents and their recursively resolved inclusions and
requirements.

It can be seen as a `quickfix` mode supporting tool and is
the code assistant that rewrites your code and fixes things
automatically - while you as a human - still write code in
your IDE.

In most IDEs there's something like mentioned `quickfix` mode
available that allows the parsing of the external process's
output.

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
# Usage: lycheejs-strainer-fixer [File] [Flag]

cd /opt/lycheejs;

lycheejs-strainer-fixer;                                       # show help
lycheejs-strainer-fixer ./projects/boilerplate/source/Main.js; # lint file
```

**Flags**:

- `--debug` enables debug messages.

## Error Format

The error format is very specific to how linters output errors and it is
defined as `%path%:%line%:%column%: error message [error-rule]` whereas
the path is relative to the lychee.js Engine root (`/opt/lycheejs`).

The exit code of the `lycheejs-strainer-fixer` process will be `0`
in case there was not a single error. In case a mistake is found,
the exit code is `1`.

Example Output:

```bash
[$] cd /opt/lycheejs;
[$] lycheejs-strainer-fixer ./libraries/lychee/source/ui/entity/Input.js;
/libraries/lychee/source/ui/entity/Input.js:592:22: Invalid parameter values for "value" for method "setValue()". [no-parameter-value]

1 problem
```

