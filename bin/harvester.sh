#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
ARCH=`lowercase \`uname -m\``;

LYCHEEJS_NODE="";
LYCHEEJS_ROOT="/opt/lycheejs";
HARVESTER_PID="$LYCHEEJS_ROOT/bin/harvester.pid";
HARVESTER_LOG="/var/log/lycheejs-harvester.log";
HARVESTER_ERR="/var/log/lycheejs-harvester.err";
HARVESTER_USER=`whoami`;


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



case "$1" in

	start)

		SANDBOX_FLAG="";
		if [ "$3" == "--sandbox" ] || [ "$4" == "--sandbox" ]; then
			SANDBOX_FLAG="--sandbox";
		fi;

		DEBUG_FLAG="";
		if [ "$3" == "--debug" ] || [ "$4" == "--debug" ]; then
			DEBUG_FLAG="--debug";
		fi;


		cd $LYCHEEJS_ROOT;

		if [ "$HARVESTER_USER" == "root" ] || [ "$HARVESTER_USER" == "lycheejs-harvester" ]; then
			$LYCHEEJS_NODE ./bin/harvester.js start "$2" "$SANDBOX_FLAG" "$DEBUG_FLAG" >> $HARVESTER_LOG 2>> $HARVESTER_ERR
		else
			$LYCHEEJS_NODE ./bin/harvester.js start "$2" "$SANDBOX_FLAG" "$DEBUG_FLAG"
		fi;

	;;

	status)

		if [ -f "$HARVESTER_PID" ]; then

			harvester_pid=$(cat $HARVESTER_PID);
			harvester_status=$(ps -e | grep $harvester_pid | grep -v grep);

			if [ "$harvester_status" != "" ]; then
				echo -e "Running";
				exit 0;
			else
				echo -e "Not running";
				exit 1;
			fi;

		else

			echo -e "Not running";
			exit 1;

		fi;

	;;

	stop)

		cd $LYCHEEJS_ROOT;

		$LYCHEEJS_NODE ./bin/harvester.js stop;

	;;

	restart)

		SANDBOX_FLAG="";
		if [ "$3" == "--sandbox" ]; then
			SANDBOX_FLAG="--sandbox";
		fi;


		cd $LYCHEEJS_ROOT;

		$LYCHEEJS_NODE ./bin/harvester.js stop;

		if [ "$HARVESTER_USER" == "root" ] || [ "$HARVESTER_USER" == "lycheejs-harvester" ]; then
			$LYCHEEJS_NODE ./bin/harvester.js start "$2" "$SANDBOX_FLAG" >> $HARVESTER_LOG 2>> $HARVESTER_ERR
		else
			$LYCHEEJS_NODE ./bin/harvester.js start "$2" "$SANDBOX_FLAG"
		fi;

	;;

	*)

		cd $LYCHEEJS_ROOT;

		$LYCHEEJS_NODE ./bin/harvester.js help;

	;;

esac;

