
# lycheeJS (v0.8.3)

lycheeJS is a JavaScript Game library that offers a
complete solution for prototyping and deployment
of HTML5 Canvas, WebGL or native OpenGL(ES) or libSDL2
based games inside the Web Browser or native runtimes.

The development process is optimized for Google Chrome
and its developer tools.


## Installation

### 0. Requirements

The *client-side* lycheeJS Engine Stack is supporting
all Operating Systems that can execute JavaScript.

The *server-side* CDN, CI-, Web-, and Websocket Stack though
is only supporting Linux and Mac OSX due to sandboxing and
cross-compilation reasons. Windows also can't support SPDY
and WebSocket extensions without routing issues.

Always remember, there's no client-side and server-side
whatsoever, because all the network components can be used
on either side and peer-to-peer.

### 1. Download

- Download and install the newest stable release of
NodeJS from [nodejs.org](http://nodejs.org).

- Install lycheeJS via [zip-file](https://github.com/LazerUnicorns/lycheeJS/archive/master.zip)
and extract its contents to **~/lycheeJS**.
Make sure the lycheeJS-master folder contained in the
zip-file is renamed to lycheeJS to follow up with the
tutorials.

### 2. Configuration

- The port range 0-1024 is reserved for root user by default.
It is NOT recommended to run nodejs as root user in order to
prevent exploits or remote shell processes. You need to
allow nodejs to bind those ports in production to serve
port 80 successfully without getting the **EACCESS** error.

```bash
user@box:~$ which node;
/usr/bin/node
user@box:~$ sudo setcap cap_net_bind_service=+ep /usr/bin/node;
user@box:~$ sudo getcap /usr/bin/node;
/usr/bin/node = cap_net_bind_service+ep
```

- Navigate to the **~/lycheeJS** folder in Bash and execute
the configure script to build the lycheeJS core.

```bash
cd ~/lycheeJS;
nodejs ./tool/configure.js; # Important: current working directory is lycheeJS root folder
```

### 3. Start Sorbet

- After building the core, you are ready to go. Start Sorbet.

```bash
cd ~/lycheeJS;
npm start;

# Using sorbet itself (identical to npm start):
# nodejs ./tool/Sorbet.js start --profile="./sorbet/profile/localhost.json";
```

- Open your Web Browser and navigate to **http://localhost:8080**
to open the lycheeJS Dashboard. Those games show you how
to develop real cross-platform games and the best practices
in JavaScript code. [Link to projects folder](./projects)

- If you want to add a script to run the webserver forever,
take a look at the *package.json / scripts* section.

```bash
# Don't execute this. It's identical with npm start, but will run forever
# npm run-script localhost
```


## Getting Started

First of all, a project's server is a websocket server, not a webserver.
The best way to get started is to clone the Boilerplate.

```bash
cd ~/lycheeJS/projects;
cp -R ./boilerplate ./myproject; # Replace myproject with a unique name
```

Each project has a unique identifier (e.g. /projects/boilerplate has the
identifier **boilerplate**). A project's folder name is equivalent to
its unique identifier.

This identifier is used to integrate the project with sorbet's remote
debugging and continous integration components. In order to integrate
your project with all these capabilities and the Dashboard, you will
have to modify the game.Main's settings.client property accordingly.

```javascript
  var settings = {
    // ./projects/myproject/source/Main.js#L16
    client: '/api/server?identifier=boilerplate', // Replace boilerplate with correct identifier
  };
```

It is wise to change the identifier of the lychee.Environment
in order to find debugging reports in the remote debugger and the
lycheeJS Dashboard.

```html
  var environment = new lychee.Environment({
    // ./projects/myproject/source/index.html#L48
	id: 'boilerplate', // Replace boilerplate with correct identifier
  });
```


## Documentation

The documentation is available online at [http://lycheejs.org/documentation/](http://lycheejs.org/documentation/).


## Roadmap

You want to see what kind of fancy features will arrive next?
Please take a look at the [ROADMAP.md](ROADMAP.md) file.


## Contribution

You want to contribute to the project?
Please take a look at the [CONTRIBUTING.md](CONTRIBUTING.md) file.


## Other (unsupported) JavaScript Runtimes

The lycheeJS architecture is independent of the environment which
means it will run on any theoretical JavaScript environment.

The only requirement for such a platform is a fully implemented
[bootstrap API](http://lycheejs.org/docs/api-bootstrap.html).

For fully supporting a client-side environment, you will also have to implement
a [lychee.Input](http://lycheejs.org/docs/api-lychee-Input.html),
a [lychee.Renderer](http://lycheejs.org/docs/api-lychee-Renderer.html),
a [lychee.Storage](http://lycheejs.org/docs/api-lychee-Storage.html),
and a [lychee.Viewport](http://lycheejs.org/docs/api-lychee-Viewport.html).

These implementations are fully optional and only necessary if you are using
them inside your Game or App.


## License

The lycheeJS framework is licensed under the MIT License.
The projects and demos are licensed under the CC0 (public domain) License.

