#!/bin/bash

LYCHEEJS_ROOT="/opt/lycheejs";
LYCHEEJS_HELPER=`which lycheejs-helper`;


# XXX: Allow /tmp/lycheejs usage
if [ "$(basename $PWD)" == "lycheejs" ] && [ "$PWD" != "$LYCHEEJS_ROOT" ]; then
	LYCHEEJS_ROOT="$PWD";
	LYCHEEJS_HELPER="$PWD/bin/helper/helper.sh";
# XXX: Allow /home/whatever/my-project usage
elif [ "$PWD" != "$LYCHEEJS_ROOT" ]; then
	export STRAINER_CWD="$PWD";
fi;


if [ "$LYCHEEJS_HELPER" != "" ]; then

	cd $LYCHEEJS_ROOT;

	bash $LYCHEEJS_HELPER env:node ./libraries/strainer/bin/strainer-fixer.js "$1" "$2" "$3" "$4";

	exit $?;

else

	exit 1;

fi;

