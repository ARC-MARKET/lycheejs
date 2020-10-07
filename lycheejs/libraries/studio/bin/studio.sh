#!/bin/bash

# XXX: Allow /tmp/lycheejs usage
if [ -z "$LYCHEEJS_ROOT" ]; then

	LYCHEEJS_ROOT="/opt/lycheejs";
	LYCHEEJS_FERTILIZER=`which lycheejs-fertilizer`;
	LYCHEEJS_HELPER=`which lycheejs-helper`;

	# XXX: Allow sandboxed usage
	auto_root=$(dirname "$(dirname "$(dirname "$(dirname "$(realpath "$0")")")")");
	if [ "$auto_root" != "$LYCHEEJS_ROOT" ]; then
		LYCHEEJS_ROOT="$auto_root";
		LYCHEEJS_FERTILIZER="$LYCHEEJS_ROOT/libraries/fertilizer/bin/fertilizer.sh";
		LYCHEEJS_HELPER="$LYCHEEJS_ROOT/bin/helper/helper.sh";
	fi;

fi;


if [ "$LYCHEEJS_HELPER" != "" ] && [ "$LYCHEEJS_FERTILIZER" != "" ]; then

	cd $LYCHEEJS_ROOT;
	export LYCHEEJS_ROOT="$LYCHEEJS_ROOT";
	bash $LYCHEEJS_FERTILIZER /libraries/studio html-nwjs/main;
	bash $LYCHEEJS_HELPER run:html-nwjs/main /libraries/studio "$1" "$2" "$3" "$4";
	exit $?;

else

	exit 1;

fi;

