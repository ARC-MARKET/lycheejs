
# Filesystem

The lychee.js Engine is installed at `/opt/lycheejs`,
its folder structure looks like this:

- `/opt/lycheejs/bin/*` for Binaries and Helper Scripts.
- `/opt/lycheejs/guides/*` for the lychee.js Guides and Tutorials.
- `/opt/lycheejs/libraries/*` for lychee.js Libraries.
- `/opt/lycheejs/projects/*` for lychee.js Projects.

As the lychee.js Engine can compile and package itself,
there's no other external folder that is relevant to
the Engine.

The only external requirement as of now is the linting
tool `eslint`, which prepares the codebase so that the
parsing overhead for the [lychee.js Strainer](../software/lycheejs-strainer.md)
can stay as simple as possible.

## Git Integration

By default the [.gitignore](/.gitignore) file does only
explicitely track the upstream-maintained Libraries and
Projects.

That means it is recommended to use explicitely `git init`
and an own git repository for each lychee.js Library
or Project that is not part of the lychee.js Engine
Installation.

## Third-party Libraries and Projects

The lychee.js Engine completely supports the usage of
symbolic links, so that it is not necessary to maintain
a Fork of the Engine or a complicated submodule structure.

An external Library or Project can be easily integrated
with a symbolic link:

```bash
# Install a third-party Project
cd /home/$USER/Software;
git clone "https://github.com/some/lycheejs-project.git";

# Track the Project via identifier "/projects/experiment"
cd /opt/lycheejs/projects;
ln -s /home/$USER/Software/lycheejs-project ./experiment;
```

