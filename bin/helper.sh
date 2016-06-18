#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
ARCH=`lowercase \`uname -m\``;

LYCHEEJS_ROOT="/opt/lycheejs";
CHILD_PID="";


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
	LYCHEEJS_ROOT=$(cd "$(dirname "$(greadlink -f "$0")")/../"; pwd);

elif [ "$OS" == "linux" ]; then

	OS="linux";
	LYCHEEJS_ROOT=$(cd "$(dirname "$(readlink -f "$0")")/../"; pwd);

fi;



_print_help() {

	echo "                                                                ";
	echo -e "\u001b[37m\u001b[42mlychee.js Helper\u001b[49m\u001b[39m";
	echo "                                                                ";
	echo " Usage: lycheejs-helper [lycheejs://Action]                     ";
	echo "        lycheejs-helper [env:Platform]                          ";
	echo "                                                                ";
	echo "                                                                ";
	echo " Available Actions:                                             ";
	echo "                                                                ";
	echo "    boot=[Profile]                                              ";
	echo "    profile=[Profile]?data=[base64]                             ";
	echo "    unboot                                                      ";
	echo "                                                                ";
	echo "    start=[Library/Project]                                     ";
	echo "    stop=[Library/Project]                                      ";
	echo "    file=[Library/Project]                                      ";
	echo "    edit=[Library/Project]                                      ";
	echo "                                                                ";
	echo "    cmd=[Command]?data=[JSON]                                   ";
	echo "    web=[URL]                                                   ";
	echo "                                                                ";
	echo "                                                                ";
	echo " Available Platforms:                                           ";
	echo "                                                                ";
	echo "    html, html-nwjs, node, node-sdl                             ";
	echo "                                                                ";
	echo " Examples:                                                      ";
	echo "                                                                ";
	echo "    lycheejs-helper lycheejs://start=/projects/boilerplate      ";
	echo "    lycheejs-helper lycheejs://cmd=lycheejs-ranger              ";
	echo "    lycheejs-helper lycheejs://profile=production?data=[base64] ";
	echo "    lycheejs-helper lycheejs://web=http://lycheejs.org          ";
	echo "                                                                ";
	echo "    lycheejs-helper env:node /path/to/program.js                ";
	echo "                                                                ";
	echo " Notes:                                                         ";
	echo "                                                                ";
	echo " The [JSON] data is encoded as base64 only.                     ";
	echo "                                                                ";
	echo " The \"env:\" can be used as a Shebang in shell scripts:        ";
	echo " #!/usr/local/bin/lycheejs-helper env:node                      ";
	echo "                                                                ";

}


_handle_signal() {
	kill -s "$1" "$CHILD_PID" 2>/dev/null;
}

_trap() {

	handler="$1"; shift;
	for signal; do
		trap "$handler $signal" "$signal";
	done;

}

_start_env () {

	_trap _handle_signal INT HUP KILL TERM EXIT;

	$1 $2 $3 $4 $5 &

	CHILD_PID=$!;
	wait "$CHILD_PID";

}

_put_api_project () {

	data="{\"identifier\":\"$1\",\"action\":\"$2\"}";
	apiurl="http://localhost:4848/api/project/$2";

	curl -H "Content-Type: application/json" -X POST -d "$data" $apiurl 2>&1;

}

_put_api_profile () {

	data=$(echo $3 | base64 --decode);
	apiurl="http://localhost:4848/api/profile/$2";

	curl -H "Content-Type: application/json" -X POST -d "$data" $apiurl 2>&1;

}



protocol=$(echo $1 | cut -d":" -f 1);
content=$(echo $1 | cut -d":" -f 2);



