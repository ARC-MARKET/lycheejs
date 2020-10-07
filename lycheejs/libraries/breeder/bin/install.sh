#!/bin/bash

BASH_RC="$HOME/.bashrc";
LYCHEEJS_ROOT="/opt/lycheejs";
PROJECT_ROOT="$LYCHEEJS_ROOT/libraries/breeder";

if [ "$SUDO_USER" != "" ] && [ -d "/home/$SUDO_USER" ]; then
	BASH_RC="/home/$SUDO_USER/.bashrc";
fi;


if [ "$(basename $PWD)" == "lycheejs" ] && [ "$PWD" != "$LYCHEEJS_ROOT" ]; then
	LYCHEEJS_ROOT="$PWD";
	PROJECT_ROOT="$LYCHEEJS_ROOT/libraries/breeder";
fi;


if [ -d /usr/local/bin ]; then

	sudo rm /usr/local/bin/lycheejs-breeder 2> /dev/null;
	sudo ln -s "$PROJECT_ROOT/bin/breeder.sh" /usr/local/bin/lycheejs-breeder 2> /dev/null;

elif [ -f "$BASH_RC" ]; then

	check=$(cat "$BASH_RC" | grep lycheejs-breeder);

	if [ "$check" == "" ]; then
		echo -e "alias lycheejs-breeder=\"$PROJECT_ROOT/bin/breeder.sh\";" >> $BASH_RC;
	fi;

fi;

