#!/bin/bash

# XXX: NWJS guys have no symlink at /latest (it's outdated)
# XXX: Old versions (until 0.13) hosted on other server
# NWJS_DOWNLOAD="http://nwjs.s3-us-west-2.amazonaws.com";

NWJS_DOWNLOAD="http://dl.nwjs.io";
NWJS_VERSION="v0.33.3";
NWJS_AWSXML="http://nwjs2.s3.amazonaws.com/?delimiter=/&prefix=$NWJS_VERSION%2F";
RUNTIME_ROOT=$(cd "$(dirname "$0")/"; pwd);

ERROR_HAPPENED="false";
ALWAYS_YES="false";

if [ "$1" == "--yes" ] || [ "$1" == "-y" ]; then
	ALWAYS_YES="true";
fi;



_download_linux () {

	if [ "$1" == "" ]; then
		return;
	fi;

	rm -rf $RUNTIME_ROOT/.tmp;
	mkdir $RUNTIME_ROOT/.tmp;

	download="$NWJS_DOWNLOAD/$1";
	old_hash="";
	new_hash="$2";
	folder="$RUNTIME_ROOT/$3";

	if [ -f "$folder/.download_hash" ]; then
		old_hash="$(cat $folder/.download_hash)";
	fi;


	if [ "$ALWAYS_YES" == "true" ] || [ "$old_hash" != "$new_hash" ]; then

		filename=$(basename "$download");
		echo -e " (L) DOWNLOAD \"$filename\" into \"$3\" \e[0m";

		if [ ! -d "$folder" ]; then
			mkdir -p "$folder";
		fi;

		cd $RUNTIME_ROOT/.tmp;
		curl --retry 8 --retry-connrefused -SL --progress-bar -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.112 Safari/534.30" $download > download.tar.gz;

		if [ $? == 0 ] && [ -f ./download.tar.gz ]; then

			tar -zxf ./download.tar.gz;

			if [ $? == 0 ]; then

				if [ ! -d "$folder/lib" ]; then
					mkdir "$folder/lib";
				fi;

				if [ ! -d "$folder/locales" ]; then
					mkdir "$folder/locales";
				fi;

				if [ ! -d "$folder/swiftshader" ]; then
					mkdir "$folder/swiftshader";
				fi;

				mv $RUNTIME_ROOT/.tmp/nwjs-*/lib/libffmpeg.so         $folder/lib/libffmpeg.so;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/lib/libnode.so           $folder/lib/libnode.so;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/lib/libnw.so             $folder/lib/libnw.so;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/locales/en-US.pak        $folder/locales/en-US.pak;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/swiftshader/libEGL.so    $folder/swiftshader/libEGL.so;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/swiftshader/libGLESv2.so $folder/swiftshader/libGLESv2.so;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/icudtl.dat               $folder/icudtl.dat;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/natives_blob.bin         $folder/natives_blob.bin;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/nw                       $folder/nw;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/nw_100_percent.pak       $folder/nw_100_percent.pak;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/nw_200_percent.pak       $folder/nw_200_percent.pak;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/resources.pak            $folder/resources.pak;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/v8_context_snapshot.bin  $folder/v8_context_snapshot.bin;

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

_download_macos () {

	if [ "$1" == "" ]; then
		return;
	fi;


	rm -rf $RUNTIME_ROOT/.tmp;
	mkdir $RUNTIME_ROOT/.tmp;

	download="$NWJS_DOWNLOAD/$1";
	old_hash="";
	new_hash="$2";
	folder="$RUNTIME_ROOT/$3";

	if [ -f "$folder/.download_hash" ]; then
		old_hash="$(cat $folder/.download_hash)";
	fi;


	if [ "$ALWAYS_YES" == "true" ] || [ "$old_hash" != "$new_hash" ]; then

		filename=$(basename "$download");
		echo -e " (L) DOWNLOAD \"$filename\" into \"$3\" \e[0m";

		if [ ! -d "$folder" ]; then
			mkdir -p "$folder";
		fi;

		cd $RUNTIME_ROOT/.tmp;
		curl --retry 8 --retry-connrefused -SL --progress-bar -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.112 Safari/534.30" $download > download.zip;

		if [ $? == 0 ] && [ -f ./download.zip ]; then

			unzip -q ./download.zip;

			if [ $? == 0 ]; then

				rm -rf $folder/nwjs.app;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/nwjs.app $folder/nwjs.app;

				echo "$new_hash" > $folder/.download_hash;
				echo -e "\e[42m\e[97m (I) SUCCESS \e[39m\e[49m\e[0m";


				if [ -f "$folder/nwjs.app/Contents/Info.plist" ]; then
					sed -i '10s|nwjs|__NAME__|' "$folder/nwjs.app/Contents/Info.plist";
				fi;

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

_download_windows () {

	if [ "$1" == "" ]; then
		return;
	fi;

	rm -rf $RUNTIME_ROOT/.tmp;
	mkdir $RUNTIME_ROOT/.tmp;

	download="$NWJS_DOWNLOAD/$1";
	old_hash="";
	new_hash="$2";
	folder="$RUNTIME_ROOT/$3";

	if [ -f "$folder/.download_hash" ]; then
		old_hash="$(cat $folder/.download_hash)";
	fi;


	if [ "$ALWAYS_YES" == "true" ] || [ "$old_hash" != "$new_hash" ]; then

		filename=$(basename "$download");
		echo -e " (L) DOWNLOAD \"$filename\" into \"$3\" \e[0m";

		if [ ! -d "$folder" ]; then
			mkdir -p "$folder";
		fi;

		cd $RUNTIME_ROOT/.tmp;
		curl --retry 8 --retry-connrefused -SL --progress-bar -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.112 Safari/534.30" $download > download.zip;

		if [ $? == 0 ] && [ -f ./download.zip ]; then

			unzip -q ./download.zip;

			if [ $? == 0 ]; then

				if [ ! -d "$folder/locales" ]; then
					mkdir "$folder/locales";
				fi;

				if [ ! -d "$folder/swiftshader" ]; then
					mkdir "$folder/swiftshader";
				fi;

				mv $RUNTIME_ROOT/.tmp/nwjs-*/locales/en-US.pak         $folder/locales/en-US.pak;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/swiftshader/libEGL.dll    $folder/swiftshader/libEGL.dll;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/swiftshader/libGLESv2.dll $folder/swiftshader/libGLESv2.dll;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/d3dcompiler_47.dll        $folder/d3dcompiler_47.dll;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/ffmpeg.dll                $folder/ffmpeg.dll;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/icudtl.dat                $folder/icudtl.dat;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/libEGL.dll                $folder/libEGL.dll;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/libGLESv2.dll             $folder/libGLESv2.dll;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/natives_blob.bin          $folder/natives_blob.bin;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/node.dll                  $folder/node.dll;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/nw.dll                    $folder/nw.dll;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/nw.exe                    $folder/nw.exe;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/nw_100_percent.pak        $folder/nw_100_percent.pak;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/nw_200_percent.pak        $folder/nw_200_percent.pak;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/nw_elf.dll                $folder/nw_elf.dll;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/resources.pak             $folder/resources.pak;
				mv $RUNTIME_ROOT/.tmp/nwjs-*/v8_context_snapshot.bin   $folder/v8_context_snapshot.bin;

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



echo " (L) UPDATE html-nwjs ...";
cd $RUNTIME_ROOT;

if [ ! -d ./.tmp ]; then
	mkdir .tmp;
fi;

if [ -f ./SHASUMS256.txt ]; then
	rm ./SHASUMS256.txt;
fi;



echo " (L) DOWNLOAD aws.xml";
cd $RUNTIME_ROOT;
curl -SL --progress-bar "$NWJS_AWSXML" > ./aws.xml;

if [ $? == 0 ]; then

	echo " (L) SUCCESS";

	cat ./aws.xml | grep -oPm1 "(?<=<Key>)[^<]+"  | sed -e "s/\s/\n/g"   > ./files.txt;
	cat ./aws.xml | grep -oPm1 "(?<=<ETag>)[^<]+" | sed -e "s/&quot;//g" > ./hashes.txt;

	LINUX_X86=$(cat ./files.txt | grep -n nwjs-v | grep linux-ia32 | grep gz | cut -d":" -f1);
	FILE_LINUX_X86=$(sed -n "${LINUX_X86}p" ./files.txt);
	HASH_LINUX_X86=$(sed -n "${LINUX_X86}p" ./hashes.txt);

	LINUX_X64=$(cat ./files.txt | grep -n nwjs-v | grep linux-x64 | grep gz | cut -d":" -f1);
	FILE_LINUX_X64=$(sed -n "${LINUX_X64}p" ./files.txt);
	HASH_LINUX_X64=$(sed -n "${LINUX_X64}p" ./hashes.txt);

	MACOS_X64=$(cat ./files.txt | grep -n nwjs-v | grep osx-x64 | grep zip | cut -d":" -f1);
	FILE_MACOS_X64=$(sed -n "${MACOS_X64}p" ./files.txt);
	HASH_MACOS_X64=$(sed -n "${MACOS_X64}p" ./hashes.txt);

	WINDOWS_X86=$(cat ./files.txt | grep -n nwjs-v | grep win-ia32 | grep zip | cut -d":" -f1);
	FILE_WINDOWS_X86=$(sed -n "${WINDOWS_X86}p" ./files.txt);
	HASH_WINDOWS_X86=$(sed -n "${WINDOWS_X86}p" ./hashes.txt);

	WINDOWS_X64=$(cat ./files.txt | grep -n nwjs-v | grep win-x64 | grep zip | cut -d":" -f1);
	FILE_WINDOWS_X64=$(sed -n "${WINDOWS_X64}p" ./files.txt);
	HASH_WINDOWS_X64=$(sed -n "${WINDOWS_X64}p" ./hashes.txt);


	cd $RUNTIME_ROOT;

	if [ "$FILE_LINUX_X86" != "" ]; then
		_download_linux "$FILE_LINUX_X86" "$HASH_LINUX_X86" "linux/x86";
	fi;

	if [ "$FILE_LINUX_X64" != "" ]; then
		_download_linux "$FILE_LINUX_X64" "$HASH_LINUX_X64" "linux/x86_64";
	fi;

	if [ "$FILE_MACOS_X64" != "" ]; then
		_download_macos "$FILE_MACOS_X64" "$HASH_MACOS_X64" "macos/x86_64";
	fi;

	if [ "$FILE_WINDOWS_X86" != "" ]; then
		_download_windows "$FILE_WINDOWS_X86" "$HASH_WINDOWS_X86" "windows/x86";
	fi;

	if [ "$FILE_WINDOWS_X64" != "" ]; then
		_download_windows "$FILE_WINDOWS_X64" "$HASH_WINDOWS_X64" "windows/x86_64";
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