if [ "$protocol" == "lycheejs" ]; then

	action=$(echo $content | cut -c 3- | cut -d"=" -f 1);
	data="";


	if [[ $content =~ .*=.* ]]; then
		resource=$(echo $content | cut -d"=" -f 2);
	else
		resource="";
	fi;


	if [ "$action" == "profile" ]; then
		# XXX: base64 encoded strings end with = (8 Bit) or == (16 Bit)
		resource=$(echo $resource | cut -d"?" -f 1);
		data=$(echo $1 | cut -d"=" -f 3-5);
	elif [ "$action" == "unboot" ]; then
		resource="DUMMY";
	elif [ "$action" == "cmd" ]; then
		# XXX: base64 encoded strings end with = (8 Bit) or == (16 Bit)
		resource=$(echo $1 | cut -d"?" -f 1 | cut -d"=" -f 2);
		data=$(echo $1 | cut -d"=" -f 3-5);
	elif [ "$action" == "web" ]; then
		resource=$(echo $1 | cut -c 16-);
	fi;


	# XXX: https://bugs.freedesktop.org/show_bug.cgi?id=91027
	resource=${resource%/};


	if [ "$action" != "" -a "$resource" != "" ]; then

		case "$action" in

			boot)

				cd $LYCHEEJS_ROOT;

				./bin/harvester.sh stop 2>&1;
				./bin/harvester.sh start "$resource" 2>&1;
				exit 0;

			;;

			profile)

				cd $LYCHEEJS_ROOT;

				_put_api_profile "$resource" "save" "$data";

			;;

			unboot)

				cd $LYCHEEJS_ROOT;

				./bin/harvester.sh stop 2>&1;
				exit 0;

			;;

			start)

				_put_api_project "$resource" "start";
				exit 0;

			;;

			stop)

				_put_api_project "$resource" "stop";
				exit 0;

			;;

			edit)

				if [ -f ./bin/editor.sh ]; then

					if [ "$OS" == "linux" -o "$OS" == "osx" ]; then
						./bin/editor.sh "$resource" 2>&1;
						exit 0;
					fi;

				fi;

			;;

			file)

				if [ "$OS" == "linux" ]; then

					xdg-open "file://$LYCHEEJS_ROOT/$resource" 2>&1;
					exit 0;

				elif [ "$OS" == "osx" ]; then

					open "file://$LYCHEEJS_ROOT/$resource" 2>&1;
					exit 0;

				fi;

			;;

			cmd)

				if [[ "$(echo $resource | cut -c 1-8)" == "lycheejs" && "$resource" != "lycheejs-helper" ]]; then

					if [ -x /usr/local/bin/$resource ]; then

						if [ "$data" != "" ]; then
							$resource $data;
						else
							$resource;
						fi;

					fi;


				fi;

			;;

			web)

				# Well, fuck you, Blink and WebKit.

				clean_resource="$resource";
				clean_resource=${clean_resource//%5B/\[};
				clean_resource=${clean_resource//%5D/\]};
				clean_resource=${clean_resource//http:0\/\//http:\/\/};


				if [ "$OS" == "linux" ]; then

					chrome1=`which google-chrome`;
					chrome2=`which chromium-browser`;

					if [ -x "$chrome1" ]; then
						"$chrome1" "$clean_resource";
					elif [ -x "$chrome2" ]; then
						"$chrome2" "$clean_resource";
					else
						xdg-open "$clean_resource" 2>&1;
					fi;

					exit 0;

				elif [ "$OS" == "osx" ]; then

					chrome1="/Applications/Google Chrome.app";

					if [ -x "$chrome1" ]; then
						open -a "$chrome1" "$clean_resource";
					else
						open "$clean_resource" 2>&1;
					fi;

					exit 0;

				fi;

			;;

		esac;

	fi;


	exit 0;

elif [ "$protocol" == "env" ]; then

	platform=$(echo $content | cut -d":" -f 2);
	program=$2;
	arg1=$3;
	arg2=$4;
	arg3=$5;


	if [ "$program" != "" ]; then

		if [ "$platform" == "html" ]; then

			if [ "$OS" == "linux" ]; then

				chrome1=`which google-chrome`;
				chrome2=`which chromium-browser`;

				if [ -x "$chrome1" ]; then
					"$chrome1" "$program";
				elif [ -x "$chrome2" ]; then
					"$chrome2" "$program";
				else
					xdg-open "$program" 2>&1;
				fi;

			elif [ "$OS" == "osx" ]; then

				chrome1="/Applications/Google Chrome.app";

				if [ -d "$chrome1" ]; then
					open -a "$chrome1" "$program";
				else
					open "$program" 2>&1;
				fi;

			fi;

		elif [ "$platform" == "html-nwjs" ]; then

			if [ "$OS" == "linux" ]; then
				_start_env $LYCHEEJS_ROOT/bin/runtime/html-nwjs/linux/$ARCH/nw $program $arg1 $arg2 $arg3;
			elif [ "$OS" == "osx" ]; then
				_start_env $LYCHEEJS_ROOT/bin/runtime/html-nwjs/osx/$ARCH/nw $program $arg1 $arg2 $arg3;
			fi;

		elif [ "$platform" == "node" ]; then

			if [ "$OS" == "linux" ]; then
				_start_env $LYCHEEJS_ROOT/bin/runtime/node/linux/$ARCH/node $program $arg1 $arg2 $arg3;
			elif [ "$OS" == "osx" ]; then
				_start_env $LYCHEEJS_ROOT/bin/runtime/node/osx/$ARCH/node $program $arg1 $arg2 $arg3;
			fi;

		elif [ "$platform" == "node-sdl" ]; then

			if [ "$OS" == "linux" ]; then
				_start_env $LYCHEEJS_ROOT/bin/runtime/node-sdl/linux/$ARCH/node $program $arg1 $arg2 $arg3;
			elif [ "$OS" == "osx" ]; then
				_start_env $LYCHEEJS_ROOT/bin/runtime/node-sdl/osx/$ARCH/node $program $arg1 $arg2 $arg3;
			fi;

		fi;

	fi;


	exit 0;

else

	_print_help;

	exit 1;

fi;

