#!/bin/bash

LYCHEEJS_ROOT=$(cd "$(dirname "$(readlink -f "$0")")/../../../"; pwd);
LYCHEEJS_HELPER="$LYCHEEJS_ROOT/bin/helper/helper.sh";
PROJECT_ROOT=$(cd "$(dirname "$(readlink -f "$0")")/../"; pwd);
PROJECT_BUILD="$1";


FC_LIST=`which fc-list`;
GIT=`which git`;


if [ "$FC_LIST" != "" ]; then

	cd $PROJECT_ROOT;

	$FC_LIST :lang=en family style > .fc-cache;

	"$LYCHEEJS_HELPER" env:node ./bin/configure-font-cache.js;

	if [ "$GIT" != "" ]; then
		cd $PROJECT_ROOT;
		git update-index --assume-unchanged ./source/ui/entity/input/Font.json;
	fi;


	echo "SUCCESS";
	exit 0;

else

	echo "FAILURE";
	exit 1;

fi;

