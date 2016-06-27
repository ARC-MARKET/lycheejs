#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
ARCH=`lowercase \`uname -m\``;

LYCHEEJS_NODE="";
LYCHEEJS_ROOT="/opt/lycheejs";


if [ "$ARCH" == "x86_64" -o "$ARCH" == "amd64" ]; then
	ARCH="x86_64";
fi;

if [ "$ARCH" == "i386" -o "$ARCH" == "i686" -o "$ARCH" == "i686-64" ]; then
	ARCH="x86";
fi;

if [ "$ARCH" == "armv7l" -o "$ARCH" == "armv8" ]; then
	ARCH="arm";
fi;


if [ "$OS" == "darwin" ]; then

	OS="osx";
	LYCHEEJS_ROOT=$(cd "$(dirname "$(greadlink -f "$0")")/../"; pwd);
	LYCHEEJS_NODE="$LYCHEEJS_ROOT/bin/runtime/node/osx/$ARCH/node";

elif [ "$OS" == "linux" ]; then

	OS="linux";
	LYCHEEJS_ROOT=$(cd "$(dirname "$(readlink -f "$0")")/../"; pwd);
	LYCHEEJS_NODE="$LYCHEEJS_ROOT/bin/runtime/node/linux/$ARCH/node";

fi;

if [ ! -f $LYCHEEJS_NODE ]; then
	echo "Sorry, your computer is not supported. ($OS / $ARCH)";
	exit 1;
fi;



cd $LYCHEEJS_ROOT;

if [ ! -f "./libraries/lychee/build/node/core.js" ]; then
	$LYCHEEJS_NODE ./bin/configure.js;
fi;



if [ -d "$LYCHEEJS_ROOT/$2" ]; then

	SANDBOX_FLAG="";
	if [ "$3" == "--sandbox" ] || [ "$4" == "--sandbox" ]; then
		SANDBOX_FLAG="--sandbox";
	fi;

	DEBUG_FLAG="";
	if [ "$3" == "--debug" ] || [ "$4" == "--debug" ]; then
		DEBUG_FLAG="--debug";
	fi;


	cd $LYCHEEJS_ROOT;
	$LYCHEEJS_NODE ./bin/fertilizer.js "$1" "$2" "$SANDBOX_FLAG" "$DEBUG_FLAG";

	exit $?;

else

	cd $LYCHEEJS_ROOT;
	$LYCHEEJS_NODE ./bin/fertilizer.js help;

	exit 1;

fi;

