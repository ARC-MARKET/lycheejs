#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
ARCH=`lowercase \`uname -m\``;
USER_WHO=`whoami`;
USER_LOG=`logname`;


LYCHEEJS_NODE="";
LYCHEEJS_ROOT=$(cd "$(dirname "$0")/../../"; pwd);
LYCHEEJS_VERSION=$(cd $LYCHEEJS_ROOT && cat ./libraries/lychee/source/core/lychee.js | grep VERSION | cut -d\" -f2);



if [ "$OS" == "darwin" ]; then

	OS="osx";

elif [ "$OS" == "linux" ]; then

	OS="linux";

fi;



if [[ "$USER_WHO" != "root" ]]; then

	echo "You are not root.";
	echo "Use \"sudo $0\".";

	exit 1;

elif [[ "$USER_WHO" == "root" && "$USER_LOG" == "root" ]]; then

	echo "You are root.";
	echo "Please exit su shell and use \"sudo $0\".";

	exit 1;

else

	echo "";
	echo "lychee.js Uninstall Tool";
	echo "";
	echo "All your data are belong to us.";
	echo "This tool separates lychee.js from the operating system.";
	echo "";
	echo "No projects are harmed or modified, so after executing this script";
	echo "your lychee.js installation is still available in sandboxed mode.";
	echo "";
	echo "lychee.js Folder:  $LYCHEEJS_ROOT";
	echo "lychee.js Version: $LYCHEEJS_VERSION";
	echo "";

	read -p "Continue (y/n)? " -r

	if [[ $REPLY =~ ^[Yy]$ ]]; then
		echo "";
	else
		exit 1;
	fi;



	if [ "$OS" == "linux" ]; then

		if [ -d /usr/share/applications ]; then

			echo "";
			echo "> Separating GUI Applications";
			echo "";


			rm /usr/share/applications/lycheejs-editor.desktop;
			rm /usr/share/applications/lycheejs-helper.desktop;
			rm /usr/share/applications/lycheejs-ranger.desktop;
			rm /usr/share/icons/lycheejs.svg;


			update_desktop=`which update-desktop-database`;

			if [ "$update_desktop" != "" ]; then
				$update_desktop;
			fi;

			update_desktop=`which xdg-desktop-menu`;

			if [ "$update_desktop" != "" ]; then
				$update_desktop forceupdate;
			fi;


			echo "> DONE";
			echo "";

		fi;

		if [ -d /usr/local/bin ]; then

			echo "";
			echo "> Separating CLI Applications";
			echo "";


			rm /usr/local/bin/lycheejs-breeder 2> /dev/null;
			rm /usr/local/bin/lycheejs-editor 2> /dev/null;
			rm /usr/local/bin/lycheejs-fertilizer 2> /dev/null;
			rm /usr/local/bin/lycheejs-harvester 2> /dev/null;
			rm /usr/local/bin/lycheejs-helper 2> /dev/null;
			rm /usr/local/bin/lycheejs-ranger 2> /dev/null;
			rm /usr/local/bin/lycheejs-strainer 2> /dev/null;


			echo "> DONE";
			echo "";

		fi;

	elif [ "$OS" == "osx" ]; then

		echo "";
		echo "> Separating GUI Applications";
		echo "";
		echo "> DONE";
		echo "";


		if [ -d /usr/local/bin ]; then

			echo "";
			echo "> Separating CLI Applications";
			echo "";


			rm /usr/local/bin/lycheejs-breeder 2> /dev/null;
			rm /usr/local/bin/lycheejs-editor 2> /dev/null;
			rm /usr/local/bin/lycheejs-fertilizer 2> /dev/null;
			rm /usr/local/bin/lycheejs-harvester 2> /dev/null;
			rm /usr/local/bin/lycheejs-helper 2> /dev/null;
			rm /usr/local/bin/lycheejs-ranger 2> /dev/null;
			rm /usr/local/bin/lycheejs-strainer 2> /dev/null;


			echo "> DONE";
			echo "";

		fi;

	fi;

fi;

