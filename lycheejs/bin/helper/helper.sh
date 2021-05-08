#!/bin/bash

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
ARCH=`lowercase \`uname -m\``;
CHILD_PID="";


# XXX: Allow /tmp/lycheejs usage
if [ -z "$LYCHEEJS_ROOT" ]; then

	LYCHEEJS_ROOT="/opt/lycheejs";

	# XXX: Allow sandboxed usage
	auto_root=$(dirname "$(dirname "$(dirname "$(realpath "$0")")")");
	if [ "$auto_root" != "$LYCHEEJS_ROOT" ]; then
		export LYCHEEJS_ROOT="$auto_root";
	fi;

fi;


LYCHEEJS_VERSION=$(grep "VERSION" "$LYCHEEJS_ROOT/libraries/crux/source/lychee.js" 2> /dev/null | cut -d"'" -f2);

# XXX: Try to recover from missing core
if [ "$LYCHEEJS_VERSION" == "" ]; then
	cd "$LYCHEEJS_ROOT";
	bash ./bin/configure.sh --core;
	LYCHEEJS_VERSION=$(grep "VERSION" "$LYCHEEJS_ROOT/libraries/crux/source/lychee.js" 2> /dev/null | cut -d"'" -f2);
fi;


if [ "$ARCH" == "x86_64" ] || [ "$ARCH" == "amd64" ]; then
	ARCH="x86_64";
elif [ "$ARCH" == "i386" ] || [ "$ARCH" == "i686" ] || [ "$ARCH" == "i686-64" ]; then
	ARCH="x86";
elif [ "$ARCH" == "armv7l" ] || [ "$ARCH" == "armv8" ]; then
	ARCH="arm";
fi;


if [ "$OS" == "darwin" ]; then
	OS="macos";
elif [ "$OS" == "linux" ]; then
	OS="linux";
elif [ "$OS" == "freebsd" ] || [ "$OS" == "netbsd" ]; then
	OS="bsd";
fi;



