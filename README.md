
# lychee.js (2016-Q1)

brought to you as libre software with joy and pride by [Artificial Engineering](http://artificial.engineering).

Support our libre Bot Cloud via BTC [1CamMuvrFU1QAMebPoDsL3JrioVDoxezY2](bitcoin:1CamMuvrFU1QAMebPoDsL3JrioVDoxezY2?amount=0.5&label=lychee.js%20Support).



## Overview

The following repositories are related to the lychee.js project:

- [lychee.js Bundle](https://github.com/Artificial-Engineering/lycheejs-bundle.git) generates the OS-ready bundles.
- [lychee.js Future](https://github.com/Artificial-Engineering/lycheejs-future.git) contains concepts and ideas not yet finished.
- [lychee.js Library](https://github.com/Artificial-Engineering/lycheejs-library.git) contains the lychee.js Library (for `bower` and `npm`).
- [lychee.js Runtime](https://github.com/Artificial-Engineering/lycheejs-runtime.git) contains all pre-compiled runtimes (fertilizers).
- [lychee.js Website](https://github.com/Artificial-Engineering/lycheejs-website.git) contains the lychee.js website.


lychee.js is a [Next-Gen Isomorphic Application Engine](https://lychee.js.org/#!vision)
that offers a complete solution for prototyping and deployment
of applications. The underlying technology stack does not
matter (HTML5, WebGL, OpenGL, OpenGLES, libSDL) and is
completely automated behind the scenes.

The project aims to ease up and automate the design and
development process of applications through intelligent
software bots that learn from your application code.

The target platforms are described as so-called Fertilizers.
Those Fertilizers cross-compile everything automagically
using a serialized `lychee.Environment` that is setup in
each project's or library's `lychee.pkg` file.


The development process is optimized for Blink-based
browsers (Chromium, Google Chrome, Opera) and their
developer tools.

We honestly recommend NOT using Firefox due to lack of
developer tools, lack of debugging tools and lack of
network performance.


| Target       | Fertilizer                   | Package   | armv7 |  x86  | x86\_64 |
|:-------------|:-----------------------------|:----------|:-----:|:-----:|:-------:|
| Browser      | html                         | zip, html |   ✓   |   ✓   |    ✓    |
| Linux        | html-nwjs, node, node-sdl    | bin       |   ✓   |   ✓   |    ✓    |
| OSX          | html-nwjs, node, node-sdl    | app, bin  |   ✗   |   ✗   |    ✓    |
| Windows      | html-nwjs, node, node-sdl    | exe       |   ✗   |   ✓   |    ✓    |
| Android      | html-webview, node, node-sdl | apk, bin  |   ✓   |   ✓   |    ✓    |
| BlackberryOS | html-webview, node, node-sdl | apk, bin  |   ✓   |   ✓   |    ✓    |
| FirefoxOS    | html-webview                 | zip       |   ✓   |   ✓   |    ✓    |
| iOS          | html                         |           |   ✗   |   ✗   |    ✗    |
| Ubuntu Touch | html-webview, node           | deb, bin  |   ✓   |   ✓   |    ✓    |

The iOS Fertilizer has currently no support for cross-compilation
due to XCode limitations. You can still create an own WebView iOS
app and use the `html` platform adapter.


# Install lychee.js

The lychee.js Bundles (such as Debian package, OSX package or lycheeOS
image) are being deprecated, but can be built by anyone using the
[lychee.js Bundle](https://github.com/Artificial-Engineering/lycheejs-bundle)
repository.

The lychee.js Library (available via `bower` and `npm`) is available
in the [lychee.js Library](https://github.com/Artificial-Engineering/lycheejs-library)
repository.



## Install lychee.js Engine (Developer Machine)

The netinstaller shell script allows to automatically install
the lychee.js Engine on any UNIX-compatible machine (arm, x86 or amd64).

The only requirements beforehand are working `bash`, `git` and `curl`.

```bash
# This will clone lycheejs into /opt/lycheejs

sudo bash -c "$(curl -fsSL https://lychee.js.org/install.sh)";
```

The above commands will look similar to this if everything went fine.

![Install lychee.js](./guides/asset/readme-install.gif)



## Bootup lychee.js Engine (Developer Machine)

After you've installed the lychee.js Engine, you can directly start the `lycheejs-harvester`.

The `./bin/configure.sh` script has to be executed initially one time via `sudo` (not `su`)
in order to compile down all the lychee.js core libraries and to symlink the `lycheejs-`
tools correctly into `/usr/local/bin`.

We try to support as much package managers as possible inside the `./bin/configure.sh`,
but if your package manager isn't supported - please let us know.

If you want a sandboxed installation without the system-wide integration of the `lycheejs-`
tools, you can use the `--sandbox` flag. The sandbox flag can also be used with the harvester
so it does not use any native tools outside the `/opt/lycheejs` folder, which, in return is
faster on slower machines like a Raspberry Pi.

However, the sandbox flag disables auto-testing, auto-documentation, auto-fertilization and
auto-synchronization of all lychee.js libraries and projects.

```bash
cd /opt/lycheejs;

sudo ./bin/configure.sh;              # --sandbox if you want a sandboxed installation
lycheejs-harvester start development; # --sandbox if you want a sandboxed harvester
```

The above commands will look similar to this if everything went fine.

![Bootup lychee.js](./guides/asset/readme-bootup.gif)



## Update lychee.js Engine (Developer Machine)

Every developer can update the lychee.js Engine Installation simply
by using git. The development branch is the most up-to-date branch
and the branch that our software bots are actively working on.

```bash
cd /opt/lycheejs;

# development branch (recommended, but unstable)
git checkout development;
git pull origin development;

# master branch (quarterly release-cycle, more stable)
git checkout master;
git pull origin master;
```



## Guides

These are the guides that should help you to get started as easy as possible.

Please let us know if we can improve anything in these documents [by opening an Issue directly on GitHub](https://github.com/Artificial-Engineering/lycheejs/issues/new).  

- [Contribution Guide](./guides/CONTRIBUTION.md)
- [Codestyle Guide](./guides/CODESTYLE.md)
- [ECMAScript Guide](./guides/ECMASCRIPT.md)
- [Release Guide](./guides/RELEASE.md)


## License

lychee.js is (c) 2012-2016 Artificial-Engineering and released under MIT / Expat license.
The projects and demos are licensed under CC0 (public domain) license.
The runtimes are owned and copyrighted by their respective owners and may be shipped under a different license.

For further details take a look at the [LICENSE.txt](LICENSE.txt) file.

