#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
ARCH=`lowercase \`uname -m\``;
USER_WHO=`whoami`;
USER_LOG=`logname 2> /dev/null`;


# XXX: Allow sudo usage
if [ "$SUDO_USER" != "" ]; then
	USER_WHO="$SUDO_USER";
fi;


# XXX: Allow /tmp/lycheejs usage
if [ -z "$LYCHEEJS_ROOT" ]; then

	LYCHEEJS_ROOT="/opt/lycheejs";

	# XXX: Allow sandboxed usage
	auto_root=$(dirname "$(dirname "$(realpath "$0")")");
	if [ "$auto_root" != "$LYCHEEJS_ROOT" ]; then
		LYCHEEJS_ROOT="$auto_root";
	fi;

fi;


echo -e " --> $LYCHEEJS_ROOT\n";


LYCHEEJS_NODE="";
PACKAGE_CMD="";
CORE_FLAG="false";


if [ "$1" == "-c" ] || [ "$1" == "--core" ]; then
	CORE_FLAG="true";
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
	LYCHEEJS_NIDIUM="$LYCHEEJS_ROOT/bin/runtime/nidium/osx/$ARCH/nidium";
	LYCHEEJS_NODE="$LYCHEEJS_ROOT/bin/runtime/node/osx/$ARCH/node";
	LYCHEEJS_NWJS="$LYCHEEJS_ROOT/bin/runtime/html-nwjs/osx/$ARCH/nwjs.app";

elif [ "$OS" == "linux" ]; then

	OS="linux";
	LYCHEEJS_NIDIUM="$LYCHEEJS_ROOT/bin/runtime/nidium/linux/$ARCH/nidium";
	LYCHEEJS_NODE="$LYCHEEJS_ROOT/bin/runtime/node/linux/$ARCH/node";
	LYCHEEJS_NWJS="$LYCHEEJS_ROOT/bin/runtime/html-nwjs/linux/$ARCH/nw";

elif [ "$OS" == "freebsd" ] || [ "$OS" == "netbsd" ]; then

	# XXX: BSD requires Linux binary compatibility

	OS="bsd";
	LYCHEEJS_NIDIUM="$LYCHEEJS_ROOT/bin/runtime/nidium/linux/$ARCH/nidium";
	LYCHEEJS_NODE="$LYCHEEJS_ROOT/bin/runtime/node/linux/$ARCH/node";
	LYCHEEJS_NWJS="$LYCHEEJS_ROOT/bin/runtime/html-nwjs/linux/$ARCH/nw";

fi;

NPM_BIN=`which npm`;

_echo_result() {

	code="$1";
	quit="$2";

	if [ "$code" == "0" ]; then
		echo -e " (I) SUCCESS\n";
	else
		echo -e " (E) FAILURE\n";
	fi;

	if [ "$quit" == "1" ] && [ "$code" != "0" ]; then
		exit 1;
	fi;

}