_print_help() {

	echo " (L) ";
	echo -e "\e[42m\e[97m (I) lychee.js $LYCHEEJS_VERSION Helper \e[0m";
	echo " (L) ";
	echo " (L) Detected lychee.js Installation: \"$LYCHEEJS_ROOT\"";
	echo " (L) ";
	echo " (L) Usage: lycheejs-helper lycheejs://[Action]=[Library/Project]             ";
	echo " (L)        lycheejs-helper lycheejs://[Action]=[Command/Profile]?data=[Data] ";
	echo " (L)        lycheejs-helper [Helper]:[Platform/Identifier]                    ";
	echo " (L)        lycheejs-helper [Action] [Library/Project]                        ";
	echo " (L)        lycheejs-helper [Action] [Command/Profile] [Data]                 ";
	echo " (L) ";
	echo " (L) Usage Notes: ";
	echo " (L) ";
	echo " (L)     [Command] has to exist in /usr/local/bin/. ";
	echo " (L)     [Data] is always base64 encoded.           ";
	echo " (L) ";
	echo " (L)     The \"env:\" can be used as a Shebang in shell scripts: ";
	echo " (L)     #!/usr/local/bin/lycheejs-helper env:node               ";
	echo " (L) ";
	echo " (L) ";
	echo " (L) Available Actions: ";
	echo " (L) ";
	echo " (L)     start, stop, file, edit  Integrates lychee.js with native applications. ";
	echo " (L) ";
	echo " (L)     boot [Profile]           Boots the Harvester with [Profile].          ";
	echo " (L)     profile [Profile] [Data] Changes the Harvester [Profile] with [Data]. ";
	echo " (L)     unboot                   Unboots the Harvester.                       ";
	echo " (L) ";
	echo " (L)     cmd [Command] [Data]     Executes a [Command] with [Data] as parameter. ";
	echo " (L)     web [URL]                Opens the default web browser with a [URL].    ";
	echo " (L) ";
	echo " (L) Available Helpers: ";
	echo " (L) ";
	echo " (L)     which:Platform           Resolves a runtime execution path.          ";
	echo " (L)     env:Platform             Executes a file in a runtime environment.   ";
	echo " (L)     run:Platform/Identifier  Executes a project in a fertilized runtime. ";
	echo " (L) ";
	echo " (L) Available Platforms: ";
	echo " (L) ";
	echo " (L)     html, html-nwjs, nidium, node, node-sdl ";
	echo " (L) ";
	echo " (L) Examples: ";
	echo " (L) ";
	echo " (L)     lycheejs-helper boot development                                  ";
	echo " (L)     lycheejs-helper start /projects/boilerplate                       ";
	echo " (L) ";
	echo " (L)     lycheejs-helper lycheejs://cmd=lycheejs-ranger?data=[base64_data] ";
	echo " (L)     lycheejs-helper lycheejs://web=https://cookie.engineer            ";
	echo " (L)     lycheejs-helper cmd lycheejs-studio                               ";
	echo " (L) ";
	echo " (L)     lycheejs-helper stop /projects/boilerplate                        ";
	echo " (L)     lycheejs-helper unboot                                            ";
	echo " (L) ";
	echo " (L)     lycheejs-helper env:node ./projects/boilerplate/harvester.js       ";
	echo " (L)     lycheejs-helper env:html ./projects/boilerplate/index.html         ";
	echo " (L)     lycheejs-helper run:html-nwjs/main /libraries/ranger              ";
	echo " (L) ";

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

_start_bin () {

	if [ -x "${1}" ]; then

		${1};

	else

		local prog_native=`which $(basename "${1}")`;

		if [ "$prog_native" != "" ] && [ -x "$prog_native" ]; then

			$prog_native;

		else

			>&2 echo "lycheejs-helper: \"$prog_native\": No such file or directory";
			exit 1;

		fi;

	fi;

}

_start_env () {

	local args_length=$#;

	if [ -x "${1}" ]; then

		_trap _handle_signal INT HUP KILL TERM EXIT;

		# FUCK YOU, bash. Seriously, fuck you.

		if [ $args_length == 1 ]; then
			"${1}" &
		elif [ $args_length == 2 ]; then
			"${1}" "${2}" &
		elif [ $args_length == 3 ]; then
			"${1}" "${2}" "${3}" &
		elif [ $args_length == 4 ]; then
			"${1}" "${2}" "${3}" "${4}" &
		elif [ $args_length == 5 ]; then
			"${1}" "${2}" "${3}" "${4}" "${5}" &
		elif [ $args_length == 6 ]; then
			"${1}" "${2}" "${3}" "${4}" "${5}" "${6}" &
		elif [ $args_length == 7 ]; then
			"${1}" "${2}" "${3}" "${4}" "${5}" "${6}" "${7}" &
		elif [ $args_length == 8 ]; then
			"${1}" "${2}" "${3}" "${4}" "${5}" "${6}" "${7}" "${8}" &
		elif [ $args_length == 9 ]; then
			"${1}" "${2}" "${3}" "${4}" "${5}" "${6}" "${7}" "${8}" "${9}" &
		elif [ $args_length == 10 ]; then
			"${1}" "${2}" "${3}" "${4}" "${5}" "${6}" "${7}" "${8}" "${9}" "${10}" &
		fi;


		CHILD_PID=$!;
		wait "$CHILD_PID";
		exit $?;

	else

		local prog_native=`which $(basename "${1}")`;

		if [ "$prog_native" != "" ] && [ -x "$prog_native" ]; then

			_trap _handle_signal INT HUP KILL TERM EXIT;

			# FUCK YOU, bash. Seriously, fuck you.

			if [ $args_length == 1 ]; then
				"$prog_native" &
			elif [ $args_length == 2 ]; then
				"$prog_native" "${2}" &
			elif [ $args_length == 3 ]; then
				"$prog_native" "${2}" "${3}" &
			elif [ $args_length == 4 ]; then
				"$prog_native" "${2}" "${3}" "${4}" &
			elif [ $args_length == 5 ]; then
				"$prog_native" "${2}" "${3}" "${4}" "${5}" &
			elif [ $args_length == 6 ]; then
				"$prog_native" "${2}" "${3}" "${4}" "${5}" "${6}" &
			elif [ $args_length == 7 ]; then
				"$prog_native" "${2}" "${3}" "${4}" "${5}" "${6}" "${7}" &
			elif [ $args_length == 8 ]; then
				"$prog_native" "${2}" "${3}" "${4}" "${5}" "${6}" "${7}" "${8}" &
			elif [ $args_length == 9 ]; then
				"$prog_native" "${2}" "${3}" "${4}" "${5}" "${6}" "${7}" "${8}" "${9}" &
			elif [ $args_length == 10 ]; then
				"$prog_native" "${2}" "${3}" "${4}" "${5}" "${6}" "${7}" "${8}" "${9}" "${10}" &
			fi;


			CHILD_PID=$!;
			wait "$CHILD_PID";
			exit $?;

		else

			>&2 echo "lycheejs-helper: '$prog_native': No such file or directory";
			exit 1;

		fi;

	fi;

}

_handle_action () {

	action="$1";
	resource="$2";
	data="$3";


	case "$action" in

		boot)

			if [ "$resource" != "" ]; then

				harvester=`which lycheejs-harvester 2> /dev/null`;

				if [ "$harvester" == "" ]; then
					harvester="$LYCHEEJS_ROOT/libraries/harvester/bin/harvester.sh";
				fi;

				cd $LYCHEEJS_ROOT;
				"$harvester" "stop" 2>&1;
				"$harvester" "start" "$resource" 2>&1;
				exit 0;

			else
				exit 1;
			fi;

		;;

		profile)

			if [ "$resource" != "" ]; then

				cd $LYCHEEJS_ROOT;
				_put_api_profile "$resource" "save" "$data";

			fi;

		;;

		unboot)

			harvester=`which lycheejs-harvester 2> /dev/null`;

			if [ "$harvester" == "" ]; then
				harvester="$LYCHEEJS_ROOT/libraries/harvester/bin/harvester.sh";
			fi;

			cd $LYCHEEJS_ROOT;
			"$harvester" "stop" 2>&1;
			exit 0;

		;;

		start)

			if [ "$resource" != "" ]; then

				cd $LYCHEEJS_ROOT;
				_put_api_project "$resource" "start";

			fi;

		;;

		stop)

			if [ "$resource" != "" ]; then

				cd $LYCHEEJS_ROOT;
				_put_api_project "$resource" "stop";

			fi;

		;;

		edit)

			studio=`which lycheejs-studio 2> /dev/null`;

			if [ "$studio" == "" ]; then
				studio="$LYCHEEJS_ROOT/libraries/studio/bin/studio.sh";
			fi;

			if [ -f "$studio" ]; then

				if [ "$OS" == "linux" ] || [ "$OS" == "macos" ] || [ "$OS" == "bsd" ]; then

					cd $LYCHEEJS_ROOT;
					"$studio" "$resource" 2>&1;
					exit 0;

				else
					exit 1;
				fi;

			fi;

		;;

		file)

			if [ "$resource" != "" ]; then

				if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

					gio_open=`which gio`;
					xdg_open=`which xdg-open`;

					if [ "$gio_open" != "" ]; then
						$gio_open open "$LYCHEEJS_ROOT$resource" 2>&1;
					else
						$xdg_open "file://$LYCHEEJS_ROOT$resource" 2>&1;
					fi;

					exit 0;

				elif [ "$OS" == "macos" ]; then

					open "file://$LYCHEEJS_ROOT$resource" 2>&1;
					exit 0;

				else
					exit 1;
				fi;

			else
				exit 1;
			fi;

		;;

		cmd)

			if [[ "$(echo $resource | cut -c 1-8)" == "lycheejs" && "$resource" != "lycheejs-helper" ]]; then

				if [ -x /usr/local/bin/$resource ]; then

					if [ "$data" != "" ]; then
						$resource $data;
						exit $?;
					else
						$resource;
						exit $?;
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


			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

				# XXX: Privacy First
				chrome1=`which chromium 2> /dev/null`;
				chrome2=`which chromium-browser 2> /dev/null`;
				chrome3=`which google-chrome 2> /dev/null`;
				chrome4=`which chrome 2> /dev/null`;

				if [ -x "$chrome1" ]; then
					"$chrome1" "$clean_resource";
				elif [ -x "$chrome2" ]; then
					"$chrome2" "$clean_resource";
				elif [ -x "$chrome3" ]; then
					"$chrome3" "$clean_resource";
				elif [ -x "$chrome4" ]; then
					"$chrome4" "$clean_resource";
				else

					gio_open=`which gio`;
					xdg_open=`which xdg-open`;

					if [ "$gio_open" != "" ]; then
						$gio_open open "$clean_resource" 2>&1;
					else
						$xdg_open "$clean_resource" 2>&1;
					fi;

				fi;

				exit 0;

			elif [ "$OS" == "macos" ]; then

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

}

