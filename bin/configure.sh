#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
ARCH=`lowercase \`uname -m\``;
USER_WHO=`whoami`;
USER_LOG=`logname`;


LYCHEEJS_NODE="";
LYCHEEJS_ROOT="/opt/lycheejs";
PACKAGE_CMD="";

SANDBOX_FLAG=false;
if [ "$1" == "--sandbox" ]; then
	SANDBOX_FLAG=true;
fi;


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



_fertilize() {

	cd $LYCHEEJS_ROOT;

	./bin/fertilizer.sh $1 $2;

	if [ "$?" != "0" ]; then
		exit 1;
	fi;

}


if [[ "$USER_WHO" != "root" && "$SANDBOX_FLAG" == "false" ]]; then

	echo "You are not root.";
	echo "Use \"sudo $0\".";

	exit 1;

elif [[ "$USER_WHO" == "root" && "$USER_LOG" == "root" ]]; then

	echo "You are root.";
	echo "Please exit su shell and use \"sudo $0\".";

	exit 1;

else

	if [ "$SANDBOX_FLAG" == "false" ]; then

		if [ "$OS" == "osx" ]; then

			if [[ -x "/usr/local/bin/brew" ]]; then
				PACKAGE_LIST="binutils coreutils libicns gnu-sed gnu-tar curl git";
				PACKAGE_CMD="sudo -u $USER_LOG brew install $PACKAGE_LIST --with-default-names";
			elif [[ -x "/opt/local/bin/port" ]]; then
				PACKAGE_LIST="binutils coreutils libicns gsed zip unzip gnutar curl git";
				PACKAGE_CMD="port install $PACKAGE_LIST";
			fi;

		elif [ "$OS" == "linux" ]; then

			if [[ -x "/usr/bin/apt-get" ]]; then
				PACKAGE_LIST="bash binutils binutils-multiarch coreutils icnsutils sed zip unzip tar curl git";
				PACKAGE_CMD="apt-get -y install $PACKAGE_LIST";
			elif [[ -x "/usr/bin/dnf" ]]; then
				PACKAGE_LIST="bash binutils binutils-arm-linux-gnu binutils-x86_64-linux-gnu coreutils libicns-utils sed zip unzip tar curl git";
				PACKAGE_CMD="dnf -y install $PACKAGE_LIST";
			elif [[ -x "/usr/bin/yum" ]]; then
				PACKAGE_LIST="bash binutils binutils-arm-linux-gnu binutils-x86_64-linux-gnu coreutils libicns-utils sed zip unzip tar curl git";
				PACKAGE_CMD="yum --setopt=alwaysprompt=no install $PACKAGE_LIST";
			elif [[ -x "/usr/bin/pacman" ]]; then
				PACKAGE_LIST="bash binutils coreutils libicns sed zip unzip tar curl git";
				PACKAGE_CMD="pacman -S --noconfirm $PACKAGE_LIST";
			elif [[ -x "/usr/bin/zypper" ]]; then
				PACKAGE_LIST="bash binutils coreutils icns-utils sed zip unzip tar curl git";
				PACKAGE_CMD="zypper --non-interactive install $PACKAGE_LIST";
			fi;

		fi;


		echo "";
		echo "> Installing Dependencies ...";

		if [ "$PACKAGE_CMD" != "" ]; then

			echo -e "\t$PACKAGE_CMD";

			$PACKAGE_CMD 2>&1 > /dev/null;

			if [ "$?" == "0" ]; then

				echo "> DONE";

			else
				echo "> FAIL";
				echo "";
				echo "Installation command failed, please verify that this is working (don't forget to sudo):";
				echo "$PACKAGE_CMD";
				echo "";

				exit 1;

			fi;


		else

			echo "> FAIL";

			echo "";
			echo "Your system is not officially supported.";
			echo "Feel free to modify this script to add the dependencies!";
			echo "";
			echo "Also, please let us know about this at https://github.com/Artificial-Engineering/lycheeJS/issues";
			echo "";

			exit 1;

		fi;

	fi;


	if [[ "$OS" == "linux" || "$OS" == "osx" ]]; then

		echo "";
		echo "> Building lycheeJS core and fertilizers";
		echo "";


		cd $LYCHEEJS_ROOT;


		$LYCHEEJS_NODE ./bin/configure.js;

		if [ "$?" == "0" ]; then

			_fertilize html/dist /libraries/lychee;
			_fertilize html-nwjs/dist /libraries/lychee;
			_fertilize html-webview/dist /libraries/lychee;
			_fertilize node/dist /libraries/lychee;
			# _fertilize node-sdl/dist /libraries/lychee;

			# _fertilize node/dist /libraries/breeder;
			# _fertilize node-sdl/dist /libraries/breeder;

			_fertilize node/dist /libraries/fertilizer;
			# _fertilize node-sdl/dist /libraries/fertilizer;

			_fertilize html/dist /libraries/harvester;
			_fertilize html-nwjs/dist /libraries/harvester;
			_fertilize html-webview/dist /libraries/harvester;
			_fertilize node/dist /libraries/harvester;
			# _fertilize node-sdl/dist /libraries/harvester;

			# _fertilize node/dist /libraries/strainer;
			# _fertilize node-sdl/dist /libraries/strainer;


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

		chmod +x ./projects/*/harvester.js;
		chmod +x ./projects/*/bin/*.sh;

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


	if [ "$SANDBOX_FLAG" == "false" ]; then

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

fi;

