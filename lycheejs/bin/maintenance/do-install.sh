#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
USER_WHO=`whoami`;
USER_LOG=`logname 2> /dev/null`;
LYCHEEJS_ROOT=$(cd "$(dirname "$0")/../../"; pwd);
SYSTEMCTL_BIN=`which systemctl`;

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

SKIP_UPDATES="false";

if [ $(has_arg "-s") ] || [ $(has_arg "--skip") ]; then
	SKIP_UPDATES="true";
fi;



_check_or_exit() {

	local result="$1";

	if [ "$result" == "0" ]; then
		echo -e "\e[42m\e[97m (I) > SUCCESS \e[0m";
	else
		echo -e "\e[41m\e[97m (E) > FAILURE \e[0m";
		exit 1;
	fi;

}


_install() {

	local cmd="$1";
	echo -e " (L)   $cmd";
	$cmd 1> /dev/null 2> /dev/null;

	if [ "$?" == "0" ]; then
		return 0;
	else
		return 1;
	fi;

}



if [ "$OS" == "darwin" ]; then

	OS="macos";

elif [ "$OS" == "linux" ]; then

	OS="linux";

	OS_CHECK=`lowercase \`uname -o\``;

	if [ "$OS_CHECK" == "android" ]; then

		TERMUX_CHECK=`which termux-info`;

		if [ "$TERMUX_CHECK" != "" ]; then
			USER_WHO="root";
		fi;

	fi;

elif [ "$OS" == "freebsd" ] || [ "$OS" == "netbsd" ]; then

	OS="bsd";

fi;



if [ "$USER_WHO" != "root" ]; then

	echo -e "\e[41m\e[97m";
	echo " (E) You are not root.                           ";
	echo "     Use \"sudo ./bin/maintenance/do-install.sh\". ";
	echo -e "\e[0m";

	exit 1;

elif [ "$OS" == "osx" ] && [ "$USER_WHO" == "root" ] && [ "$USER_LOG" == "root" ]; then

	echo -e "\e[41m\e[97m";
	echo " (E) You are root. Exit su shell and             ";
	echo "     Use \"sudo ./bin/maintenance/do-install.sh\". ";
	echo -e "\e[0m";

	exit 1;

