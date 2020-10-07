#!/bin/bash

BASH_RC="$HOME/.bashrc";
LYCHEEJS_ROOT="/opt/lycheejs";
PROJECT_ROOT="$LYCHEEJS_ROOT/libraries/strainer";


if [ "$SUDO_USER" != "" ] && [ -d "/home/$SUDO_USER" ]; then
	BASH_RC="/home/$SUDO_USER/.bashrc";
fi;


if [ "$(basename $PWD)" == "lycheejs" ] && [ "$PWD" != "$LYCHEEJS_ROOT" ]; then
	LYCHEEJS_ROOT="$PWD";
	PROJECT_ROOT="$LYCHEEJS_ROOT/libraries/strainer";
fi;


if [ -d /usr/local/bin ]; then

	sudo rm /usr/local/bin/lycheejs-strainer 2> /dev/null;
	sudo ln -s "$PROJECT_ROOT/bin/strainer.sh" /usr/local/bin/lycheejs-strainer;

	sudo rm /usr/local/bin/lycheejs-strainer-fixer 2> /dev/null;
	sudo ln -s "$PROJECT_ROOT/bin/strainer-fixer.sh" /usr/local/bin/lycheejs-strainer-fixer;

elif [ -f "$BASH_RC" ]; then

	check=$(cat "$BASH_RC" | grep lycheejs-strainer);

	if [ "$check" == "" ]; then
		echo -e "alias lycheejs-strainer=\"$PROJECT_ROOT/bin/strainer.sh\";"             >> $BASH_RC;
		echo -e "alias lycheejs-strainer-fixer=\"$PROJECT_ROOT/bin/strainer-fixer.sh\";" >> $BASH_RC;
	fi;

fi;

