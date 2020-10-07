#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
USER_WHO=`whoami`;
USER_LOG=`logname 2> /dev/null`;

ARGS=("$1" "$2" "$3" "$4" "$5" "$6");

has_arg() {

	if [[ " ${ARGS[@]} " =~ " ${1} " ]]; then
		echo "true";
	else
		echo "";
	fi;

}



ALWAYS_YES="false";

if [ $(has_arg "-y") ] || [ $(has_arg "--yes") ]; then
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

	echo -e "\e[41m\e[97m";
	echo " (E) You are not root.                             ";
	echo "     Use \"sudo ./bin/maintenance/do-uninstall.sh\". ";
	echo -e "\e[0m";

	exit 1;

elif [ "$OS" == "osx" ] && [ "$USER_WHO" == "root" ] && [ "$USER_LOG" == "root" ]; then

	echo -e "\e[41m\e[97m";
	echo " (E) You are root. Exit su shell and              ";
	echo "     Use \"sudo ./bin/maintenance/do-uninstall.sh\".";
	echo -e "\e[0m";

	exit 1;

else

	if [ "$ALWAYS_YES" != "true" ]; then

		echo " (L) ";
		echo -e "\e[42m\e[97m (I) lychee.js Uninstall Tool \e[0m";
		echo " (L) ";
		echo " (L) All your data are belong to us.                      ";
		echo " (L) This tool separates lychee.js from your system.      ";
		echo " (L) ";
		echo " (L) No projects are harmed or modified by executing this ";
		echo " (L) script. This only removes all system integrations.   ";
		echo " (L) ";
		echo " (L) ";

		read -p " (L) Continue (y/n)? " -r

		if [[ $REPLY =~ ^[Nn]$ ]]; then
			echo -e "\e[41m\e[97m (E) ABORTED \e[0m";
			exit 0;
		elif ! [[ $REPLY =~ ^[Yy]$ ]]; then
			echo -e "\e[41m\e[97m (E) INVALID SELECTION \e[0m";
			exit 1;
		fi;

	fi;



	if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

		if [ -d /usr/share/applications ]; then

			echo " (L) ";
			echo " (L) > Separating GUI applications ...";


			rm /usr/share/applications/lycheejs-helper.desktop 2> /dev/null;
			rm /usr/share/applications/lycheejs-ranger.desktop 2> /dev/null;
			rm /usr/share/applications/lycheejs-studio.desktop 2> /dev/null;
			rm /usr/share/icons/lycheejs.svg                   2> /dev/null;


			update_desktop=`which update-desktop-database`;
			if [ "$update_desktop" != "" ]; then
				echo " (L)   update-desktop-database";
				$update_desktop 1> /dev/null 2> /dev/null;
			fi;

			update_desktop=`which xdg-desktop-menu`;
			if [ "$update_desktop" != "" ]; then
				echo " (L)   xdg-desktop-menu forceupdate";
				$update_desktop forceupdate 1> /dev/null 2> /dev/null;
			fi;


			echo -e "\e[42m\e[97m (I) > SUCCESS \e[0m";

		fi;

		if [ -d /usr/local/bin ]; then

			echo " (L) ";
			echo " (L) > Separating CLI applications ...";


			rm /usr/local/bin/lycheejs-breeder        2> /dev/null;
			rm /usr/local/bin/lycheejs-fertilizer     2> /dev/null;
			rm /usr/local/bin/lycheejs-harvester      2> /dev/null;
			rm /usr/local/bin/lycheejs-helper         2> /dev/null;
			rm /usr/local/bin/lycheejs-ranger         2> /dev/null;
			rm /usr/local/bin/lycheejs-strainer       2> /dev/null;
			rm /usr/local/bin/lycheejs-strainer-fixer 2> /dev/null;
			rm /usr/local/bin/lycheejs-studio         2> /dev/null;


			echo -e "\e[42m\e[97m (I) > SUCCESS \e[0m";

		fi;


		if [ -d /usr/share/bash-completion/completions ]; then

			echo " (L) ";
			echo " (L) > Integrating CLI autocompletions ...";

			rm /usr/share/bash-completion/completions/lycheejs            2> /dev/null;
			rm /usr/share/bash-completion/completions/lycheejs-breeder    2> /dev/null;
			rm /usr/share/bash-completion/completions/lycheejs-fertilizer 2> /dev/null;
			rm /usr/share/bash-completion/completions/lycheejs-harvester  2> /dev/null;
			rm /usr/share/bash-completion/completions/lycheejs-strainer   2> /dev/null;

			echo -e "\e[42m\e[97m (I) > SUCCESS \e[0m";

		elif [ -d /etc/bash_completion.d ]; then

			echo " (L) ";
			echo " (L) > Separating CLI autocompletions ...";

			rm /etc/bash_completion.d/lycheejs 2> /dev/null;

			echo -e "\e[42m\e[97m (I) > SUCCESS \e[0m";

		fi;

	elif [ "$OS" == "osx" ]; then

		echo " (L) ";
		echo " (L) > Separating GUI applications ...";
		echo -e "\e[42m\e[97m (I) > SUCCESS \e[0m";


		if [ -d /usr/local/bin ]; then

			echo " (L) ";
			echo " (L) > Separating CLI applications ...";


			rm /usr/local/bin/lycheejs-breeder        2> /dev/null;
			rm /usr/local/bin/lycheejs-fertilizer     2> /dev/null;
			rm /usr/local/bin/lycheejs-harvester      2> /dev/null;
			rm /usr/local/bin/lycheejs-helper         2> /dev/null;
			rm /usr/local/bin/lycheejs-ranger         2> /dev/null;
			rm /usr/local/bin/lycheejs-strainer       2> /dev/null;
			rm /usr/local/bin/lycheejs-strainer-fixer 2> /dev/null;
			rm /usr/local/bin/lycheejs-studio         2> /dev/null;


			echo -e "\e[42m\e[97m (I) > SUCCESS \e[0m";

		fi;

		if [ -d /etc/bash_completion.d ]; then

			echo " (L) ";
			echo " (L) > Separating CLI autocompletions ...";

			rm /etc/bash_completion.d/lycheejs 2> /dev/null;

			echo -e "\e[42m\e[97m (I) > SUCCESS \e[0m";

		fi;

	fi;

fi;

