#!/bin/bash

# XXX: Allow /tmp/lycheejs usage
if [ -z "$LYCHEEJS_ROOT" ]; then

	LYCHEEJS_ROOT="/opt/lycheejs";
	LYCHEEJS_HELPER=`which lycheejs-helper`;

	# XXX: Allow sandboxed usage
	auto_root=$(dirname "$(dirname "$(dirname "$(dirname "$(realpath "$0")")")")");
	if [ "$auto_root" != "$LYCHEEJS_ROOT" ]; then
		LYCHEEJS_ROOT="$auto_root";
		LYCHEEJS_HELPER="$LYCHEEJS_ROOT/bin/helper/helper.sh";
	fi;

else

	LYCHEEJS_HELPER="$LYCHEEJS_ROOT/bin/helper/helper.sh";

fi;


if [ "$LYCHEEJS_HELPER" != "" ]; then

	cd $LYCHEEJS_ROOT;
	export LYCHEEJS_ROOT="$LYCHEEJS_ROOT";
	bash $LYCHEEJS_HELPER env:node ./libraries/harvester/bin/harvester.js "$1" "$2" "$3" "$4";
	exit $?;

else

	exit 1;

fi;