if [ "$OS" == "linux" ] || [ "$OS" == "osx" ] || [ "$OS" == "bsd" ]; then

	echo -e " (L) Fixing CHMOD/CHOWN rights";

	if [ -f /etc/group ]; then

		wheel_group=$(cat /etc/group | grep "^wheel");
		staff_group=$(cat /etc/group | grep "^staff");
		user_group=$(cat /etc/group | grep "^$USER_WHO");
		sudo_group=$(cat /etc/group | grep "^sudo");


		user_name="$USER_WHO";
		group_name="";

		if [ "$wheel_group" != "" ]; then
			group_name="wheel";
		elif [ "$staff_group" != "" ]; then
			group_name="staff";
		elif [ "$user_group" != "" ]; then
			group_name="$USER_WHO";
		elif [ "$sudo_group" != "" ]; then
			group_name="sudo";
		fi;


		if [ "$group_name" != "" ]; then
			chown -R "${user_name}:${group_name}" $LYCHEEJS_ROOT 2> /dev/null;
		else
			chown -R "$user_name" $LYCHEEJS_ROOT 2> /dev/null;
		fi;

	fi;


	cd $LYCHEEJS_ROOT;


	# Default chmod rights for folders

	find ./libraries -type d -print0 | xargs -0 chmod 777 2> /dev/null;
	find ./libraries -type f -print0 | xargs -0 chmod 666 2> /dev/null;

	find ./projects -type d -print0 | xargs -0 chmod 777 2> /dev/null;
	find ./projects -type f -print0 | xargs -0 chmod 666 2> /dev/null;


	# Make command line tools explicitely executable

	chmod +x ./bin/helper/*.sh          2> /dev/null;
	chmod +x ./libraries/*/harvester.js 2> /dev/null;
	chmod +x ./libraries/*/bin/*.sh     2> /dev/null;
	chmod +x ./projects/*/harvester.js  2> /dev/null;
	chmod +x ./projects/*/bin/*.sh      2> /dev/null;

	chmod 0777 ./bin                             2> /dev/null;
	chmod -R 0777 ./libraries/harvester/profiles 2> /dev/null;


	# Make fertilizers explicitely executable

	chmod +x ./bin/runtime/bin/*.sh     2> /dev/null;
	chmod +x ./bin/runtime/*/package.sh 2> /dev/null;
	chmod +x ./bin/runtime/*/update.sh  2> /dev/null;


	# Make runtimes explicitely executable

	if [ -f "$LYCHEEJS_NIDIUM" ]; then
		chmod +x $LYCHEEJS_NIDIUM 2> /dev/null;
	fi;

	if [ -f "$LYCHEEJS_NODE" ]; then
		chmod +x $LYCHEEJS_NODE 2> /dev/null;
	fi;

	if [ -f "$LYCHEEJS_NWJS" ]; then
		chmod +x $LYCHEEJS_NWJS 2> /dev/null;
	fi;


	echo -e " (I) SUCCESS\n";

fi;



if [ "$OS" == "linux" ] || [ "$OS" == "osx" ] || [ "$OS" == "bsd" ]; then

	if [ -e "$LYCHEEJS_ROOT/.git/config" ]; then

		echo -e " (L) Fixing GIT config";


		cd $LYCHEEJS_ROOT;

		check_remote=$(cat .git/config | grep '\[remote "upstream"\]');

		if [ "$check_remote" == "" ]; then

			echo -e "[remote \"upstream\"]" >> .git/config;
			echo -e "\turl = https://github.com/cookiengineer/lycheejs.git" >> .git/config;
			echo -e "\tfetch = +refs/heads/*:refs/remotes/upstream/*" >> .git/config;

		fi;


		echo -e " (I) SUCCESS\n";

	fi;

fi;



if [ "$NPM_BIN" != "" ]; then

	echo -e " (L) Fixing NPM config";

	cd $LYCHEEJS_ROOT;

	if [ ! -s $LYCHEEJS_ROOT/node_modules/eslint ]; then
		npm link eslint 2> /dev/null;
		_echo_result $? 0;
	else
		_echo_result 0 0;
	fi;

fi;



if [ "$OS" == "linux" ] || [ "$OS" == "osx" ] || [ "$OS" == "bsd" ]; then

	cd $LYCHEEJS_ROOT;


	echo -e " (L) Cleaning lychee.js Projects and Libraries";

	rm -rf ./libraries/*/api   2> /dev/null;
	rm -rf ./libraries/*/build 2> /dev/null;
	rm -rf ./projects/*/api    2> /dev/null;
	rm -rf ./projects/*/build  2> /dev/null;

	_echo_result 0 0;


	echo -e " (L) Distributing lychee.js Crux";
	export LYCHEEJS_ROOT="$LYCHEEJS_ROOT";
	bash ./libraries/crux/bin/configure.sh;
	_echo_result $? 1;


	if [ "$CORE_FLAG" == "false" ]; then

		echo -e " (L) Distributing lychee.js Engine";

		export LYCHEEJS_ROOT="$LYCHEEJS_ROOT";
		bash ./libraries/fertilizer/bin/fertilizer.sh fertilize /libraries/lychee;

		_echo_result $? 1;

	fi;


	if [ "$CORE_FLAG" == "false" ]; then

		echo -e " (L) Distributing lychee.js Libraries";

		export LYCHEEJS_ROOT="$LYCHEEJS_ROOT";
		bash ./libraries/fertilizer/bin/fertilizer.sh fertilize /libraries/breeder */dist;
		bash ./libraries/fertilizer/bin/fertilizer.sh fertilize /libraries/fertilizer */dist;
		bash ./libraries/fertilizer/bin/fertilizer.sh fertilize /libraries/harvester */dist;
		bash ./libraries/fertilizer/bin/fertilizer.sh fertilize /libraries/strainer */dist;

		bash ./libraries/fertilizer/bin/fertilizer.sh fertilize /libraries/ranger */dist;
		bash ./libraries/fertilizer/bin/fertilizer.sh fertilize /libraries/studio */dist;

		_echo_result 0 0;

	fi;


	if [ "$CORE_FLAG" == "false" ]; then

		echo -e " (L) Learning lychee.js Engine";

		export LYCHEEJS_ROOT="$LYCHEEJS_ROOT";
		bash ./libraries/strainer/bin/strainer.sh check /libraries/lychee;

		_echo_result $?;

	fi;

fi;
