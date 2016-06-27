#!/bin/bash


USER_WHO=`whoami`;
USER_LOG=`logname`;


LYCHEEJS_ROOT=$(cd "$(dirname "$0")/../../"; pwd);
LYCHEEJS_FOLDER="$LYCHEEJS_ROOT";
LYCHEEJS_BRANCH="development";
LYCHEEJS_CHANGE=$(cd $LYCHEEJS_ROOT && git status --porcelain);


if [ "$USER_WHO" == "root" ]; then

	echo "You are root.";
	echo "Use \"$0\" without sudo.";

	exit 1;

elif [[ "$USER_WHO" == "root" && "$USER_LOG" == "root" ]]; then

	echo "You are root.";
	echo "Please exit su shell and use \"$0\" without sudo.";

	exit 1;

elif [ "$LYCHEEJS_CHANGE" == "" ]; then

	echo "";
	echo "lychee.js Update Tool";
	echo "";
	echo "All your data are belong to us.";
	echo "This tool updates your lychee.js installation.";
	echo "";
	echo "";
	echo "Please select the update channel:";
	echo "";
	echo "Note that our software bots work on and improve";
	echo "the development branch in a minutely cycle.";
	echo "";
	echo "1) development branch";
	echo "   Recommended default setup, more unstable,";
	echo "   more improvements in shorter time spans.";
	echo "";
	echo "2) master branch";
	echo "   Quaterly release cycles, more stable,";
	echo "   long latencies until bug fixes arrive.";
	echo "";

	read -p "Continue (1/2)? " -r

	if [[ $REPLY =~ ^[1]$ ]]; then
		LYCHEEJS_BRANCH="development";
	elif [[ $REPLY =~ ^[2]$ ]]; then
		LYCHEEJS_BRANCH="master";
	else
		exit 1;
	fi;


	cd $LYCHEEJS_FOLDER;
	git checkout $LYCHEEJS_BRANCH;
	git pull origin $LYCHEEJS_BRANCH;


	if [ ! -d $LYCHEEJS_FOLDER/bin/runtime ]; then

		cd $LYCHEEJS_FOLDER;
		git clone --depth 1 --branch master --single-branch https://github.com/Artificial-Engineering/lycheejs-runtime.git ./bin/runtime;

	else

		cd $LYCHEEJS_FOLDER/bin/runtime;
		./bin/update.sh;

	fi;

else

	echo "";
	echo "lychee.js Update Tool";
	echo "";
	echo "Cannot update lychee.js if you have local changes.";
	echo "Please commit changes to prevent merge conflicts.";
	exit 1;

fi;
