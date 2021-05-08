
# lychee.js Harvester

The `lycheejs-harvester` is a Continous Integration server
that helps to ease up the development of Projects and Libraries
that use the lychee.js Engine stack.

It can be seen as a webserver and peer-to-peer server that
synchronizes the Artificial Intelligence's knowledge, automates
the build, compile, refactor and package pipeline and serves
as a WebSocket server for peers of the Projects or Libraries.


## Usage

The default action shows the Help with Usage Notes and
Examples.

```bash
# Usage: lycheejs-harvester [Action] [Profile] [Flag]

cd /opt/lycheejs;

lycheejs-harvester; # show help
```

**Actions**:

- `start [Profile]` starts the Harvester instance.
- `status` checks whether or not a Harvester instance is running.
- `stop` stops the Harvester instance.

**Profiles**:

The profiles are stored in `/opt/lycheejs/libraries/harvester/profiles`
and the defaulted profiles are `development` and `production`.

Each profile consists of a JSON structure that contains these settings:

```javascript
{
	"host":    "localhost", // host of server
	"port":    8080,        // port of server
	"debug":   true,        // enables debug mode
	"sandbox": true         // enables sandbox mode
}
```

**Flags**:

- `--debug` enables debug messages.
- `--sandbox` sandboxes the instance and disables integration with automation software.


## Start the Harvester

The `start` action boots up the lychee.js Harvester with a
profile that is located in [/libraries/harvester/profiles](/libraries/harvester/profiles).

```bash
cd /opt/lycheejs;

lycheejs-harvester start development; # start development profile
```

## Status the Harvester

The `status` action checks whether or not a lychee.js Harvester
instance is already active.

If a lychee.js Harvester instance is active, it will output a
message with the `(I) harvester: -> Instance active ("[PID]").`
format and exit with the exit code `0`.

If no lychee.js Harvester instance is active, it will output a
message with `(E) harvester: -> Instance inactive.` and exit
with the exit code `1`.

```bash
cd /opt/lycheejs;

lycheejs-harvester status; # check harvester status
# (E) harvester: -> Instance inactive.

# Assuming process PID is 1337
lycheejs-harvester start development;

lycheejs-harvester status; # check harvester status
# (I) harvester: -> Instance active ("1337").
```

# Stop the Harvester

The `stop` action stops a lychee.js Harvester when an instance
is already active.

```bash
cd /opt/lycheejs;

# Assuming process PID is 1337
lycheejs-harvester stop; # stop harvester
# (L) harvester: -> Stopping "1337"
# (I) harvester: -> SUCCESS
```


