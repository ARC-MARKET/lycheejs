#!/bin/bash

LYCHEEJS_ROOT="/opt/lycheejs";
LYCHEEJS_HELPER=`which lycheejs-helper`;
PROJECT_ROOT=$(realpath --relative-to=$LYCHEEJS_ROOT $PWD);


if [ "$LYCHEEJS_HELPER" != "" ]; then

	cd $LYCHEEJS_ROOT;

	$LYCHEEJS_HELPER env:node ./libraries/breeder/bin/breeder.js --project=/$PROJECT_ROOT "$1" "$2" "$3" "$4";

	exit $?;

else

	exit 1;

fi;

