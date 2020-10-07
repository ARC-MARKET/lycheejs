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


PROJECT_ROOT="$PWD";

if [[ "$PROJECT_ROOT" == "$LYCHEEJS_ROOT"/* ]]; then
	PROJECT_ROOT="${PROJECT_ROOT##$LYCHEEJS_ROOT}";
fi;


if [ "$LYCHEEJS_HELPER" != "" ]; then

	cd $LYCHEEJS_ROOT;
	export LYCHEEJS_ROOT="$LYCHEEJS_ROOT";
	bash $LYCHEEJS_HELPER env:node ./libraries/breeder/bin/breeder.js --project=$PROJECT_ROOT "$1" "$2" "$3" "$4";
	exit $?;

else

	exit 1;

fi;

