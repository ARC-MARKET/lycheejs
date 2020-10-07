#!/bin/bash

LYCHEEJS_ROOT=$(cd "$(dirname "$(readlink -f "$0")")/../../../"; pwd);
PROJECT_ROOT=$(cd "$(dirname "$(readlink -f "$0")")/../"; pwd);
PROJECT_BUILD="$1";


if [ -d $PROJECT_ROOT/build ]; then

	cd $PROJECT_ROOT;

	if [ "$PROJECT_BUILD" == "html/main" ]; then

		cd "$PROJECT_ROOT/build/$PROJECT_BUILD";
		zip -qr "$PROJECT_ROOT/build/boilerplate-browser-all.zip" ./*;

		# XXX: Keep html build for website embedding
		# rm -rf "$PROJECT_ROOT/build/$PROJECT_BUILD";

	elif [ "$PROJECT_BUILD" == "html-nwjs/main" ]; then

		if [ -d "$PROJECT_ROOT/build/$PROJECT_BUILD-linux-x86_64" ]; then
			cd "$PROJECT_ROOT/build/$PROJECT_BUILD-linux-x86_64";
			zip -qr "$PROJECT_ROOT/build/boilerplate-linux-x86_64.zip" ./*;
			rm -rf "$PROJECT_ROOT/build/$PROJECT_BUILD-linux-x86_64";
		fi;

		if [ -d "$PROJECT_ROOT/build/$PROJECT_BUILD-macos-x86_64" ]; then
			cd "$PROJECT_ROOT/build/$PROJECT_BUILD-macos-x86_64";
			zip -qr "$PROJECT_ROOT/build/boilerplate-macos-x86_64.zip" ./*;
			rm -rf "$PROJECT_ROOT/build/$PROJECT_BUILD-macos-x86_64";
		fi;

		if [ -d "$PROJECT_ROOT/build/$PROJECT_BUILD-windows-x86_64" ]; then
			cd "$PROJECT_ROOT/build/$PROJECT_BUILD-windows-x86_64";
			zip -qr "$PROJECT_ROOT/build/boilerplate-windows-x86_64.zip" ./*;
			rm -rf "$PROJECT_ROOT/build/$PROJECT_BUILD-windows-x86_64";
		fi;

		rm -rf "$PROJECT_ROOT/build/$PROJECT_BUILD" 2> /dev/null;

	elif [ "$PROJECT_BUILD" == "html-webview/main" ]; then

		cp "$PROJECT_ROOT/build/$PROJECT_BUILD-android/app-release-unsigned.apk" "$PROJECT_ROOT/build/boilerplate_android_all.apk";
		rm -rf "$PROJECT_ROOT/build/$PROJECT_BUILD-android";

		cp "$PROJECT_ROOT/build/$PROJECT_BUILD-firefoxos/app.zip" "$PROJECT_ROOT/build/boilerplate_firefoxos_all.zip";
		rm -rf "$PROJECT_ROOT/build/$PROJECT_BUILD-firefoxos";

		cp "$PROJECT_ROOT/build/$PROJECT_BUILD-ubuntu/boilerplate-1.0.0-all.deb" "$PROJECT_ROOT/build/boilerplate_ubuntutouch_all.deb";
		rm -rf "$PROJECT_ROOT/build/$PROJECT_BUILD-ubuntu";


		rm -rf "$PROJECT_ROOT/build/$PROJECT_BUILD";

	fi;


	echo "SUCCESS";
	exit 0;

else

	echo "FAILURE";
	exit 1;

fi;

