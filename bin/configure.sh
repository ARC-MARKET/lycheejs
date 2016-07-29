#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
ARCH=`lowercase \`uname -m\``;


LYCHEEJS_NODE="";
LYCHEEJS_ROOT="/opt/lycheejs";
PACKAGE_CMD="";



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
	LYCHEEJS_ROOT=$(cd "$(dirname "$0")/../"; pwd);
	LYCHEEJS_NODE="$LYCHEEJS_ROOT/bin/runtime/node/osx/$ARCH/node";
	LYCHEEJS_NWJS="$LYCHEEJS_ROOT/bin/runtime/html-nwjs/osx/$ARCH/nwjs.app";

elif [ "$OS" == "linux" ]; then

	OS="linux";
	LYCHEEJS_ROOT=$(cd "$(dirname "$0")/../"; pwd);
	LYCHEEJS_NODE="$LYCHEEJS_ROOT/bin/runtime/node/linux/$ARCH/node";
	LYCHEEJS_NWJS="$LYCHEEJS_ROOT/bin/runtime/html-nwjs/linux/$ARCH/nw";

fi;



if [[ "$OS" == "linux" || "$OS" == "osx" ]]; then

	echo "";
	echo "> Building lychee.js core and fertilizers";
	echo "";


	cd $LYCHEEJS_ROOT;


	$LYCHEEJS_NODE ./bin/configure.js;

	if [ "$?" == "0" ]; then

		./bin/fertilizer.sh auto /libraries/lychee;
		# ./bin/fertilizer.sh auto /libraries/breeder;
		./bin/fertilizer.sh auto /libraries/fertilizer;
		./bin/fertilizer.sh auto /libraries/harvester;
		# ./bin/fertilizer.sh auto /libraries/strainer;

		echo "> DONE";
		echo "";

	else

		echo "> FAIL";
		echo "";

		exit 1;

	fi;

fi;


if [[ "$OS" == "linux" || "$OS" == "osx" ]]; then

	echo "";
	echo "> Fixing chmod rights";
	echo "";


	cd $LYCHEEJS_ROOT;



	# Default chmod rights for folders

	find ./libraries -type d -print0 | xargs -0 chmod 777;
	find ./libraries -type f -print0 | xargs -0 chmod 666;

	find ./projects -type d -print0 | xargs -0 chmod 777;
	find ./projects -type f -print0 | xargs -0 chmod 666;



	# Make command line tools explicitely executable

	chmod +x ./libraries/*/harvester.js 2> /dev/null;
	chmod +x ./libraries/*/bin/*.sh     2> /dev/null;
	chmod +x ./projects/*/harvester.js  2> /dev/null;
	chmod +x ./projects/*/bin/*.sh      2> /dev/null;

	chmod 0777 ./bin;
	chmod -R 0777 ./bin/harvester;

	chmod +x ./bin/breeder.js;
	chmod +x ./bin/breeder.sh;
	chmod +x ./bin/configure.js;
	chmod +x ./bin/editor.sh;
	chmod +x ./bin/fertilizer.js;
	chmod +x ./bin/fertilizer.sh;
	chmod +x ./bin/harvester.js;
	chmod +x ./bin/harvester.sh;
	chmod +x ./bin/helper.sh;
	chmod +x ./bin/ranger.sh;
	chmod +x ./bin/strainer.js;
	chmod +x ./bin/strainer.sh;



	# Make runtimes explicitely executable

	if [ -f "$LYCHEEJS_NODE" ]; then
		chmod +x $LYCHEEJS_NODE;
	fi;

	if [ -f "$LYCHEEJS_NWJS" ]; then
		chmod +x $LYCHEEJS_NWJS;
	fi;


	echo "> DONE";
	echo "";

fi;

