
## Libraries Folder

This folder contains all libraries made with lychee.js. It
already contains the core libraries of all lychee.js software
bots but allows the easy deployment and installation of
additional libraries from the `Harvester Cloud`.



### Initialize a Library

You can initialize a library using the `lycheejs-breeder`.
The `lycheejs-breeder` allows to manage your projects and its
libraries as dependencies.


```bash
cd /opt/lycheejs;
mkdir ./libraries/my-library;

# Initialize a Library Boilerplate
cd ./libraries/my-library;
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

# Fork the harvester library
cd ./libraries/my-library;
lycheejs-breeder fork /libraries/harvester;
```



### Push (publish) a Library

If you want to publish a library to the public peer cloud, you
can push them.

This allows others to use your library code and our software
bots to learn from your awesome codebase immediately.

```bash
cd /opt/lycheejs;

# Push (publish) the my-library library
cd ./libraries/my-library;
lycheejs-breeder push;
```


# IMPORTANT

Please read the [Codestyle Guide](../guides/CODESTYLE.md) before
creating a lychee.js Library, so that you benefit from all
automations and conventions.

All conventions are documented in the Project Architecture chapter
of the lychee.js Guide.

Always remember, all libraries can be used as projects and all
projects can be used as libraries.


# Package rules for a Library

- All libraries must have a `*/dist` build target in the `lychee.pkg`
- All libraries must have proper `platform` tags if they use platform-specific APIs

