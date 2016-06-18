#!/bin/bash

_get_version () {

	local year=`date +%Y`;
	local month=`date +%m`;
	local version="";

	if [ $month -gt "09" ]; then
		version="$year-Q4";
	elif [ $month -gt "06" ]; then
		version="$year-Q3";
	elif [ $month -gt "03" ]; then
		version="$year-Q2";
	else
		version="$year-Q1";
	fi;

	echo $version;

}

USER_WHO=`whoami`;
USER_LOG=`logname`;


LYCHEEJS_ROOT=$(cd "$(dirname "$0")/../../"; pwd);
LYCHEEJS_FOLDER="/tmp/lycheejs";
LYCHEEJS_BRANCH=$(cd $LYCHEEJS_ROOT && git symbolic-ref HEAD 2>/dev/null | cut -d"/" -f 3);
OLD_VERSION=$(cd $LYCHEEJS_ROOT && cat ./libraries/lychee/source/core/lychee.js | grep VERSION | cut -d\" -f2);
NEW_VERSION=$(_get_version);


NPM_BIN=`which npm`;


if [ "$NPM_BIN" == "" ]; then
	echo "Please install NPM first.";
	exit 1;
fi;


if [ "$USER_WHO" == "root" ]; then

	echo "You are root.";
	echo "Use \"$0\" without sudo.";

	exit 1;

elif [[ "$USER_WHO" == "root" && "$USER_LOG" == "root" ]]; then

	echo "You are root.";
	echo "Please exit su shell and use \"$0\" without sudo.";

	exit 1;

elif [ "$OLD_VERSION" != "$NEW_VERSION" ]; then

	echo "";
	echo "lychee.js Release Tool";
	echo "";
	echo "All your data are belong to us.";
	echo "This tool creates a new lychee.js release.";
	echo "";
	echo "You need to be member of the Artificial-Engineering";
	echo "organization and you will be questioned again when";
	echo "the release is ready for publishing.";
	echo "";
	echo "lychee.js Folder: $LYCHEEJS_FOLDER";
	echo "lychee.js Branch: $LYCHEEJS_BRANCH";
	echo "";
	echo "Old lychee.js version: $OLD_VERSION";
	echo "New lychee.js version: $NEW_VERSION";
	echo "";

	read -p "Continue (y/n)? " -r

	if [[ $REPLY =~ ^[Yy]$ ]]; then
		echo "";
	else
		exit 1;
	fi;



	#
	# INIT lycheejs
	#

	if [ -d $LYCHEEJS_FOLDER ]; then
		rm -rf $LYCHEEJS_FOLDER;
	fi;

	mkdir $LYCHEEJS_FOLDER;
	git clone git@github.com:Artificial-Engineering/lycheejs.git $LYCHEEJS_FOLDER;

	mkdir $LYCHEEJS_FOLDER/bin/runtime;
	git clone --single-branch --branch master --depth 1 git@github.com:Artificial-Engineering/lycheejs-runtime.git $LYCHEEJS_FOLDER/bin/runtime;


	cd $LYCHEEJS_FOLDER;
	git checkout development;

	sed -i 's|2[0-9][0-9][0-9]-Q[1-4]|'$NEW_VERSION'|g' ./README.md;
	sed -i 's|2[0-9][0-9][0-9]-Q[1-4]|'$NEW_VERSION'|g' ./libraries/lychee/source/core/lychee.js;

	git add ./README.md;
	git add ./libraries/lychee/source/core/lychee.js;
	git commit -m "lychee.js $NEW_VERSION release";


	cd $LYCHEEJS_FOLDER;
	$LYCHEEJS_FOLDER/bin/configure.sh --sandbox;



	#
	# BUILD AND UPDATE lycheejs-runtime
	#

	cd $LYCHEEJS_FOLDER/bin/runtime;
	./bin/update.sh;

	rm -rf .git/;
	git init;
	git remote add origin git@github.com:Artificial-Engineering/lycheejs-runtime.git;
	git add ./;
	git commit -m "lychee.js $NEW_VERSION release";



	#
	# BUILD lycheejs-library
	#

	cd $LYCHEEJS_FOLDER;
	git clone --single-branch --branch master git@github.com:Artificial-Engineering/lycheejs-library.git $LYCHEEJS_FOLDER/projects/lycheejs-library;

	cd $LYCHEEJS_FOLDER/projects/lycheejs-library;
	./bin/build.sh;



	#
	# BUILD AND PACKAGE lycheejs-website
	#

	cd $LYCHEEJS_FOLDER;
	git clone --single-branch --branch master git@github.com:Artificial-Engineering/lycheejs-website.git $LYCHEEJS_FOLDER/projects/lycheejs-website;
	$LYCHEEJS_FOLDER/bin/fertilizer.sh html/main /projects/lycheejs-website;



	echo "";
	echo "Somebody set us up the bomb.";
	echo "";
	echo "If no error occured, you can push the lychee.js release to GitHub now.";
	echo "";
	echo "WARNING: This is irreversible.";
	echo "WARNING: It is wise to manually check /tmp/lycheejs now.";
	echo "";

	read -p "Continue (y/n)? " -r

	if [[ $REPLY =~ ^[Yy]$ ]]; then
		echo "";
	else
		exit 1;
	fi;



	#
	# PACKAGE lycheejs
	#

	cd $LYCHEEJS_FOLDER;
	git push origin development;
	git checkout master;
	git merge --squash development;
	git commit -m "lychee.js $NEW_VERSION release";
	git push origin master;



	#
	# PACKAGE lycheejs-runtime
	#

	cd $LYCHEEJS_FOLDER/bin/runtime;
	git push origin master -f;



	#
	# PACKAGE lycheejs-library
	#

	cd $LYCHEEJS_FOLDER/projects/lycheejs-library;
	./bin/package.sh;

else

	echo "lychee.js Release for $NEW_VERSION already done.";
	exit 0;

fi;
