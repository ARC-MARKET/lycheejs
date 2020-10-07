#!/bin/bash

BASH_RC="$HOME/.bashrc";
LYCHEEJS_ROOT="/opt/lycheejs";
PROJECT_ROOT="$LYCHEEJS_ROOT/libraries/ranger";

if [ "$SUDO_USER" != "" ] && [ -d "/home/$SUDO_USER" ]; then
	BASH_RC="/home/$SUDO_USER/.bashrc";
fi;


if [ "$(basename $PWD)" == "lycheejs" ] && [ "$PWD" != "$LYCHEEJS_ROOT" ]; then
	LYCHEEJS_ROOT="$PWD";
	PROJECT_ROOT="$LYCHEEJS_ROOT/libraries/ranger";
fi;


if [ -d /usr/share/applications ] && [ -d /usr/share/icons ]; then

	sudo cp "$PROJECT_ROOT/icon.svg"           /usr/share/icons/lycheejs-ranger.svg            2> /dev/null;
	sudo cp "$PROJECT_ROOT/bin/ranger.desktop" /usr/share/applications/lycheejs-ranger.desktop 2> /dev/null;
	sudo sed -i 's|__ROOT__|'$PROJECT_ROOT'|g' /usr/share/applications/lycheejs-ranger.desktop 2> /dev/null;

fi;

if [ -d /usr/local/bin ]; then

	sudo rm /usr/local/bin/lycheejs-ranger 2> /dev/null;
	sudo ln -s "$PROJECT_ROOT/bin/ranger.sh" /usr/local/bin/lycheejs-ranger 2> /dev/null;

elif [ -f "$BASH_RC" ]; then

	check=$(cat "$BASH_RC" | grep lycheejs-ranger);

	if [ "$check" == "" ]; then
		echo -e "alias lycheejs-ranger=\"$PROJECT_ROOT/bin/ranger.sh\";" >> $BASH_RC;
	fi;

fi;

