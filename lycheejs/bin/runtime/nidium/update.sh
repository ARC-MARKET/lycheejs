#!/bin/bash

NIDIUM_DOWNLOAD="https://nidium.com/downloads/";
NIDIUM_FILEHOST="https://nidium.com";
RUNTIME_ROOT=$(cd "$(dirname "$0")/"; pwd);

ERROR_HAPPENED="false";
ALWAYS_YES="false";


if [ "$1" == "--yes" ] || [ "$1" == "-y" ]; then
	ALWAYS_YES="true";
fi;



_download_dmg () {

	rm -rf $RUNTIME_ROOT/.tmp;
	mkdir $RUNTIME_ROOT/.tmp;

	download="$NIDIUM_FILEHOST$1";
	old_hash="";
	new_hash="$2";
	folder="$RUNTIME_ROOT/$(dirname $3)";
	target="$RUNTIME_ROOT/$3";

	if [ -f "$folder/.download_hash" ]; then
		old_hash="$(cat $folder/.download_hash)";
	fi;


	if [ "$ALWAYS_YES" == "true" ] || [ "$old_hash" != "$new_hash" ]; then

		filename=$(basename "$download");
		echo -e " (L) DOWNLOAD \"$filename\" into \"$3\"\e[0m";

		cd $RUNTIME_ROOT/.tmp;
		curl --retry 8 --retry-connrefused -SL --progress-bar -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.112 Safari/534.30" $download > download.dmg;

		if [ $? == 0 ]; then

			echo " (L) EXTRACT download.dmg";
			7z x ./download.dmg 1> /dev/null 2> /dev/null;

			if [ $? == 0 ]; then
				mv $RUNTIME_ROOT/.tmp/Nidium/nidium.app/Contents/MacOS/nidium $target;
				echo "$new_hash" > $folder/.download_hash;
				echo -e "\e[42m\e[97m (I) SUCCESS \e[39m\e[49m\e[0m";
			else
				ERROR_HAPPENED="true";
				echo -e "\e[41m\e[97m (E) EXTRACT FAILURE \e[39m\e[49m\e[0m";
			fi;

		else
			ERROR_HAPPENED="true";
			echo -e "\e[41m\e[97m (E) DOWNLOAD FAILURE \e[39m\e[49m\e[0m";
		fi;


	fi;

}

_download_run () {

	rm -rf $RUNTIME_ROOT/.tmp;
	mkdir $RUNTIME_ROOT/.tmp;

	download="$NIDIUM_FILEHOST$1";
	old_hash="";
	new_hash="$2";
	folder="$RUNTIME_ROOT/$(dirname $3)";
	target="$RUNTIME_ROOT/$3";

	if [ -f "$folder/.download_hash" ]; then
		old_hash="$(cat $folder/.download_hash)";
	fi;


	if [ "$ALWAYS_YES" == "true" ] || [ "$old_hash" != "$new_hash" ]; then

		filename=$(basename "$download");
		echo -e " (L) DOWNLOAD \"$filename\" into \"$3\"\e[0m";

		cd $RUNTIME_ROOT/.tmp;
		curl --retry 8 --retry-connrefused -SL --progress-bar -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.112 Safari/534.30" $download > download.run;

		if [ $? == 0 ]; then

			echo " (L) EXTRACT download.run";
			chmod +x ./download.run;
			./download.run --nox11 --quiet --nochown --tar xvf 1> /dev/null 2> /dev/null;

			if [ $? == 0 ]; then
				mv $RUNTIME_ROOT/.tmp/dist/nidium $target;
				echo "$new_hash" > $folder/.download_hash;
				echo -e "\e[42m\e[97m (I) SUCCESS \e[39m\e[49m\e[0m";
			else
				ERROR_HAPPENED="true";
				echo -e "\e[41m\e[97m (E) EXTRACT FAILURE \e[39m\e[49m\e[0m";
			fi;

		else
			ERROR_HAPPENED="true";
			echo -e "\e[41m\e[97m (E) DOWNLOAD FAILURE \e[39m\e[49m\e[0m";
		fi;

	fi;

}


echo " (L) UPDATE nidium ...";
cd $RUNTIME_ROOT;

if [ ! -d ./.tmp ]; then
	mkdir .tmp;
fi;

if [ -f ./downloads.html ]; then
	rm ./downloads.html;
fi;



echo " (L) DOWNLOAD downloads.html";
cd $RUNTIME_ROOT;
curl -SL --progress-bar "$NIDIUM_DOWNLOAD" > ./downloads.html;

if [ $? == 0 ]; then

	FILE_LINUX_X64=$(cat ./downloads.html | grep Nidium_frontend | grep Linux_x86-64  | head -n 1 | grep run | cut -d'"' -f2);
	HASH_LINUX_X64=$(cat ./downloads.html | grep Nidium_frontend | grep Linux_x86-64  | head -n 1 | grep run | cut -d'"' -f2 | cut -d"_" -f5);

	FILE_MACOS_X64=$(cat ./downloads.html | grep Nidium_frontend | grep Darwin_x86-64 | head -n 1 | grep dmg | cut -d'"' -f2);
	HASH_MACOS_X64=$(cat ./downloads.html | grep Nidium_frontend | grep Darwin_x86-64 | head -n 1 | grep dmg | cut -d'"' -f2 | cut -d"_" -f5);

	cd $RUNTIME_ROOT;

	if [ "$FILE_LINUX_X64" != "" ]; then
		_download_run "$FILE_LINUX_X64" "$HASH_LINUX_X64" "linux/x86_64/nidium";
	fi;

	if [ "$FILE_MACOS_X64" != "" ]; then
		_download_dmg "$FILE_MACOS_X64" "$HASH_MACOS_X64" "macos/x86_64/nidium";
	fi;

	rm -rf $RUNTIME_ROOT/.tmp;

else
	ERROR_HAPPENED="true";
	echo -e "\e[41m\e[97m (E) DOWNLOAD FAILURE \e[39m\e[49m\e[0m";
fi;



if [ "$ERROR_HAPPENED" == "false" ]; then
	echo -e "\e[42m\e[97m (I) SUCCESS \e[39m\e[49m\e[0m";
	exit 0;
else
	echo -e "\e[41m\e[97m (E) FAILURE \e[39m\e[49m\e[0m";
	exit 1;
fi;

