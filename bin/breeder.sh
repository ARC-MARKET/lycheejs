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
	PROJECT_ROOT=$(realpath --relative-to=$LYCHEEJS_ROOT $PWD);

elif [ "$OS" == "linux" ]; then

	OS="linux";
	LYCHEEJS_ROOT=$(cd "$(dirname "$(readlink -f "$0")")/../"; pwd);
	LYCHEEJS_NODE="$LYCHEEJS_ROOT/bin/runtime/node/linux/$ARCH/node";
	PROJECT_ROOT=$(realpath --relative-to=$LYCHEEJS_ROOT $PWD);

elif [ "$OS" == "freebsd" ] || [ "$OS" == "netbsd" ]; then

	# XXX: BSD requires Linux binary compatibility

	OS="bsd";
	LYCHEEJS_ROOT=$(cd "$(dirname "$(readlink -f "$0")")/../"; pwd);
	LYCHEEJS_NODE="$LYCHEEJS_ROOT/bin/runtime/node/linux/$ARCH/node";
	PROJECT_ROOT=$(realpath --relative-to=$LYCHEEJS_ROOT $PWD);

fi;

if [ ! -f $LYCHEEJS_NODE ]; then
	echo "Sorry, your computer is not supported. ($OS / $ARCH)";
	exit 1;
fi;


cd $LYCHEEJS_ROOT;
$LYCHEEJS_NODE ./bin/breeder.js --project=/$PROJECT_ROOT "$1" "$2" "$3" "$4";

exit $?;

