#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
ARCH=`lowercase \`uname -m\``;
USER_WHO=`whoami`;
USER_LOG=`logname 2> /dev/null`;


LYCHEEJS_NODE="";
LYCHEEJS_ROOT=$(cd "$(dirname "$0")/../../"; pwd);
LYCHEEJS_VERSION=$(cd $LYCHEEJS_ROOT && cat ./libraries/lychee/source/core/lychee.js | grep VERSION | cut -d\" -f2);



_install() {

	cmd="$1";
	echo -e "\t$cmd";
	$cmd 2>&1 > /dev/null;

	if [ "$?" == "0" ]; then
		return 0;
	else
		return 1;
	fi;

}



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
	echo "lychee.js Install Tool";
	echo "";
	echo "All your data are belong to us.";
	echo "This tool integrates lychee.js with the operating system.";
	echo "";
	echo "No projects are harmed or modified, so after executing this script";
	echo "your lychee.js installation is still available in sandboxed mode.";
	echo "";
	echo "Please select the installation channel:";
	echo "";
	echo "1) minimal + optional dependencies";
	echo "   Required for mobile device support.";
	echo "";
	echo "2) minimal dependencies";
	echo "   No mobile device support.";
	echo "";

	read -p "Continue (1/2)? " -r

	if [[ $REPLY =~ ^[1]$ ]]; then
		SELECTION="optional";
	elif [[ $REPLY =~ ^[2]$ ]]; then
		SELECTION="required";
	else
		exit 1;
	fi;



	if [ "$OS" == "linux" ]; then

		if [[ -x "/usr/bin/apt-get" ]]; then
			REQUIRED_LIST="bash binutils binutils-multiarch coreutils icnsutils sed zip unzip tar curl git";
			REQUIRED_CMD="apt-get -y install $REQUIRED_LIST";
			OPTIONAL_LIST="openjdk-8-jdk libc6-i386 lib32stdc++6 lib32ncurses5 lib32z1";
			OPTIONAL_CMD="apt-get -y install $OPTIONAL_LIST";
		elif [[ -x "/usr/bin/dnf" ]]; then
			REQUIRED_LIST="bash binutils binutils-arm-linux-gnu binutils-x86_64-linux-gnu coreutils libicns-utils sed zip unzip tar curl git";
			REQUIRED_CMD="dnf -y install $REQUIRED_LIST";
		elif [[ -x "/usr/bin/yum" ]]; then
			REQUIRED_LIST="bash binutils binutils-arm-linux-gnu binutils-x86_64-linux-gnu coreutils libicns-utils sed zip unzip tar curl git";
			REQUIRED_CMD="yum --setopt=alwaysprompt=no install $REQUIRED_LIST";
			OPTIONAL_LIST="glibc.i686 libstdc++.i686 ncurses.i686 zlib.i686";
			OPTIONAL_CMD="yum --setopt=alwaysprompt=no install $OPTIONAL_LIST";
		elif [[ -x "/usr/bin/pacman" ]]; then
			REQUIRED_LIST="bash binutils arm-none-eabi-binutils coreutils libicns sed zip unzip tar curl git";
			REQUIRED_CMD="pacman -S --noconfirm $REQUIRED_LIST";
			OPTIONAL_LIST="lib32-glibc lib32-libstdc++5 lib32-ncurses lib32-zlib";
			OPTIONAL_CMD="pacman -S --noconfirm $OPTIONAL_LIST";
		elif [[ -x "/usr/bin/zypper" ]]; then
			REQUIRED_LIST="bash binutils coreutils icns-utils sed zip unzip tar curl git";
			REQUIRED_CMD="zypper --non-interactive install $REQUIRED_LIST";
			OPTIONAL_LIST="glibc-32bit libstdc++6-32bit libncurses5-32bit libz1-32bit";
			OPTIONAL_CMD="zypper --non-interactive install $OPTIONAL_LIST";
		fi;

	elif [ "$OS" == "osx" ]; then

		if [[ -x "/usr/local/bin/brew" ]]; then
			REQUIRED_LIST="binutils coreutils libicns gnu-sed gnu-tar curl git";
			REQUIRED_CMD="sudo -u $USER_LOG brew install $REQUIRED_LIST --with-default-names";
		elif [[ -x "/opt/local/bin/port" ]]; then
			REQUIRED_LIST="binutils coreutils libicns gsed zip unzip gnutar curl git";
			REQUIRED_CMD="port install $REQUIRED_LIST";
		fi;

	fi;



	if [ "$REQUIRED_CMD" != "" ]; then

		echo "> Installing required dependencies ...";

		_install "$REQUIRED_CMD";

		if [ $? -eq 0 ]; then
			echo "> DONE";
		else
			echo "> FAIL";
		fi;

	elif [ "$REQUIRED_CMD" == "" ]; then

		echo "";
		echo "Your system is not officially supported.";
		echo "Feel free to modify this script to support your system!";
		echo "";
		echo "Also, please let us know about this at https://github.com/Artificial-Engineering/lycheejs/issues";
		echo "";

		exit 1;

	fi;

	if [[ "$OPTIONAL_CMD" != "" && "$SELECTION" == "optional" ]]; then

		echo "> Installing optional dependencies ...";

		_install "$OPTIONAL_CMD";

		if [ $? -eq 0 ]; then
			echo "> DONE";
		else
			echo "> FAIL";
		fi;

	fi;



	if [ "$OS" == "linux" ]; then

		if [ -d /usr/share/applications ]; then

			echo "";
			echo "> Integrating GUI Applications";
			echo "";


			cp ./bin/helper/linux/editor.desktop /usr/share/applications/lycheejs-editor.desktop;
			cp ./bin/helper/linux/helper.desktop /usr/share/applications/lycheejs-helper.desktop;
			cp ./bin/helper/linux/ranger.desktop /usr/share/applications/lycheejs-ranger.desktop;
			cp ./bin/helper/linux/lycheejs.svg /usr/share/icons/lycheejs.svg;

			sed -i 's|__ROOT__|'$LYCHEEJS_ROOT'|g' "/usr/share/applications/lycheejs-editor.desktop";
			sed -i 's|__ROOT__|'$LYCHEEJS_ROOT'|g' "/usr/share/applications/lycheejs-helper.desktop";
			sed -i 's|__ROOT__|'$LYCHEEJS_ROOT'|g' "/usr/share/applications/lycheejs-ranger.desktop";


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
			echo "> Integrating CLI Applications";
			echo "";


			rm /usr/local/bin/lycheejs-breeder 2> /dev/null;
			rm /usr/local/bin/lycheejs-editor 2> /dev/null;
			rm /usr/local/bin/lycheejs-fertilizer 2> /dev/null;
			rm /usr/local/bin/lycheejs-harvester 2> /dev/null;
			rm /usr/local/bin/lycheejs-helper 2> /dev/null;
			rm /usr/local/bin/lycheejs-ranger 2> /dev/null;
			rm /usr/local/bin/lycheejs-strainer 2> /dev/null;

			ln -s "$LYCHEEJS_ROOT/bin/breeder.sh" /usr/local/bin/lycheejs-breeder;
			ln -s "$LYCHEEJS_ROOT/bin/editor.sh" /usr/local/bin/lycheejs-editor;
			ln -s "$LYCHEEJS_ROOT/bin/fertilizer.sh" /usr/local/bin/lycheejs-fertilizer;
			ln -s "$LYCHEEJS_ROOT/bin/harvester.sh" /usr/local/bin/lycheejs-harvester;
			ln -s "$LYCHEEJS_ROOT/bin/helper.sh" /usr/local/bin/lycheejs-helper;
			ln -s "$LYCHEEJS_ROOT/bin/ranger.sh" /usr/local/bin/lycheejs-ranger;
			ln -s "$LYCHEEJS_ROOT/bin/strainer.sh" /usr/local/bin/lycheejs-strainer;


			echo "> DONE";
			echo "";

		fi;

	elif [ "$OS" == "osx" ]; then

		echo "";
		echo "> Integrating GUI Applications";
		echo "";


		open ./bin/helper/osx/helper.app;


		echo "> DONE";
		echo "";


		if [ -d /usr/local/bin ]; then

			echo "";
			echo "> Integrating CLI Applications";
			echo "";


			# Well, fuck you, Apple.
			if [ ! -f /usr/local/bin/png2icns ]; then
				cp "$LYCHEEJS_ROOT/bin/helper/osx/png2icns.sh" /usr/local/bin/png2icns;
				chmod +x /usr/local/bin/png2icns;
			fi;


			rm /usr/local/bin/lycheejs-breeder 2> /dev/null;
			rm /usr/local/bin/lycheejs-editor 2> /dev/null;
			rm /usr/local/bin/lycheejs-fertilizer 2> /dev/null;
			rm /usr/local/bin/lycheejs-harvester 2> /dev/null;
			rm /usr/local/bin/lycheejs-helper 2> /dev/null;
			rm /usr/local/bin/lycheejs-ranger 2> /dev/null;
			rm /usr/local/bin/lycheejs-strainer 2> /dev/null;

			ln -s "$LYCHEEJS_ROOT/bin/breeder.sh" /usr/local/bin/lycheejs-breeder;
			ln -s "$LYCHEEJS_ROOT/bin/editor.sh" /usr/local/bin/lycheejs-editor;
			ln -s "$LYCHEEJS_ROOT/bin/fertilizer.sh" /usr/local/bin/lycheejs-fertilizer;
			ln -s "$LYCHEEJS_ROOT/bin/harvester.sh" /usr/local/bin/lycheejs-harvester;
			ln -s "$LYCHEEJS_ROOT/bin/helper.sh" /usr/local/bin/lycheejs-helper;
			ln -s "$LYCHEEJS_ROOT/bin/ranger.sh" /usr/local/bin/lycheejs-ranger;
			ln -s "$LYCHEEJS_ROOT/bin/strainer.sh" /usr/local/bin/lycheejs-strainer;


			echo "> DONE";
			echo "";

		fi;

	fi;

fi;

