
## Projects Folder

This folder contains all projects made with lychee.js. It already
contains many examples and demos that you can open, edit and
manipulate with the lychee.js tools.



### Initialize a Project

You can initialize a project using the `lycheejs-breeder`.
The `lycheejs-breeder` allows to manage your projects and its
libraries as dependencies.


```bash
cd /opt/lycheejs;
mkdir ./projects/my-project;
cd ./projects/my-project;

# Initialize Project Boilerplate
lycheejs-breeder init;
```



### Fork a Project

As every project and library is completely serializable, all
projects can also be libraries and vice versa. Therefore it
is possible to fork projects and work only with a few changes
to its original codebase.


```bash
cd /opt/lycheejs;
mkdir ./projects/my-project;
cd ./projects/my-project;

# Fork the boilerplate project
lycheejs-breeder fork /projects/boilerplate;
```



### Pull (isolate) a Library

If you want to isolate a library locally, you can
pull it to the project folder.

This allows deploying your App to other system where there's
no `lycheejs-harvester` available.

```bash
cd /opt/lycheejs;
cd ./projects/my-project;

# Pull (isolate) the lychee library
lycheejs-breeder pull /libraries/lychee;
```



# RULES for a Project

- All projects must have a `*/main` build target in the `lychee.pkg`
- All projects must have proper `platform` tags if they use platform-specific APIs

