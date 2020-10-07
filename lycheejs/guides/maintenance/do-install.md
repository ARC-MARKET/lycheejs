
# Do-Install Guide

This install guide will explain what goes on behind
the scenes regarding a lychee.js Engine installation.


## Prerequisites

The [do-install.sh](/bin/maintenance/do-install.sh) script
requires the following external programs in order to be
executed successfully:

- `sudo` has to be available (except for Termux and other emulator environments).
- `bash` has to be available.
- Either of the following package managers has to be available: `pacman`, `apk`, `apt-get`, `dnf`, `yum`, `zypper`, `apt`, `brew`, `port`.

In order for the [do-install.sh](/bin/maintenance/do-install.sh)
script to work, the [lychee.js Engine](https://github.com/cookiengineer/lycheejs/tree/master/lycheejs-engine)
has to be installed in the `/opt/lycheejs` folder.

Technically, any folder should suffice as long as it's named
`lycheejs`, but some external Third-Party Projects expect it
to be at this path.

The build pipeline uses `/tmp/lycheejs` by default or
`/mnt/lycheejs` if not enough memory is available, so
don't use any of these paths.


## Usage

```bash
# Move the lycheejs-engine folder to /opt/lycheejs
mv /path/to/lycheejs-engine /opt/lycheejs;
chmod 0777 /opt/lycheejs;

# Necessary pretty much everywhere, even with System Integrity Protection
# It will use the normal user ($SUDO_USER) as often as possible.
sudo bash ./bin/maintenance/do-install.sh;

# Afterwards, follow the Do-Update Guide
# ./bin/maintenance/do-update.sh;
```

**Flags**:

- `-y` or `--yes` skips dialogs and assumes yes for all questions.
- `-s` or `--skip` skips updates and does neither install required nor optional packages (useful for offline development).

## Installation Process

1. `Update packages` (if necessary) updates the local packages index.
2. `Install required dependencies` installs all required packages via the detected package manager.
3. `Install optional dependencies` installs all optional packages that are required for mobile development (including all OpenJDK-related dependencies).
4. `Integration of lychee.js Helper` installs the lychee.js Helper as `/usr/local/bin/lycheejs-helper` symlink or as bash alias fallback.
5. `Integration of lychee.js Harvester` installs the lychee.js Harvester as `/usr/local/bin/lycheejs-harvester` symlink or as bash alias fallback.
6. `Integration of CLI/GUI applications` installs all lychee.js Libraries as `/usr/local/bin/lycheejs-*` symlinks or bash aliases fallbacks.
7. (if necessary) `update-desktop-database` or `xdg-desktop-menu forceupdate` is called.

## Update Process

After the installation of all tools are finished, it is time
to execute the [do-update.sh](./do-update.md) script in order
to make sure everything including the runtimes from the
[lycheejs-runtime](../../../lycheejs-runtime) is up to date.

