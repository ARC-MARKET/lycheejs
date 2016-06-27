
# Release Guide for lychee.js

1. [Update lychee.js](#update-lycheejs)
  - [Fix Info.plist files](#todo-for-automation-fix-infoplist-files)
3. [Release lychee.js](#release-lycheejs)


## Update lychee.js

First, the `development` branch is the branch that is
the newest HEAD and gets merged back to `master` with
a single squashed release commit.

To make sure everything is up-to-date, execute the update tool:

```bash
cd /opt/lycheejs;

# You should have been on development already
git checkout development;

./bin/maintenance/do-update.sh;
```


### (TODO for automation) Fix Info.plist files

All OSX Info.plist files contain a `<string>...</string>` tag.
This tag currently is not fixed by the `update.sh` script,
so you have to make sure that every occurance of the name value
is replaced with `__NAME__`.

The two different occurances in the `./bin/runtime/html-nwjs/osx/x86_64/nwjs.app/Contents/Info.plist`
are listed below:

```html
<key>CFBundleDisplayName</key>
<string>__NAME__</string>

<key>CFBundleName</key>
<string>__NAME__</string>
```


## Release lychee.js

The lychee.js Release Tool is a wizard that automatically updates
and creates the quaterly releases for everything including:

- lycheejs (Engine repository)
- lycheejs-runtime (update and publish on github)
- lycheejs-library (publish on NPM and Bower)
- lycheejs-website (rebuild with new lycheejs library)

```bash
cd /opt/lycheejs;

./bin/maintenance/do-release.sh;
```

