#!/bin/bash

RUNTIME_ROOT=$(cd "$(dirname "$0")/"; pwd);

ALWAYS_YES="false";

if [ "$1" == "--yes" ] || [ "$1" == "-y" ]; then
	ALWAYS_YES="true";
fi;



echo "UPDATE html-webview ...";

# Nothing to do for this runtime

echo "SUCCESS";
exit 0;

