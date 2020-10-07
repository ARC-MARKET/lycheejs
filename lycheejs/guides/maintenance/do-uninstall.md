
# Do-Uninstall Guide

This uninstall guide will explain what goes on behind
the scenes regarding a lychee.js Engine installation.

It can be seen as documentation that contributors
or users can follow through in case they want to
uninstall their lychee.js Engine installation for
whatever reason.


## Usage

```bash
cd /opt/lycheejs;

# Necessary pretty much everywhere, even with System Integrity Protection
# It will use the normal user ($SUDO_USER) as often as possible.
sudo bash ./bin/maintenance/do-uninstall.sh;
```

**Flags**:

- `-y` or `--yes` skips dialogs and assumes yes for all questions.

## Uninstallation Process

On `Linux` and `BSD` variants:

1. `Remove GUI integrations` removes all `/usr/share/applications/lycheejs-*.desktop` files.
2. `Remove CLI integrations` removes all `/usr/local/bin/lycheejs-*` files.
3. `Remove bash completions` removes all `/usr/share/bash-completion/completions/lycheejs-*` and `/etc/bash_completion.d/lycheejs*` files.

On `MacOS`:

1. `Remove CLI integrations` removes all `/usr/local/bin/lycheejs-*` files.
2. `Remove bash completions` removes all `/etc/bash_completion.d/lycheejs*` files.


## Important Note

The [do-install.sh](/bin/maintenance/do-install.sh) script has an intelligent
fallback that uses `bash aliases` in the current user's `.bashrc` file for the
`lycheejs-*` tools in case that the `/usr/local/bin` folder is not writeable
or not existing.

For safety reasons, the current user's `.bashrc` file is untouched when executing
the `do-uninstall.sh` script. In this case the equivalent lines (at the bottom
of the file) need to be manually removed.

