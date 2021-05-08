#!/bin/bash

NODE_DOWNLOAD="https://nodejs.org/dist/latest";
RUNTIME_ROOT=$(cd "$(dirname "$0")/"; pwd);

ERROR_HAPPENED="false";
ALWAYS_YES="false";

if [ "$1" == "--yes" ] || [ "$1" == "-y" ]; then
	ALWAYS_YES="true";
fi;



_download_archive () {

	rm -rf $RUNTIME_ROOT/.tmp;
	mkdir $RUNTIME_ROOT/.tmp;

	download="$NODE_DOWNLOAD/$1";
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
		curl --retry 8 --retry-connrefused -SL --progress-bar -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.112 Safari/534.30" $download > download.tar.gz;

		if [ $? == 0 ]; then

			echo " (L) EXTRACT download.tar.gz";
			tar -zxf ./download.tar.gz;

			if [ $? == 0 ]; then
				mv $RUNTIME_ROOT/.tmp/node-*/bin/node $target;
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

_download_file () {

	rm -rf $RUNTIME_ROOT/.tmp;
	mkdir $RUNTIME_ROOT/.tmp;

	download="$NODE_DOWNLOAD/$1";
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
		curl --retry 8 --retry-connrefused -SL --progress-bar -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.112 Safari/534.30" $download > download.bin;

		if [ $? == 0 ]; then
			mv download.bin $target;
			echo "$new_hash" > $folder/.download_hash;
			echo -e "\e[42m\e[97m (I) SUCCESS \e[39m\e[49m\e[0m";
		else
			ERROR_HAPPENED="true";
			echo -e "\e[41m\e[97m (E) DOWNLOAD FAILURE \e[39m\e[49m\e[0m";
		fi;

	fi;

}


echo " (L) UPDATE node ...";
cd $RUNTIME_ROOT;

if [ ! -d ./.tmp ]; then
	mkdir .tmp;
fi;

if [ -f ./SHA256SUMS.txt ]; then
	rm ./SHA256SUMS.txt;
fi;



echo " (L) DOWNLOAD SHASUMS256.txt";
cd $RUNTIME_ROOT;
curl -SL --progress-bar "$NODE_DOWNLOAD/SHASUMS256.txt" > ./SHASUMS256.txt;

if [ $? == 0 ]; then

	echo " (L) SUCCESS";

	FILE_LINUX_ARM=$(  cat ./SHASUMS256.txt | grep linux-armv7l | grep gz  | cut -d" " -f3);
	HASH_LINUX_ARM=$(  cat ./SHASUMS256.txt | grep linux-armv7l | grep gz  | cut -d" " -f1);

	FILE_LINUX_X64=$(  cat ./SHASUMS256.txt | grep linux-x64    | grep gz  | cut -d" " -f3);
	HASH_LINUX_X64=$(  cat ./SHASUMS256.txt | grep linux-x64    | grep gz  | cut -d" " -f1);

	FILE_MACOS_X64=$(  cat ./SHASUMS256.txt | grep darwin-x64   | grep gz  | cut -d" " -f3);
	HASH_MACOS_X64=$(  cat ./SHASUMS256.txt | grep darwin-x64   | grep gz  | cut -d" " -f1);

	FILE_WINDOWS_X86=$(cat ./SHASUMS256.txt | grep win-x86      | grep exe | cut -d" " -f3);
	HASH_WINDOWS_X86=$(cat ./SHASUMS256.txt | grep win-x86      | grep exe | cut -d" " -f1);

	FILE_WINDOWS_X64=$(cat ./SHASUMS256.txt | grep win-x64      | grep exe | cut -d" " -f3);
	HASH_WINDOWS_X64=$(cat ./SHASUMS256.txt | grep win-x64      | grep exe | cut -d" " -f1);


	cd $RUNTIME_ROOT;

	if [ "$FILE_LINUX_ARM" != "" ]; then
		_download_archive "$FILE_LINUX_ARM" "$HASH_LINUX_ARM" "linux/arm/node";
	fi;

	if [ "$FILE_LINUX_X64" != "" ]; then
		_download_archive "$FILE_LINUX_X64" "$HASH_LINUX_X64" "linux/x86_64/node";
	fi;

	if [ "$FILE_MACOS_X64" != "" ]; then
		_download_archive "$FILE_MACOS_X64" "$HASH_MACOS_X64" "macos/x86_64/node";
	fi;

	if [ "$FILE_WINDOWS_X86" != "" ]; then
		_download_file "$FILE_WINDOWS_X86" "$HASH_WINDOWS_X86" "windows/x86/node.exe";
	fi;

	if [ "$FILE_WINDOWS_X64" != "" ]; then
		_download_file "$FILE_WINDOWS_X64" "$HASH_WINDOWS_X64" "windows/x86_64/node.exe";
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

