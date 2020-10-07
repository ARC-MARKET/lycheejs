
# lychee.js (2018-Q3)


## Work-in-Progress (aka alpha)

These are the things that we are currently working on:

- lychee.ai.neat (ES/HyperNEAT AI) is being refactored and unstable.
- lychee.js Studio is being extended with Entity/Scene editing features.


## ELI5 - What is lychee.js?

lychee.js is an Application Engine that has the core idea to reuse components
and isomorphic code across all platforms it delivers to. These platforms can
be incremental in its feature support, which means also low-end platforms like
the Arduino variants are supported.

-------------------------------------------------------------------------------

The really only thing lychee.js requires to deliver a platform is a working
`setTimeout(callback, timeout)`, `setInterval(callback, delay)` and an
implemented [Stuff](./libraries/crux/source/platform/html/Stuff.js) data type
that can load files. The shipped officially supported platforms are implemented
by the [lychee.js Crux](./libraries/crux) Library.

The lychee.js Engine delivers to different platforms using so-called
[Fertilizer Adapters](./libraries/lychee/source/platform) which allow feature
detection and automated isomorphic builds from and to every single platform it
supports using the [lychee.js Fertilizer](./libraries/fertilizer).

If a new platform wants full Application support, it requires an implementation
of `lychee.Input`, `lychee.Renderer`, `lychee.Stash`, `lychee.Storage` and
`lychee.Viewport`. If it wants full AI support it additionally requires
`lychee.net.Client`, `lychee.net.Remote` and `lychee.net.Server`.

-------------------------------------------------------------------------------

Underneath the lychee.js Engine has a strong serialization and deserialization
concept that allows simulations and re-simulations across all platforms. Errors
can be reproduced everywhere, even network traffic and user interactions are put
in event graphs and identified and learned by neural networks in order to figure
out what module (in the flow-based programming sense) had corrupt states or data.

The [lychee.ai](./libraries/lychee/source/ai) and [lychee.policy](./libraries/lychee/source/policy)
Stack allow generic plug/play usage and creation of neural networks that can
translate generically _every property_ into vectorized features that neural
networks can understand. As everything in lychee.js is serializable and uses a
Composite Pattern, things like traffic sharding, automated layouting or animation
learning and debugging are inclusive.

The [lychee.js Breeder](./libraries/breeder) is a tool to create new Boilerplates
and allows the reusage of Projects as Libraries and vice versa. Every lychee.js
Project or Library is fully isomorphic and can be forked, modified, back-merged
or included as a Library; which also allows A/B testing new Composites or Definitions
in-place live in any Environment or Simulation.

The [lychee.js Strainer](./libraries/strainer) is a tool that lints your code
and translates the code into a knowledge graph that allows the identification of
enums, events, methods, properties and states that adaptive neural networks can
use in order to automatically learn and generate code based on existing data.

The [lychee.js Harvester](./libraries/harvester) is a peer-to-peer server that
allows the sharing of knowledge across the internet. Every lychee.js Project on
this planet is part of a giant meshnet that helps every other lychee.js instance
to learn and evolve more quickly; and stores the knowledge graph in a DHT (a custom
Kademlia to allow shrinking similar to how gzip dictionaries work using MURMUR
and BENCODE/BITON/JSON under the hood).

The [lychee.js Ranger](./libraries/ranger) is a tool for maintenance of local
or remote lychee.js Harvester instances, to quickly force-restart its watcher
plugins or manage its profiles and started project- or library-specific servers.

The [lychee.js Studio](./libraries/studio) is the idea of a "Zen Coding" like
autocompletion IDE that searches the local knowledge graph to quickly setup a
Project/Library and its Definitions by leveraging both reinforced evolutionary
and bayesian learning techniques.

-------------------------------------------------------------------------------

Oh, and lychee.js can compile, analyze, bugfix and improve itself, too. That's
essentially what the [./bin/configure.sh](./bin/configure.sh) script does when
it builds and distributes the [lychee.js Crux](./libraries/crux) Library and
the [lychee.js Engine](./libraries/lychee) Library.


## Overview

The lychee.js Project started in 2012 and has been developed actively until late 2018.
The following Repositories are related to the lychee.js Engine:

