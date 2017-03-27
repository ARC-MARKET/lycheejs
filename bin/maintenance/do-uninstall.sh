#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
ARCH=`lowercase \`uname -m\``;
USER_WHO=`whoami`;
USER_LOG=`logname 2> /dev/null`;


ALWAYS_YES="false";

if [ "$1" == "--yes" ] || [ "$1" == "-y" ]; then
	ALWAYS_YES="true";
fi;



if [ "$OS" == "darwin" ]; then

	OS="osx";

elif [ "$OS" == "linux" ]; then

	OS="linux";

elif [ "$OS" == "freebsd" ] || [ "$OS" == "netbsd" ]; then

	OS="bsd";

fi;



if [ "$USER_WHO" != "root" ]; then

	echo "You are not root.";
	echo "Use \"sudo $0\".";

	exit 1;

elif [ "$OS" == "osx" ] && [ "$USER_WHO" == "root" ] && [ "$USER_LOG" == "root" ]; then

	echo "You are root.";
	echo "Please exit su shell and use \"sudo $0\".";

	exit 1;

else

	if [ "$ALWAYS_YES" != "true" ]; then

		echo "";
		echo -e "\e[37m\e[42m lychee.js Uninstall Tool \e[0m";
		echo "";
		echo " All your data are belong to us.                           ";
		echo " This tool separates lychee.js from the operating system.  ";
		echo "                                                           ";
		echo " No projects are harmed or modified by executing this      ";
		echo " script. This will only remove all software packages.      ";
		echo "                                                           ";

		read -p "Continue (y/n)? " -r

		if [[ $REPLY =~ ^[Yy]$ ]]; then
			echo "";
		else
			echo "";
			exit 1;
		fi;

	fi;



	if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

		if [ -d /usr/share/applications ]; then

			echo "";
			echo "> Separating GUI Applications";
			echo "";


			rm /usr/share/applications/lycheejs-helper.desktop 2> /dev/null;
			rm /usr/share/applications/lycheejs-ranger.desktop 2> /dev/null;
			rm /usr/share/applications/lycheejs-studio.desktop 2> /dev/null;
			rm /usr/share/icons/lycheejs.svg                   2> /dev/null;


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


			rm /usr/local/bin/lycheejs-breeder    2> /dev/null;
			rm /usr/local/bin/lycheejs-fertilizer 2> /dev/null;
			rm /usr/local/bin/lycheejs-harvester  2> /dev/null;
			rm /usr/local/bin/lycheejs-helper     2> /dev/null;
			rm /usr/local/bin/lycheejs-ranger     2> /dev/null;
			rm /usr/local/bin/lycheejs-strainer   2> /dev/null;
			rm /usr/local/bin/lycheejs-studio     2> /dev/null;


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


			rm /usr/local/bin/lycheejs-breeder    2> /dev/null;
			rm /usr/local/bin/lycheejs-fertilizer 2> /dev/null;
			rm /usr/local/bin/lycheejs-harvester  2> /dev/null;
			rm /usr/local/bin/lycheejs-helper     2> /dev/null;
			rm /usr/local/bin/lycheejs-ranger     2> /dev/null;
			rm /usr/local/bin/lycheejs-strainer   2> /dev/null;
			rm /usr/local/bin/lycheejs-studio     2> /dev/null;


			echo "> DONE";
			echo "";

		fi;

	fi;

fi;

