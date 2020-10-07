#!/bin/bash

BASH_RC="$HOME/.bashrc";
LYCHEEJS_ROOT="/opt/lycheejs";
PROJECT_ROOT="$LYCHEEJS_ROOT/libraries/harvester";
SERVICE_FLAG="no";
SYSTEMCTL_BIN=`which systemctl`;

if [ "$1" == "--service" ]; then
	SERVICE_FLAG="yes";
fi;

if [ "$SUDO_USER" != "" ] && [ -d "/home/$SUDO_USER" ]; then
	BASH_RC="/home/$SUDO_USER/.bashrc";
fi;


if [ "$(basename $PWD)" == "lycheejs" ] && [ "$PWD" != "$LYCHEEJS_ROOT" ]; then
	LYCHEEJS_ROOT="$PWD";
	PROJECT_ROOT="$LYCHEEJS_ROOT/libraries/harvester";
fi;


if [ -d /usr/local/bin ]; then

	sudo rm /usr/local/bin/lycheejs-harvester 2> /dev/null;
	sudo ln -s "$PROJECT_ROOT/bin/harvester.sh" /usr/local/bin/lycheejs-harvester 2> /dev/null;

elif [ -f "$BASH_RC" ]; then

	check=$(cat "$BASH_RC" | grep lycheejs-harvester);

	if [ "$check" == "" ]; then
		echo -e "alias lycheejs-harvester=\"$PROJECT_ROOT/bin/harvester.sh\";" >> $BASH_RC;
	fi;

fi;


if [ -d /usr/lib/systemd/system ] && [ "$SYSTEMCTL_BIN" != "" ] && [ "$SERVICE_FLAG" == "yes" ]; then

	sudo cp "$PROJECT_ROOT/bin/harvester.service" /usr/lib/systemd/system/lycheejs-harvester.service 2> /dev/null;
	sudo $SYSTEMCTL_BIN enable lycheejs-harvester 2> /dev/null;

fi;

