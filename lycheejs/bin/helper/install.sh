#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
BASH_RC="$HOME/.bashrc";
LYCHEEJS_ROOT="/opt/lycheejs";
PROJECT_ROOT="$LYCHEEJS_ROOT/bin/helper";

if [ "$SUDO_USER" != "" ] && [ -d "/home/$SUDO_USER" ]; then
	BASH_RC="/home/$SUDO_USER/.bashrc";
fi;


if [ "$(basename $PWD)" == "lycheejs" ] && [ "$PWD" != "$LYCHEEJS_ROOT" ]; then
	LYCHEEJS_ROOT="$PWD";
	PROJECT_ROOT="$LYCHEEJS_ROOT/bin/helper";
fi;


if [ -d /usr/share/applications ] && [ -d /usr/share/icons ]; then

	sudo cp "$PROJECT_ROOT/helper.svg"      /usr/share/icons/lycheejs-helper.svg            2> /dev/null;
	sudo cp "$PROJECT_ROOT/helper.desktop"  /usr/share/applications/lycheejs-helper.desktop 2> /dev/null;
	sudo sed -i 's|__ROOT__|'$LYCHEEJS_ROOT'|g' /usr/share/applications/lycheejs-helper.desktop 2> /dev/null;

fi;

if [ -d /usr/local/bin ]; then

	sudo rm /usr/local/bin/lycheejs-helper 2> /dev/null;
	sudo ln -s "$PROJECT_ROOT/helper.sh" /usr/local/bin/lycheejs-helper 2> /dev/null;

elif [ -f "$BASH_RC" ]; then

	check=$(cat "$BASH_RC" | grep lycheejs-helper);

	if [ "$check" == "" ]; then
		echo -e "alias lycheejs-helper=\"$PROJECT_ROOT/helper.sh\";" >> $BASH_RC;
	fi;

fi;


AUTOCOMPLETE_RC="";

if [ -d /usr/share/bash-completion/completions ]; then
	AUTOCOMPLETE_RC="/usr/share/bash-completion/completions/lycheejs";
elif [ -d /etc/bash_completion.d ]; then
	AUTOCOMPLETE_RC="/etc/bash_completion.d/lycheejs";
fi;

if [ "$AUTOCOMPLETE_RC" != "" ]; then

	sudo cp "$PROJECT_ROOT/autocomplete.sh" $AUTOCOMPLETE_RC    2> /dev/null;
	sudo ln -s "$AUTOCOMPLETE_RC" "$AUTOCOMPLETE_RC-breeder"    2> /dev/null;
	sudo ln -s "$AUTOCOMPLETE_RC" "$AUTOCOMPLETE_RC-fertilizer" 2> /dev/null;
	sudo ln -s "$AUTOCOMPLETE_RC" "$AUTOCOMPLETE_RC-harvester"  2> /dev/null;
	sudo ln -s "$AUTOCOMPLETE_RC" "$AUTOCOMPLETE_RC-strainer"   2> /dev/null;
	sudo ln -s "$AUTOCOMPLETE_RC" "$AUTOCOMPLETE_RC-studio"     2> /dev/null;

fi;


if [ "$OS" == "darwin" ]; then

	cd "$PROJECT_ROOT/macos";
	bash ./compile.sh;

	if [ ! -f /usr/local/bin/png2icns ]; then
		sudo cp "$PROJECT_ROOT/macos/png2icns.sh" /usr/local/bin/png2icns 2> /dev/null;
		sudo chmod +x /usr/local/bin/png2icns 2> /dev/null;
	fi;

fi;

