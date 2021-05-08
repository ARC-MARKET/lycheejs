
# lychee.js Runtimes


## Overview

This project aims to deliver the lychee.js Engine in
an easier way to other platforms via its fertilizer adapters.

These runtimes are the equivalent for each fertilizer adapter
and offer an identical way of packaging to multiple platforms.

This repository tries to ship binaries whereever possible.



## Dependencies

Dependencies required to make the `update.sh` scripts work properly:

```bash
sudo pacman -S --needed bash curl git p7zip tar unzip binutils jdk8-openjdk;
```

Note: OpenJDK 8 is required for `html-webview` and its
Android platform support.


## Usage

The `do-update.sh` script allows to update all third-party
dependencies and download all runtimes for all platforms
and all architectures automatically.

```bash
cd /opt/lycheejs/bin/runtime;

# Updates all runtimes
./bin/do-update.sh;
```

The `do-update.sh` script also supports the `--yes` flag,
which will cause a forced update that does not respect
cached versions.

```bash
cd /opt/lycheejs/bin/runtime;

# Force-Updates all runtimes
./bin/do-update.sh --yes;
```


# Work-in-Progress

- `html-nwjs` Linux ARM build [#1151](https://github.com/nwjs/nw.js/issues/1151)
- `html-webview` needs Android Nougat Toolchain update
- Android Nougat SDK needs automation for static fixes
- Android Nougat SDK needs statically built (and modified) gradle

