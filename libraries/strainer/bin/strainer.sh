#!/bin/bash

LYCHEEJS_ROOT="/opt/lycheejs";
LYCHEEJS_HELPER=`which lycheejs-helper`;


if [ "$LYCHEEJS_HELPER" != "" ]; then

	cd $LYCHEEJS_ROOT;

	$LYCHEEJS_HELPER env:node ./libraries/strainer/bin/strainer.js "$1" "$2" "$3" "$4";

	exit $?;

else

	exit 1;

fi;

