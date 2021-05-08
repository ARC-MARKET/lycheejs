
# lychee.js Mono Repository


Important Notes to follow through Installation Quirks:

The [lycheejs-engine](./lycheejs) Repository needs to be installed to the path `/opt/lycheejs`.

Every other lychee.js Project or Library has to be placed inside `/opt/lycheejs/projects/*`.

The [lycheejs-runtime](./lycheejs/bin/runtime) Repository contains all building logic that is required
in order to compile, build, transpile and port lychee.js Projects to other platforms and runtimes.

The generated binaries of the `lycheejs-runtime` Repository are contained in the `releases` section of
this repository, and the `lycheejs-runtimes.zip` folder reflects the contents of the
`./lycheejs-engine/bin/runtime` folder. As the Repositories and related Web Services/Networks/Servers
are no longer available, please use only the scripts and files from this Mono Repository to make things
work as expected.


## Installation

More detailed instructions of the Installation Procedure are documented
in the [Quickstart's Installation Guide](./lycheejs/guides/quickstart/installation.md).

```bash
# install lychee.js Engine into /opt/lycheejs
sudo mkdir -m 0777 /opt/lycheejs;
git clone https://github.com/cookiengineer/lycheejs;


cd /opt/lycheejs;

# install and update dependencies
sudo ./bin/maintenance/do-install.sh;
sudo ./bin/runtime/do-update.sh;

# rebuild and start
bash ./bin/configure.sh;
lycheejs-harvester start development;

# Now visit http://localhost:8080 in Chromium
```

