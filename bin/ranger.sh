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

if [ ! -f "./libraries/lychee/build/html-nwjs/core.js" ]; then
	$LYCHEEJS_NODE ./bin/configure.js;
fi;



if [ ! -d "./bin/ranger" ]; then

	if [ -d "./projects/cultivator/ranger/build" ]; then
		rm -rf ./projects/cultivator/ranger/build;
	fi;


	./bin/fertilizer.sh html-nwjs/main /projects/cultivator/ranger;


	# Cache binaries for fast bootup

	if [ -d "./projects/cultivator/ranger/build/html-nwjs" ]; then

		cd $LYCHEEJS_ROOT;

		if [ "$OS" == "linux" ]; then
			mv ./projects/cultivator/ranger/build/html-nwjs/main-linux ./bin/ranger;
		elif [ "$OS" == "osx" ]; then
			mv ./projects/cultivator/ranger/build/html-nwjs/main-osx ./bin/ranger;
		fi;

		rm -rf ./projects/cultivator/ranger/build;

	fi;

fi;


if [ -d "./bin/ranger" ]; then

	if [ "$OS" == "linux" ]; then

		./bin/ranger/$ARCH/ranger.bin;
		exit 0;

	elif [ "$OS" == "osx" ]; then

		open ./bin/ranger/$ARCH/ranger.app;
		exit 0;

	fi;

fi;

