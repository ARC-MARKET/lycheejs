
# lychee.js Breeder

The `lycheejs-breeder` is a Command-Line Wizard that helps
to create and manage Projects and Libraries that use the
lychee.js Engine stack.

It can be seen as a wizard that eases up annoying copy/paste
actions and that automates configuration of any kind.

The workflow and how it is used is explained in the
[Workflow](../quickstart/workflow.md) chapter.


## Usage

The default action shows the Help with Usage Notes and
Examples.

```bash
# Usage: lycheejs-breeder [Action] [Library/Project/Identifier] [Flag]

cd /opt/lycheejs;

lycheejs-breeder; # show help
```

**Actions**:

- `init` initializes a Project or Library.
- `init [Identifier]` initializes a Definition.
- `fork [Project]` forks a Project or Library.
- `pull [Library]` pulls and isolates a Library.
- `push` pushes and publishes a Project or Library.

**Flags**:

- `--debug` enables debug messages.


## Init a Project

The `init` action creates a new Project or Library using
the Boilerplate. This new Project is fully integrated into
the lychee.js Engine stack, including peer-to-peer networking
and serialization and sandboxing features.

```bash
cd /opt/lycheejs;

mkdir -p ./projects/my-project;
cd ./projects/my-project;

lycheejs-breeder init; # init project
```

## Fork a Project

The `fork` action creates a new Project or Library using
a reference Project as the Boilerplate.

```bash
cd /opt/lycheejs;

cd ./projects/my-project;
lycheejs-breeder fork /projects/boilerplate; # fork project
```

## Init a Definition

The `init` action also creates a new Definition with the
optional `identifier` parameter from a known Composite.

The known Composite can be either a `lychee` Definition
or one of the Project or Library, starting with the same
namespace.

```bash
cd /opt/lycheejs;

cd ./projects/my-project;
lycheejs-breeder init app.net.service.Example; # init definition

cd ./libraries/example;
lycheejs-breeder init example.app.Main; # init definition
```

## Pull a Library

The `pull` action isolates a Library into the Project's
`./libraries` folder so that external dependencies are
included for deployment purposes.

```bash
cd /opt/lycheejs;

cd ./projects/my-project;

lycheejs-breeder pull /libraries/lychee; # pull library
```

In detail, the `pull` action injects also the necessary
code into the `index.html` and `harvester.js` file.

## Push a Project

The `push` action pushes the Project to the lychee.js
Engine DHT (Distributed Hash Table) so that all
[lychee.js Harvester](./lycheejs-harvester.md) instances
across the internet can reuse the Project's or Library's
Definitions.

However, before you push the Project or Library to the
public, you have to agree to publish it via the same
LICENSE as the lychee.js Engine.

```bash
cd /opt/lycheejs;

cd ./projects/my-project;

lycheejs-breeder push; # push project
```

