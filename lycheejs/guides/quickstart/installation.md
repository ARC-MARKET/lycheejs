
# Installation

The lychee.js Engine is distributed via two different channels:

- `lychee.js Library` which is a prototyping library for use with other tech stacks.
- `lychee.js Engine` which is an isomorphic engine and contains AI automation, all tools and software bots.


## lychee.js Engine Installation

The lychee.js Engine is a self-hosted engine and development environment
that includes all necessary runtimes, binaries and external SDKs that
you need for further cross-compilation or deployment to its supported
target platforms and architectures.

The lychee.js Engine installation requires at least 4GB of free memory
space at `/opt/lycheejs`. 16GB are recommended to have a fully working
AI knowledge integration.

**Notes**:

- Windows 10 is supported via Windows Subsystem for Linux (WSL) and Ubuntu.
- GNU/Linux requires either of `apk`, `apt-get`, `dnf`, `pacman`, `yum` or `zipper` installed beforehand.
- Mac OSX requires [brew](https://brew.sh) installed beforehand.
- FreeBSD/NetBSD requires `pkg` installed and [Linux Compatibility](https://www.freebsd.org/doc/handbook/linuxemu-lbc-install.html) activated beforehand.

```bash
# install lychee.js Engine into /opt/lycheejs
sudo mkdir -m 0777 /opt/lycheejs;
git clone https://github.com/cookiengineer/lycheejs;


cd /opt/lycheejs;

# install and update dependencies
sudo ./bin/maintenance/do-install.sh;
sudo ./bin/runtime/do-update.sh;

# rebuild and start
bash ./bin/configure.sh;
lycheejs-harvester start development;

# Now visit http://localhost:8080 in Chromium
```


The `/bin/maintenance/do-install.sh` script supports the following flags:

- `-y` or `--yes` skips dialogs and installs only required packages.
- `-s` or `--skip` skips updates and does neither install required nor optional packages.

The `/bin/maintenance/do-update.sh` script supports the following flags:

- `-y` or `--yes` skips dialogs and installs only required packages.
- `-m` or `--branch=master` switches to the `master` branch (defaults to `development` branch).
- `-n` or `--runtime=node` uses the minimal `lycheejs-runtime-only-node.zip` from the releases.

The `/bin/configure.sh` script supports the following flags:

- `-c` or `--core` distributes only the [lychee.js Crux](/libraries/crux) Library and nothing else.


## (Required) Manual ESLint Installation

The lychee.js Engine heavily relies on [eslint](https://github.com/eslint)
for both static and dynamic code analysis, as eslint helps
to ease up the parsing part in the lychee.js Strainer as
it can rely on an easy-to-parse codestyle.

If `eslint` is not installed, most of the AI-related code
learning features and autofix functionalities will be
deactivated and/or probably throw an endless list of errors.

Therefore it is recommended to install eslint on your system
globally and to link it into the lychee.js folder.

```bash
sudo npm install -g eslint;

cd /opt/lycheejs;
npm link eslint;
```

## Configuration and Bootup

The [/bin/configure.sh](/bin/configure.sh) script will
automatically build the [lychee.js Crux](/libraries/crux)
Library and distribute and learn the [lychee.js Engine](/libraries/lychee)
Library, so that every Project is ready to go.

Whenever something changes in `/libraries/crux`, the
`/bin/configure.sh` script has to be executed again.

```bash
cd /opt/lycheejs;

# Build lychee.js Crux and lychee.js Engine
./bin/configure.sh;
```

Afterwards, all the lychee.js Software Bots can be used.

The best thing to do is to start the [lychee.js Harvester](/guides/software/lycheejs-harvester.md)
and to play around with the Projects served at `http://localhost:8080`.

```bash
cd /opt/lycheejs;

# Boot lychee.js Harvester
lycheejs-harvester start development;

# Open Web Browser
lycheejs-helper web http://localhost:8080;
```

## Optional Dependencies

The lychee.js Engine optionally requires `OpenJDK 8` or later
in order to ship to mobile platforms such as `Android`.

If it is installed on the host machine already, the `JAVA_HOME`
environment variable has to be set in order to use it:

```bash
# On GNU/Debian
export JAVA_HOME="/usr/lib/jvm/java-8-openjdk-amd64";

# On Arch Linux
export JAVA_HOME="/usr/lib/jvm/java-8-openjdk";

# On MacOS
export JAVA_HOME=$(/usr/libexec/java_home);


# Afterwards ...
cd /opt/lycheejs;
lycheejs-fertilizer fertilizer /projects/boilerplate html-webview/main;
```

