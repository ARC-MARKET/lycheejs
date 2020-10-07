
# lychee.js Mono Repository


Important Notes to follow through Installation Quirks:

The [lycheejs-engine](./lycheejs) Repository needs to be installed to the path `/opt/lycheejs`.

Every other lychee.js Project or Library has to be placed inside `/opt/lycheejs/projects/*`.

The [lycheejs-runtime](./lycheejs/bin/runtime) Repository contains all building logic that is required in order to compile, build, transpile and port lychee.js Projects to other platforms and runtimes.

The generated binaries of the `lycheejs-runtime` Repository are contained in the `releases` section of this repository, and the `lycheejs-runtimes.zip` folder reflects the contents of the `./lycheejs-engine/bin/runtime` folder.


## Installation Steps

- Download this repository somewhere.
- Copy the contents of [./lycheejs][./lycheejs] to `/opt/lycheejs` and make it (recursively) writeable for the current user.
- Extract the contents of the `lycheejs-runtime.zip` file from the `releases` section of this repository to `/opt/lycheejs/bin/runtime` and make sure that the binaries are in the correct paths.

After you've completed above steps, do the following:

```bash
cd /opt/lycheejs;

sudo ./bin/maintenance/do-install.sh; # follow the wizard instructions
bash ./bin/configure.sh;

lycheejs-harvester start development;

# Now visit http://localhost:8080 in Chromium
```