_put_api_project () {

	data="{\"identifier\":\"$1\",\"action\":\"$2\"}";
	apiurl="http://localhost:4848/api/project/$2";

	result=$(curl --silent -H "Content-Type: application/json" -X POST -d "$data" $apiurl 2>&1);

	if [ "$result" != "" ]; then
		echo "";
		echo "$result";
		echo "";
	else
		exit 1;
	fi;

}

_put_api_profile () {

	data=$(echo $3 | base64 --decode);
	apiurl="http://localhost:4848/api/profile/$2";

	result=$(curl --silent -H "Content-Type: application/json" -X POST -d "$data" $apiurl 2>&1);

	if [ "$result" != "" ]; then
		echo "";
		echo "$result";
		echo "";
	else
		exit 1;
	fi;

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
		_handle_action "$action" "$resource" "$data";
	fi;

elif [ "$protocol" == "env" ]; then

	platform=$(echo $content | cut -d":" -f 2);
	program="${2}";
	arg1="${3}";
	arg2="${4}";
	arg3="${5}";
	arg4="${6}";
	arg5="${7}";
	arg6="${8}";
	arg7="${9}";
	arg8="${10}";

	if [ "$program" != "" ]; then

		if [ "$platform" == "html" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

				# XXX: Privacy First
				chrome1=`which chromium 2> /dev/null`;
				chrome2=`which chromium-browser 2> /dev/null`;
				chrome3=`which google-chrome 2> /dev/null`;
				chrome4=`which chrome 2> /dev/null`;

				if [ -x "$chrome1" ]; then
					"$chrome1" "$program";
				elif [ -x "$chrome2" ]; then
					"$chrome2" "$program";
				elif [ -x "$chrome3" ]; then
					"$chrome3" "$program";
				elif [ -x "$chrome4" ]; then
					"$chrome4" "$program";
				else

					gio_open=`which gio`;
					xdg_open=`which xdg-open`;

					if [ "$gio_open" != "" ]; then
						$gio_open open "$program" 2>&1;
					else
						$xdg_open "$program" 2>&1;
					fi;

				fi;

			elif [ "$OS" == "macos" ]; then

				chrome1="/Applications/Google Chrome.app";

				if [ -d "$chrome1" ]; then
					open -a "$chrome1" "$program";
				else
					open "$program" 2>&1;
				fi;

			fi;

		elif [ "$platform" == "html-nwjs" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
				_start_env $LYCHEEJS_ROOT/bin/runtime/html-nwjs/linux/$ARCH/nw $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;
			elif [ "$OS" == "macos" ]; then
				_start_env $LYCHEEJS_ROOT/bin/runtime/html-nwjs/macos/$ARCH/nwjs.app/Contents/MacOS/nwjs $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;
			fi;

		elif [ "$platform" == "nidium" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
				_start_env $LYCHEEJS_ROOT/bin/runtime/nidium/linux/$ARCH/nidium $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;
			elif [ "$OS" == "macos" ]; then
				_start_env $LYCHEEJS_ROOT/bin/runtime/nidium/macos/$ARCH/nidium $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;
			fi;

		elif [ "$platform" == "node" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
				_start_env $LYCHEEJS_ROOT/bin/runtime/node/linux/$ARCH/node $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;
			elif [ "$OS" == "macos" ]; then
				_start_env $LYCHEEJS_ROOT/bin/runtime/node/macos/$ARCH/node $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;
			fi;

		elif [ "$platform" == "node-sdl" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
				_start_env $LYCHEEJS_ROOT/bin/runtime/node-sdl/linux/$ARCH/node $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;
			elif [ "$OS" == "macos" ]; then
				_start_env $LYCHEEJS_ROOT/bin/runtime/node-sdl/macos/$ARCH/node $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;
			fi;

		fi;

	else

		if [ "$platform" == "html" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

				# XXX: Privacy First
				chrome1=`which chromium 2> /dev/null`;
				chrome2=`which chromium-browser 2> /dev/null`;
				chrome3=`which google-chrome 2> /dev/null`;
				chrome4=`which chrome 2> /dev/null`;
				x_www=`which x-www-browser 2> /dev/null`;

				if [ -x "$chrome1" ]; then
					"$chrome1";
				elif [ -x "$chrome2" ]; then
					"$chrome2";
				elif [ -x "$chrome3" ]; then
					"$chrome3";
				elif [ -x "$chrome4" ]; then
					"$chrome4";
				elif [ -x "$x_www" != "" ]; then
					"$x_www";
				fi;

			elif [ "$OS" == "macos" ]; then

				chrome1="/Applications/Google Chrome.app";

				if [ -d "$chrome1" ]; then
					open -a "$chrome1";
				fi;

			fi;

		elif [ "$platform" == "html-nwjs" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
				_start_bin $LYCHEEJS_ROOT/bin/runtime/html-nwjs/linux/$ARCH/nw;
			elif [ "$OS" == "macos" ]; then
				_start_bin $LYCHEEJS_ROOT/bin/runtime/html-nwjs/macos/$ARCH/nwjs.app/Contents/MacOS/nwjs;
			fi;

		elif [ "$platform" == "html-webview" ]; then

			echo -e "\e[41m\e[97m (E) No html-webview emulator support. \e[39m\e[49m\e[0m";

			exit 1;

		elif [ "$platform" == "nidium" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
				_start_bin $LYCHEEJS_ROOT/bin/runtime/nidium/linux/$ARCH/nidium;
			elif [ "$OS" == "macos" ]; then
				_start_bin $LYCHEEJS_ROOT/bin/runtime/nidium/macos/$ARCH/nidium;
			fi;

		elif [ "$platform" == "node" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
				_start_bin $LYCHEEJS_ROOT/bin/runtime/node/linux/$ARCH/node;
			elif [ "$OS" == "macos" ]; then
				_start_bin $LYCHEEJS_ROOT/bin/runtime/node/macos/$ARCH/node;
			fi;

		elif [ "$platform" == "node-sdl" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
				_start_bin $LYCHEEJS_ROOT/bin/runtime/node-sdl/linux/$ARCH/node;
			elif [ "$OS" == "macos" ]; then
				_start_bin $LYCHEEJS_ROOT/bin/runtime/node-sdl/macos/$ARCH/node;
			fi;

		fi;

	fi;


	exit 0;

elif [ "$protocol" == "run" ]; then

	platform=$(echo $content | cut -d":" -f 2 | cut -d"/" -f 1);
	identifier=$(echo $content | cut -d":" -f 2 | cut -d"/" -f 2);
	resource="${2}";
	arg1="${3}";
	arg2="${4}";
	arg3="${5}";
	arg4="${6}";
	arg5="${7}";
	arg6="${8}";
	arg7="${9}";
	arg8="${10}";


	if [ "$resource" != "" ] && [ -d "$LYCHEEJS_ROOT$resource/build" ]; then

		build="$LYCHEEJS_ROOT$resource/build";
		name=$(echo $resource | cut -d"/" -f 3);


		if [ "$platform" == "html" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

				if [ -d "$build/html/$identifier" ]; then

					program="$build/html/$identifier/index.html";

					if [ -f "$program" ]; then

						# XXX: Privacy First
						chrome1=`which chromium 2> /dev/null`;
						chrome2=`which chromium-browser 2> /dev/null`;
						chrome3=`which google-chrome 2> /dev/null`;
						chrome4=`which chrome 2> /dev/null`;

						if [ -x "$chrome1" ]; then
							"$chrome1" "$program";
						elif [ -x "$chrome2" ]; then
							"$chrome2" "$program";
						elif [ -x "$chrome3" ]; then
							"$chrome3" "$program";
						elif [ -x "$chrome4" ]; then
							"$chrome4" "$program";
						else

							gio_open=`which gio`;
							xdg_open=`which xdg-open`;

							if [ "$gio_open" != "" ]; then
								$gio_open open "$program" 2>&1;
							else
								$xdg_open "$program" 2>&1;
							fi;

						fi;

					else
						exit 1;
					fi;

				else
					exit 1;
				fi;

			elif [ "$OS" == "macos" ]; then

				if [ -d "$build/html/$identifier" ]; then

					program="$build/html/$identifier/index.html";

					if [ -f "$program" ]; then

						chrome1="/Applications/Google Chrome.app";

						if [ -x "$chrome1" ]; then
							open -a "$chrome1" "$program";
						else
							open "$program" 2>&1;
						fi;

					fi;

				else
					exit 1;
				fi;

			fi;

		elif [ "$platform" == "html-nwjs" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

				if [ -d "$build/html-nwjs/$identifier-linux/$ARCH" ]; then

					program="$build/html-nwjs/$identifier-linux/$ARCH/$name.bin";

					if [ -f $program ]; then
						chmod +x $program;
						_start_env $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;
					else
						exit 1;
					fi;

				elif [ -d "$build/html-nwjs/$identifier" ]; then

					program="$build/html-nwjs/$identifier";
					_start_env $LYCHEEJS_ROOT/bin/runtime/html-nwjs/linux/$ARCH/nw $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;

				fi;

			elif [ "$OS" == "macos" ]; then

				if [ -d "$build/html-nwjs/$identifier-macos/$ARCH" ]; then

					program="$build/html-nwjs/$identifier-macos/$ARCH/$name.app";

					if [ -f $program ]; then
						chmod +x $program;
						open $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8 2>&1;
					else
						exit 1;
					fi;

				elif [ -d "$build/html-nwjs/$identifier" ]; then

					program="$build/html-nwjs/$identifier";
					_start_env $LYCHEEJS_ROOT/bin/runtime/html-nwjs/macos/$ARCH/nwjs.app/Contents/MacOS/nwjs $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;

				fi;

			fi;

		elif [ "$platform" == "html-webview" ]; then

			echo -e "\e[41m\e[97m (E) No html-webview emulator support. \e[39m\e[49m\e[0m";

			exit 1;

		elif [ "$platform" == "nidium" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

				if [ -d "$build/nidium/$identifier-linux/$ARCH" ]; then

					program="$build/nidium/$identifier-linux/$ARCH/$name.sh";

					if [ -f $program ]; then
						chmod +x $program;
						_start_env $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;
					else
						exit 1;
					fi;

				elif [ -d "$build/nidium/$identifier" ]; then

					program="$build/nidium/$identifier";
					_start_env $LYCHEEJS_ROOT/bin/runtime/nidium/linux/$ARCH/nidium $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;

				fi;

			elif [ "$OS" == "macos" ]; then

				if [ -d "$build/nidium/$identifier-macos/$ARCH" ]; then

					program="$build/nidium/$identifier-macos/$ARCH/$name.sh";

					if [ -f $program ]; then
						chmod +x $program;
						_start_env $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;
					else
						exit 1;
					fi;

				elif [ -d "$build/nidium/$identifier" ]; then

					program="$build/nidium/$identifier";
					_start_env $LYCHEEJS_ROOT/bin/runtime/nidium/macos/$ARCH/nidium $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;

				fi;

			fi;

		elif [ "$platform" == "node" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

				if [ -d "$build/node/$identifier-linux/$ARCH" ]; then

					program="$build/node/$identifier-linux/$ARCH/$name.sh";

					if [ -f $program ]; then
						chmod +x $program;
						_start_env $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;
					else
						exit 1;
					fi;

				elif [ -d "$build/node/$identifier" ]; then

					program="$build/node/$identifier";
					_start_env $LYCHEEJS_ROOT/bin/runtime/node/linux/$ARCH/node $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;

				fi;

			elif [ "$OS" == "macos" ]; then

				if [ -d "$build/node/$identifier-macos/$ARCH" ]; then

					program="$build/node/$identifier-macos/$ARCH/$name.sh";

					if [ -f $program ]; then
						chmod +x $program;
						_start_env $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;
					else
						exit 1;
					fi;

				elif [ -d "$build/node/$identifier" ]; then

					program="$build/node/$identifier";
					_start_env $LYCHEEJS_ROOT/bin/runtime/node/macos/$ARCH/node $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;

				fi;

			fi;

		elif [ "$platform" == "node-sdl" ]; then

			if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

				if [ -d "$build/node-sdl/$identifier-linux/$ARCH" ]; then

					program="$build/node-sdl/$identifier-linux/$ARCH/$name.sh";

					if [ -f $program ]; then
						chmod +x $program;
						_start_env $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;
					else
						exit 1;
					fi;

				elif [ -d "$build/node-sdl/$identifier" ]; then

					program="$build/node-sdl/$identifier";
					_start_env $LYCHEEJS_ROOT/bin/runtime/node-sdl/linux/$ARCH/node $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;

				fi;

			elif [ "$OS" == "macos" ]; then

				if [ -d "$build/node-sdl/$identifier-macos/$ARCH" ]; then

					program="$build/node-sdl/$identifier-macos/$ARCH/$name.sh";

					if [ -f $program ]; then
						chmod +x $program;
						_start_env $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;
					else
						exit 1;
					fi;

				elif [ -d "$build/node-sdl/$identifier" ]; then

					program="$build/node-sdl/$identifier";
					_start_env $LYCHEEJS_ROOT/bin/runtime/node-sdl/macos/$ARCH/node $program $arg1 $arg2 $arg3 $arg4 $arg5 $arg6 $arg7 $arg8;

				fi;

			fi;

		fi;

	else
		exit 1;
	fi;

elif [ "$protocol" == "which" ]; then

	platform=$(echo $content | cut -d":" -f 2);


	if [ "$platform" == "html" ]; then

		if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then

			# XXX: Privacy First
			chrome1=`which chromium 2> /dev/null`;
			chrome2=`which chromium-browser 2> /dev/null`;
			chrome3=`which google-chrome 2> /dev/null`;
			chrome4=`which chrome 2> /dev/null`;
			x_www=`which x-www-browser 2> /dev/null`;

			if [ -x "$chrome1" ]; then
				echo "$chrome1";
			elif [ -x "$chrome2" ]; then
				echo "$chrome2";
			elif [ -x "$chrome3" ]; then
				echo "$chrome3";
			elif [ -x "$chrome4" ]; then
				echo "$chrome4";
			elif [ "$x_www" != "" ]; then
				echo "$(readlink -f "$x_www")";
			fi;

		elif [ "$OS" == "macos" ]; then

			chrome1="/Applications/Google Chrome.app";
			safari1="/Applications/Safari.app";

			if [ -d "$chrome1" ]; then
				echo "$chrome1/Contents/MacOS/Chrome";
			else
				echo "$safari1/Contents/MacOS/Safari";
			fi;

		fi;


	elif [ "$platform" == "html-nwjs" ]; then

		if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
			echo $LYCHEEJS_ROOT/bin/runtime/html-nwjs/linux/$ARCH/nw;
		elif [ "$OS" == "macos" ]; then
			echo $LYCHEEJS_ROOT/bin/runtime/html-nwjs/macos/$ARCH/nwjs.app/Contents/MacOS/nwjs;
		fi;

	elif [ "$platform" == "nidium" ]; then

		if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
			echo $LYCHEEJS_ROOT/bin/runtime/nidium/linux/$ARCH/nidium;
		elif [ "$OS" == "macos" ]; then
			echo $LYCHEEJS_ROOT/bin/runtime/nidium/macos/$ARCH/nidium;
		fi;

	elif [ "$platform" == "node" ]; then

		if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
			echo $LYCHEEJS_ROOT/bin/runtime/node/linux/$ARCH/node;
		elif [ "$OS" == "macos" ]; then
			echo $LYCHEEJS_ROOT/bin/runtime/node/macos/$ARCH/node;
		fi;

	elif [ "$platform" == "node-sdl" ]; then

		if [ "$OS" == "linux" ] || [ "$OS" == "bsd" ]; then
			echo $LYCHEEJS_ROOT/bin/runtime/node-sdl/linux/$ARCH/node;
		elif [ "$OS" == "macos" ]; then
			echo $LYCHEEJS_ROOT/bin/runtime/node-sdl/macos/$ARCH/node;
		fi;

	fi;

else

	action="$1";
	resource="$2";
	data="$3";


	if [ "$action" != "" -a "$resource" != "" ]; then

		_handle_action "$action" "$resource" "$data";

	else

		_print_help;

		exit 1;

	fi;

fi;

