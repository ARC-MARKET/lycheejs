#!/bin/bash

BASH_RC="$HOME/.bashrc";
LYCHEEJS_ROOT="/opt/lycheejs";
PROJECT_ROOT="$LYCHEEJS_ROOT/libraries/studio";

if [ "$SUDO_USER" != "" ] && [ -d "/home/$SUDO_USER" ]; then
	BASH_RC="/home/$SUDO_USER/.bashrc";
fi;


if [ "$(basename $PWD)" == "lycheejs" ] && [ "$PWD" != "$LYCHEEJS_ROOT" ]; then
	LYCHEEJS_ROOT="$PWD";
	PROJECT_ROOT="$LYCHEEJS_ROOT/libraries/studio";
fi;


if [ -d /usr/share/applications ] && [ -d /usr/share/icons ]; then

	sudo cp "$PROJECT_ROOT/icon.svg"           /usr/share/icons/lycheejs-studio.svg            2> /dev/null;
	sudo cp "$PROJECT_ROOT/bin/studio.desktop" /usr/share/applications/lycheejs-studio.desktop 2> /dev/null;
	sudo sed -i 's|__ROOT__|'$PROJECT_ROOT'|g' /usr/share/applications/lycheejs-studio.desktop 2> /dev/null;

fi;

if [ -d /usr/local/bin ]; then

	sudo rm /usr/local/bin/lycheejs-studio 2> /dev/null;
	sudo ln -s "$PROJECT_ROOT/bin/studio.sh" /usr/local/bin/lycheejs-studio 2> /dev/null;

elif [ -f "$BASH_RC" ]; then

	check=$(cat "$BASH_RC" | grep lycheejs-studio);

	if [ "$check" == "" ]; then
		echo -e "alias lycheejs-studio=\"$PROJECT_ROOT/bin/studio.sh\";" >> $BASH_RC;
	fi;

fi;

