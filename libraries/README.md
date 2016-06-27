
## Libraries Folder

This folder contains all libraries made with lychee.js. It
already contains the core libraries of all lychee.js software
bots but allows the easy deployment and installation of
additional libraries from the `Bot Peer Cloud`.

The libraries of the lychee.js ecosystem and the automatic
build/deploy/test system is available at [harvester.artificial.engineering](https://harvester.artificial.engineering).



### Initialize a Library

You can initialize a library using the `lycheejs-breeder`.
The `lycheejs-breeder` allows to manage your projects and its
libraries as dependencies.


```bash
cd /opt/lycheejs;
mkdir ./libraries/my-library;
cd ./libraries/my-library;

# Initialize a Library Boilerplate
lycheejs-breeder init;
```



### Fork a Library

As every project and library is completely serializable, all
projects can also be libraries and vice versa. Therefore it
is possible to fork projects and work only with a few changes
to its original codebase.


```bash
cd /opt/lycheejs;
mkdir ./libraries/my-library;
cd ./libraries/my-library;

# Fork the harvester library
lycheejs-breeder fork /libraries/harvester;
```



### Push (publish) a Library

If you want to publish a library to the public peer cloud, you
can push them.

This allows others to use your library code and our software
bots to learn from your awesome codebase immediately.

```bash
cd /opt/lycheejs;
cd ./libraries/my-library;

# Push (publish) the my-library library
lycheejs-breeder push;
```



# RULES for a Library

- All libraries must have a `*/dist` build target in the `lychee.pkg`
- All libraries must have proper `platform` tags if they use platform-specific APIs

