#!/bin/bash

BASH_RC="$HOME/.bashrc";
LYCHEEJS_ROOT="/opt/lycheejs";
PROJECT_ROOT="$LYCHEEJS_ROOT/libraries/fertilizer";

if [ "$SUDO_USER" != "" ] && [ -d "/home/$SUDO_USER" ]; then
	BASH_RC="/home/$SUDO_USER/.bashrc";
fi;


if [ "$(basename $PWD)" == "lycheejs" ] && [ "$PWD" != "$LYCHEEJS_ROOT" ]; then
	LYCHEEJS_ROOT="$PWD";
	PROJECT_ROOT="$LYCHEEJS_ROOT/libraries/fertilizer";
fi;


if [ -d /usr/local/bin ]; then

	sudo rm /usr/local/bin/lycheejs-fertilizer 2> /dev/null;
	sudo ln -s "$PROJECT_ROOT/bin/fertilizer.sh" /usr/local/bin/lycheejs-fertilizer 2> /dev/null;

elif [ -f "$BASH_RC" ]; then

	check=$(cat "$BASH_RC" | grep lycheejs-fertilizer);

	if [ "$check" == "" ]; then
		echo -e "alias lycheejs-fertilizer=\"$PROJECT_ROOT/bin/fertilizer.sh\";" >> $BASH_RC;
	fi;

fi;