else

	SELECTION_PACKAGES="";

	if [ "$ALWAYS_YES" == "true" ]; then

		SELECTION_PACKAGES="required";

	else

		echo " (L) ";
		echo -e "\e[42m\e[97m (I) lychee.js Install Tool \e[0m";
		echo " (L) ";
		echo " (L) All your data are belong to us.                      ";
		echo " (L) This tool integrates lychee.js with your system.     ";
		echo " (L) ";
		echo " (L) No projects are harmed or modified by executing this ";
		echo " (L) script. This will only update all software packages. ";
		echo " (L) ";
		echo " (L) ";
		echo " (L) Please select the dependencies channel:              ";
		echo " (L) ";
		echo " (L) 1) minimal + optional dependencies                   ";
		echo " (L)    Required for mobile device support.               ";
		echo " (L) ";
		echo " (L) 2) minimal dependencies                              ";
		echo " (L)    No mobile device support.                         ";
		echo " (L) ";

		read -p " (L) Continue (1/2)? " -r

		if [[ $REPLY =~ ^[1]$ ]]; then
			SELECTION_PACKAGES="optional";
		elif [[ $REPLY =~ ^[2]$ ]]; then
			SELECTION_PACKAGES="required";
		else
			echo -e "\e[41m\e[97m (E) INVALID SELECTION \e[0m";
			exit 1;
		fi;

	fi;



	SELECTION_SERVICE="";

	if [ "$ALWAYS_YES" == "true" ] && [ "$SYSTEMCTL_BIN" != "" ]; then

		SELECTION_SERVICE="yes";

	elif [ "$SYSTEMCTL_BIN" != "" ]; then

		echo " (L) ";
		echo " (L) Do you want lychee.js Harvester autostart integration on bootup? ";
		echo " (L) ";

		read -p " (L) Yes or No (y/n)? " -r

		if [[ $REPLY =~ ^[Yy]$ ]]; then
			SELECTION_SERVICE="yes";
		elif [[ $REPLY =~ ^[Nn]$ ]]; then
			SELECTION_SERVICE="no";
		else
			echo -e "\e[41m\e[97m (E) INVALID SELECTION \e[0m";
			exit 1;
		fi;

	fi;



	if [ "$OS" == "linux" ]; then

		# Arch
		if [ -x "/usr/bin/pacman" ]; then
			# XXX: libicns package not available (only AUR)
			REQUIRED_LIST="bash binutils arm-none-eabi-binutils coreutils fakeroot sed zip unzip tar curl git npm";
			REQUIRED_CMD="pacman -S --noconfirm --needed $REQUIRED_LIST";
			OPTIONAL_LIST="jdk8-openjdk lib32-glibc lib32-libstdc++5 lib32-ncurses lib32-zlib";
			OPTIONAL_CMD="pacman -S --noconfirm --needed $OPTIONAL_LIST";
			UPDATE_CMD="pacman -Sy --noconfirm";

		# Alpine
		elif [ -x "/sbin/apk" ]; then

			# XXX: libicns arm-none-eabi-binutils not available
			REQUIRED_LIST="bash binutils coreutils fakeroot sed zip unzip tar curl git npm";
			REQUIRED_CMD="apk add --no-cache $REQUIRED_LIST";
			# XXX: lib32-glibc not available
			OPTIONAL_LIST="openjdk8 libstdc++ ncurses-libs zlib";
			OPTIONAL_CMD="apk add --no-cache $OPTIONAL_LIST";
			UPDATE_CMD="apk update";

		# Debian/Ubuntu
		elif [ -x "/usr/bin/apt-get" ]; then
			REQUIRED_LIST="bash binutils binutils-multiarch coreutils fakeroot icnsutils sed zip unzip tar curl git npm";
			REQUIRED_CMD="apt-get -y install $REQUIRED_LIST";
			OPTIONAL_LIST="openjdk-8-jdk libc6-i386 lib32stdc++6 lib32ncurses5 lib32z1";
			OPTIONAL_CMD="apt-get -y install $OPTIONAL_LIST";
			UPDATE_CMD="apt-get -y update";

		# Fedora
		elif [ -x "/usr/bin/dnf" ]; then
			REQUIRED_LIST="bash binutils binutils-arm-linux-gnu binutils-x86_64-linux-gnu coreutils fakeroot libicns-utils sed zip unzip tar curl git npm";
			REQUIRED_CMD="dnf -y install $REQUIRED_LIST";
			OPTIONAL_LIST="java-1.8.0-openjdk glibc.i686 libstdc++.i686 ncurses-libs.i686 zlib.i686";
			OPTIONAL_CMD="dnf -y install $OPTIONAL_LIST";
			UPDATE_CMD="";

		# CentOS/old Fedora
		elif [ -x "/usr/bin/yum" ]; then
			REQUIRED_LIST="bash binutils binutils-arm-linux-gnu binutils-x86_64-linux-gnu coreutils fakeroot libicns-utils sed zip unzip tar curl git npm";
			REQUIRED_CMD="yum --setopt=alwaysprompt=no install $REQUIRED_LIST";
			OPTIONAL_LIST="java-1.8.0-openjdk glibc.i686 libstdc++.i686 ncurses-libs.i686 zlib.i686";
			OPTIONAL_CMD="yum --setopt=alwaysprompt=no install $OPTIONAL_LIST";
			UPDATE_CMD="yum updateinfo";

		# openSUSE
		elif [ -x "/usr/bin/zypper" ]; then
			REQUIRED_LIST="bash binutils coreutils fakeroot icns-utils sed zip unzip tar curl git npm";
			REQUIRED_CMD="zypper --non-interactive install $REQUIRED_LIST";
			OPTIONAL_LIST="java-1_8_0-openjdk glibc-32bit libstdc++6-32bit libncurses5-32bit libz1-32bit";
			OPTIONAL_CMD="zypper --non-interactive install $OPTIONAL_LIST";
			UPDATE_CMD="zypper update";

		# Termux
		elif [ -x "/data/data/com.termux/files/usr/bin/apt" ]; then
			# XXX: fakeroot libicns not available
			REQUIRED_LIST="bash binutils coreutils sed zip unzip tar curl git nodejs";
			REQUIRED_CMD="apt install $REQUIRED_LIST";
			# XXX: openjdk8 libstdc++ zlib not available
			OPTIONAL_LIST="ncurses";
			OPTIONAL_CMD="apt install $OPTIONAL_LIST";
			UPDATE_CMD="apt update";

		fi;

	elif [ "$OS" == "bsd" ]; then

		# FreeBSD, NetBSD
		if [[ -x "/usr/sbin/pkg" ]]; then

			export ASSUME_ALWAYS_YES="yes";
			# XXX: icns-utils package not available
			REQUIRED_LIST="bash binutils arm-none-eabi-binutils coreutils fakeroot gsed zip unzip tar curl git npm";
			REQUIRED_CMD="pkg install $REQUIRED_LIST";
			OPTIONAL_LIST="openjdk8 libstdc++ lzlib ncurses";
			OPTIONAL_CMD="pkg install $OPTIONAL_LIST";
			UPDATE_CMD="pkg update";

		fi;

	elif [ "$OS" == "osx" ]; then

		if [[ -x "/usr/local/bin/brew" ]]; then
			REQUIRED_LIST="binutils arm-linux-gnueabihf-binutils coreutils fakeroot libicns gnu-sed gnu-tar curl git node";
			REQUIRED_CMD="sudo -u $USER_LOG brew install $REQUIRED_LIST --with-default-names";
			OPTIONAL_LIST="lzlib ncurses";
			OPTIONAL_CMD="sudo -u $USER_LOG brew install $OPTIONAL_LIST --with-default-names";

		elif [[ -x "/opt/local/bin/port" ]]; then
			REQUIRED_LIST="binutils arm-none-eabi-binutils coreutils fakeroot libicns gsed zip unzip gnutar curl git npm6";
			REQUIRED_CMD="port install $REQUIRED_LIST";
			OPTIONAL_LIST="openjdk10 zlib ncurses";
			OPTIONAL_CMD="port install $OPTIONAL_LIST";

		fi;

	fi;


	if [ "$SKIP_UPDATES" == "false" ]; then

		if [ "$UPDATE_CMD" != "" ]; then

			echo " (L) ";
			echo " (L) > Updating package information ...";

			_install "$UPDATE_CMD";
			_check_or_exit $?;

		fi;

		if [ "$REQUIRED_CMD" != "" ]; then

			echo " (L) ";
			echo " (L) > Installing required dependencies ...";

			_install "$REQUIRED_CMD";
			_check_or_exit $?;

		elif [ "$REQUIRED_CMD" == "" ]; then

			echo " (L) ";
			echo -e "\e[41m\e[97m";
			echo " (E)                                                           ";
			echo " (E) Your package manager is not supported.                    ";
			echo " (E) Feel free to modify this script!                          ";
			echo " (E)                                                           ";
			echo -e "\e[0m";

			exit 1;

		fi;

		if [ "$OPTIONAL_CMD" != "" ] && [ "$SELECTION_PACKAGES" == "optional" ]; then

			echo " (L) ";
			echo " (L) > Installing optional dependencies ...";

			_install "$OPTIONAL_CMD";
			_check_or_exit $?;

		fi;

	fi;


	if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ] || [ "$OS" == "macos" ]; then

		cd $LYCHEEJS_ROOT;

		echo " (L) ";
		echo " (L) > Integrating lychee.js Helper ...";
		echo " (L)   bash ./bin/helper/install.sh";
		bash ./bin/helper/install.sh;
		_check_or_exit $?;


		echo " (L) ";
		echo " (L) > Integrating lychee.js Harvester ...";

		if [ "$SELECTION_SERVICE" == "yes" ]; then
			echo " (L)   bash ./libraries/harvester/bin/install.sh --service";
			bash ./libraries/harvester/bin/install.sh --service;
			_check_or_exit $?;
		else
			echo " (L)   bash ./libraries/harvester/bin/install.sh";
			bash ./libraries/harvester/bin/install.sh;
			_check_or_exit $?;
		fi;


		echo " (L) ";
		echo " (L) > Integrating CLI/GUI applications ...";

		cd $LYCHEEJS_ROOT;

		result=0;

		echo " (L)   bash ./libraries/breeder/bin/install.sh";
		bash ./libraries/breeder/bin/install.sh;
		if [ $? != 0 ]; then result=1; fi;

		echo " (L)   bash ./libraries/fertilizer/bin/install.sh";
		bash ./libraries/fertilizer/bin/install.sh;
		if [ $? != 0 ]; then result=1; fi;

		echo " (L)   bash ./libraries/ranger/bin/install.sh";
		bash ./libraries/ranger/bin/install.sh;
		if [ $? != 0 ]; then result=1; fi;

		echo " (L)   bash ./libraries/strainer/bin/install.sh";
		bash ./libraries/strainer/bin/install.sh;
		if [ $? != 0 ]; then result=1; fi;

		echo " (L)   bash ./libraries/studio/bin/install.sh";
		bash ./libraries/studio/bin/install.sh;
		if [ $? != 0 ]; then result=1; fi;

		if [ "$result" != "$0" ]; then
			echo -e "\e[42m\e[97m (I) > SUCCESS \e[0m";
		else
			echo -e "\e[43m\e[97m (W) > FAILURE \e[0m";
		fi;

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

fi;

