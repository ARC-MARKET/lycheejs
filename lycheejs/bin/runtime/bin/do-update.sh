#!/usr/bin/env bash

set -e;


RUNTIME_ROOT=$(cd "$(dirname "$0")/../"; pwd);

ALWAYS_YES="false";

if [ "$1" == "--yes" ] || [ "$1" == "-y" ]; then
	ALWAYS_YES="true";
fi;


for runtime in $RUNTIME_ROOT/* ; do

	if [ -f $runtime/update.sh ]; then

		if [ "$ALWAYS_YES" == "true" ]; then
			$runtime/update.sh --yes;
		else
			$runtime/update.sh;
		fi;
	fi;

done;

