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


if [ ! -d "./bin/editor" ]; then

	if [ -d "./projects/cultivator/editor/build" ]; then
		rm -rf /projects/cultivator/editor/build;
	fi;


	./bin/fertilizer.sh html-nwjs/main /projects/cultivator/editor;


	if [ -d "./projects/cultivator/editor/build/html-nwjs" ]; then

		# 1. Remove previously packaged builds

		rm -rf ./projects/cultivator/editor/build/html-nwjs/main-linux;
		rm -rf ./projects/cultivator/editor/build/html-nwjs/main-osx;
		rm -rf ./projects/cultivator/editor/build/html-nwjs/main-windows;


		# 2. Inject design from cultivator project

		cp -R ./projects/cultivator/design ./projects/cultivator/editor/build/html-nwjs/main/design;


		# Well, fuck you, Apple.
		if [ "$OS" == "osx" ]; then
			sed -i '' 's/\/projects\/cultivator\/design/.\/design/g' ./projects/cultivator/editor/build/html-nwjs/main/index.html;
		else
			sed -i.bak 's/\/projects\/cultivator\/design/.\/design/g' ./projects/cultivator/editor/build/html-nwjs/main/index.html;
			rm ./projects/cultivator/editor/build/html-nwjs/main/index.html.bak;
		fi;


		# 3. Re-package builds

		cd ./bin/runtime/html-nwjs;
		./package.sh /projects/cultivator/editor/build/html-nwjs/main editor;


		# 4. Cache binaries for fast bootup

		cd $LYCHEEJS_ROOT;

		if [ "$OS" == "linux" ]; then
			mv ./projects/cultivator/editor/build/html-nwjs/main-linux ./bin/editor;
		elif [ "$OS" == "osx" ]; then
			mv ./projects/cultivator/editor/build/html-nwjs/main-osx ./bin/editor;
		fi;

		rm -rf ./projects/cultivator/editor/build;

	fi;

fi;


if [ -d "./bin/editor" ]; then

	if [ "$OS" == "linux" ]; then

		./bin/editor/$ARCH/editor.bin "$1";
		exit 0;

	elif [ "$OS" == "osx" ]; then

		open ./bin/editor/$ARCH/editor.app "$1";
		exit 0;

	fi;

fi;