- [lychee.js Experiments](../lycheejs-experiments) contains all lychee.js Experiments and Prototypes.
- [lychee.js Runtime](../lycheejs-runtime) contains all pre-compiled lychee.js Runtimes and Fertilizers.
- [lychee.js Library](../lycheejs-library) contains the lychee.js Library (installable via `bower` and `npm`, forked from `/libraries/lychee`).
- [lychee.js Website](../lycheejs-website) contains the lychee.js Website (hosted at [lychee.js.org](https://lychee.js.org)).
- [lychee.js Future](../lycheejs-future) contains all Concepts and Ideas not yet finished.

The following Accounts are related to the lychee.js Engine:

- [@cookiengineer](https://github.com/cookiengineer) is the core maintainer and founder of this project.
- [@humansneednotapply](https://github.com/humansneednotapply) is the account used by our software bots.


**Features**

The lychee.js Engine aims to deliver Total Automation through
Artificial Intelligence and better Software Architecture.

Everything listed here requires zero lines of code overhead
and is already fully integrated in the [lychee.js Boilerplate](./projects/boilerplate):

The lychee.js Core and Definition System ([lychee.js Crux](/libraries/crux) and [lychee.js Legacy](/libraries/legacy)):

- Isomorphic Application Engine (runs pretty much everywhere)
- Language is only ES2018+ Code, nothing else
- Composite Pattern inspired Entity/Component System
- Definition System embraces Simplicity and Feature Detection
- Sandboxing System embraces automated Error Reports, Analytics and Debugging
- Serialization System allows Re-Simulation on any Platform
- Built-In Offline Storage Management and Network Synchronization

The lychee.js Engine and Software Bots:

- Graphical Asset Management and Entity/Scene Design Tool ([Studio](/libraries/studio))
- Graphical Project Management and Server Maintenance Tool ([Ranger](/libraries/ranger))
- Cross-Platform Compiler Bootstrapping Library ([Crux](/libraries/crux))
- Cross-Platform Application Engine ([Lychee](/libraries/lychee))
- Command-Line Continous Integration Server ([Harvester](/libraries/harvester))
- Command-Line Wizard for Projects and Libraries ([Breeder](/libraries/breeder))
- Command-Line Builder and Cross-Compiler ([Fertilizer](/libraries/fertilizer))
- Command-Line Fuzz-Tester and Code-Refactorer ([Strainer](/libraries/strainer))

Features of the lychee.js Software Bots:

- Automated Code Refactoring, Bug Fixing and Code Improvements
- Automated Design Tracking, Layout and Flow Optimization
- Automated Packaging for Embedded, Console, Mobile, Desktop and Server Apps
- Automated Deployment via git and Live-Updates
- Automated Reactive/Responsive UI/UX Components
- Automated Debugging, Network and UI/UX Flow Analysis
- Automated Testing and Integration with the AI
- Automated Networking (Peer-to-Peer HTTP1.1/2.0 and WS13 with Local/Global Discovery)
- Automated Network Services and Traffic Balancing/Sharding


**Platform / Fertilizer Support**

The target platforms are described as so-called Fertilizers.
Those Fertilizers cross-compile everything automagically
using a serialized `lychee.Environment` that is setup in
each Project's or Library's `lychee.pkg` file.


| Target       | Fertilizer                              | Binary | Package | armv7 |  x86  | x86\_64 |
|:------------:|:---------------------------------------:|:------:|:-------:|:-----:|:-----:|:-------:|
| Web Browser  | html                                    |        |         |   x   |   x   |    x    |
| GNU/Linux    | html-nwjs, nidium, node, node-sdl       |   x    |    x    |   x   |   x   |    x    |
| MacOS        | html-nwjs, nidium, node, node-sdl       |   x    |    x    |       |       |    x    |
| Ubuntu       | html-nwjs, html-webview, node, node-sdl |   x    |    x    |   x   |   x   |    x    |
| Windows      | html-nwjs, node, node-sdl               |   x    |         |       |   x   |    x    |
|:------------:|:---------------------------------------:|:------:|:-------:|:-----:|:-----:|:-------:|
| Android      | html-webview, nidium, node              |   x    |    x    |   x   |   x   |    x    |
| Blackberry   | html-webview, node, node-sdl            |   x    |    x    |   x   |   x   |    x    |
| iOS          | html, nidium                            |        |         |   x   |       |         |
| Ubuntu Touch | html-webview, node, node-sdl            |   x    |    x    |   x   |   x   |    x    |
|:------------:|:---------------------------------------:|:------:|:-------:|:-----:|:-----:|:-------:|

Explanations of Target Matrix:

- The `Binary` column describes whether there is a native binary built.
- The `Package` column describes whether there is a native package built.
- The CPU architecture columns describe the target architecture, the host architecture is `x86_64` for all external SDKs.

The `iOS` target currently cannot be delivered to via external SDK on a `Linux` development host; however
it is still possible to create a WebView-using App and use the `html` platform as a fertilizer target.
Alternatively, advanced users are encouraged to use the `nidium` runtime on iOS and MacOS.


## Quickstart Guide

If you want to install the lychee.js Engine, the best way to do
so is to follow through the [Quickstart Guide](/guides/quickstart).

```bash
# Install lychee.js Engine into /opt/lycheejs
sudo bash -c "$(curl -fsSL https://lychee.js.org/install.sh)";
```

![Installation CLI Animation](./guides/quickstart/asset/installation.svg)


## License

The lychee.js Runtimes (defined as `/bin/runtime` or the lycheejs-runtime
folder) are owned and copyrighted by their respective owners and those
may be shipped under a different license.

As of now, the runtimes are licensed under the following terms:

- MIT license for `node` platform (node.js)
- MIT license for `html-nwjs` platform (nw.js)
- MIT license for `html-webview` platform and (c) 2012-2018 Cookie Engineer
- Apache license for Android SDK toolchain

----------

The lychee.js Engine is released under the [GNU GPL 3](./LICENSE_GPL3.txt) license.

The owner of the AI-generated code has to be a legal as of today, and therefore has to
be a human person ([@cookiengineer](https://github.com/cookiengineer)) under European law
and the [Directive 2006/116/EC](http://eur-lex.europa.eu/LexUriServ/LexUriServ.do?uri=OJ:L:2006:372:0012:0018:EN:PDF) (p.14 and Art. 1 p.4).

Hereby [@cookiengineer](https://github.com/cookiengineer) grants you permission
to reuse the generated code by the Artificial Intelligence under above terms.

You are not allowed to change those terms without [@cookiengineer](https://github.com/cookiengineer)'s
consent.

