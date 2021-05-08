#!/bin/bash
# package.sh /projects/boilerplate html-webview/main

lowercase() {
	echo "$1" | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/";
}

OS=`lowercase \`uname\``;
ARCH=`lowercase \`uname -m\``;

LYCHEEJS_ROOT=$(cd "$(dirname "$0")/../../../"; pwd);
RUNTIME_ROOT=$(cd "$(dirname "$0")/"; pwd);
PROJECT_NAME="${2##*/}";
PROJECT_ROOT="${LYCHEEJS_ROOT}${1}/build/${2}";
PROJECT_SIZE=`du -b -s $PROJECT_ROOT | cut -f 1`;
BUILD_ID=`basename $PROJECT_ROOT`;
SDK_DIR="";


ANDROID_AVAILABLE=0;
ANDROID_STATUS=1;
FIREFOXOS_AVAILABLE=0;
FIREFOXOS_STATUS=1;
UBUNTU_AVAILABLE=0;
UBUNTU_STATUS=1;


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

	if [ "$ARCH" == "x86_64" ]; then
		SDK_DIR="$RUNTIME_ROOT/android-toolchain/sdk-osx/$ARCH";
	fi;

elif [ "$OS" == "linux" ]; then

	OS="linux";

	if [ "$ARCH" == "arm" ] || [ "$ARCH" == "x86_64" ]; then
		SDK_DIR="$RUNTIME_ROOT/android-toolchain/sdk-linux/$ARCH";
	fi;

fi;



_package_android () {

	if [ -d "./$BUILD_ID-android" ]; then
		rm -rf "./$BUILD_ID-android";
	fi;

	mkdir "$BUILD_ID-android";


	if [ -d "$SDK_DIR" ] && [ -d "$RUNTIME_ROOT/android" ] && [ -d "$RUNTIME_ROOT/android-toolchain" ]; then

		ANDROID_AVAILABLE=1;

		cp -R "$RUNTIME_ROOT/android/app" "$BUILD_ID-android/app";
		cp "$RUNTIME_ROOT/android/gradle.properties" "$BUILD_ID-android/gradle.properties";
		cp "$RUNTIME_ROOT/android/build.gradle" "$BUILD_ID-android/build.gradle";
		cp "$RUNTIME_ROOT/android/settings.gradle" "$BUILD_ID-android/settings.gradle";

		# TODO: Resize icon.png to mipmap-...dpi/ic_launcher.png variants

		cp "$PROJECT_ROOT/crux.js" "$BUILD_ID-android/app/src/main/assets/crux.js";
		cp "$PROJECT_ROOT/icon.png" "$BUILD_ID-android/app/src/main/assets/icon.png";
		cp "$PROJECT_ROOT/index.html" "$BUILD_ID-android/app/src/main/assets/index.html";


		echo -e "sdk.dir=$SDK_DIR" > "$BUILD_ID-android/local.properties";


		# Well, fuck you, Apple.
		if [ "$OS" == "osx" ]; then
			sed -i '' "s/__NAME__/$PROJECT_NAME/g" "$BUILD_ID-android/app/app.iml";
			sed -i '' "s/__NAME__/$PROJECT_NAME/g" "$BUILD_ID-android/app/src/main/res/values/strings.xml";
		else
			sed -i "s/__NAME__/$PROJECT_NAME/g" "$BUILD_ID-android/app/app.iml";
			sed -i "s/__NAME__/$PROJECT_NAME/g" "$BUILD_ID-android/app/src/main/res/values/strings.xml";
		fi;


		"$RUNTIME_ROOT/android-toolchain/gradle/bin/gradle" "$BUILD_ID-android";
		ANDROID_STATUS=$?;


		if [ -d "$BUILD_ID-android/app/build/outputs/apk" ]; then

			cp "$BUILD_ID-android/app/build/outputs/apk/app-debug.apk" "$BUILD_ID-android/app-debug.apk";
			cp "$BUILD_ID-android/app/build/outputs/apk/app-debug-unaligned.apk" "$BUILD_ID-android/app-debug-unaligned.apk";
			cp "$BUILD_ID-android/app/build/outputs/apk/app-release-unsigned.apk" "$BUILD_ID-android/app-release-unsigned.apk";

		fi;


		rm -rf "$BUILD_ID-android/app";
		rm -rf "$BUILD_ID-android/build";

		rm "$BUILD_ID-android/build.gradle";
		rm "$BUILD_ID-android/settings.gradle";
		rm "$BUILD_ID-android/gradle.properties";
		rm "$BUILD_ID-android/local.properties";

	fi;


	if [ "$ANDROID_AVAILABLE" == "0" ]; then
		ANDROID_STATUS=0;
	fi;

}

_package_firefoxos () {

	if [ -d "./$BUILD_ID-firefoxos" ]; then
		rm -rf "./$BUILD_ID-firefoxos";
	fi;

	mkdir "$BUILD_ID-firefoxos";


	if [ -d "$RUNTIME_ROOT/firefoxos" ]; then

		FIREFOXOS_AVAILABLE=1;

		cp -R "$RUNTIME_ROOT/firefoxos/app" "$BUILD_ID-firefoxos/app";

		cp "$PROJECT_ROOT/crux.js" "$BUILD_ID-firefoxos/app/crux.js";
		cp "$PROJECT_ROOT/icon.png" "$BUILD_ID-firefoxos/app/icon.png";
		cp "$PROJECT_ROOT/index.html" "$BUILD_ID-firefoxos/app/index.html";

		# Well, fuck you, Apple.
		if [ "$OS" == "osx" ]; then
			sed -i '' "s/__NAME__/$PROJECT_NAME/g" "$BUILD_ID-firefoxos/app/manifest.webapp";
			sed -i '' "s/__SIZE__/$PROJECT_SIZE/g" "$BUILD_ID-firefoxos/app/manifest.webapp";
		else
			sed -i "s/__NAME__/$PROJECT_NAME/g" "$BUILD_ID-firefoxos/app/manifest.webapp";
			sed -i "s/__SIZE__/$PROJECT_SIZE/g" "$BUILD_ID-firefoxos/app/manifest.webapp";
		fi;

		cd "$BUILD_ID-firefoxos/app";
		zip -r -q "../app.zip" ./*;
		FIREFOXOS_STATUS=$?;

		rm -rf "$BUILD_ID-firefoxos/app";

	fi;


	if [ "$FIREFOXOS_AVAILABLE" == "0" ]; then
		FIREFOXOS_STATUS=0;
	fi;

}

_package_ubuntu () {

	if [ -d "./$BUILD_ID-ubuntu" ]; then
		rm -rf "./$BUILD_ID-ubuntu";
	fi;

	mkdir "$BUILD_ID-ubuntu";


	if [ -d "$RUNTIME_ROOT/ubuntu" ]; then

		UBUNTU_AVAILABLE=1;

		cp -R "$RUNTIME_ROOT/ubuntu/DEBIAN" "$BUILD_ID-ubuntu/DEBIAN";
		cp -R "$RUNTIME_ROOT/ubuntu/root" "$BUILD_ID-ubuntu/root";

		cp "$PROJECT_ROOT/crux.js" "$BUILD_ID-ubuntu/root/usr/share/__NAME__/crux.js";
		cp "$PROJECT_ROOT/icon.png" "$BUILD_ID-ubuntu/root/usr/share/__NAME__/icon.png";
		cp "$PROJECT_ROOT/index.html" "$BUILD_ID-ubuntu/root/usr/share/__NAME__/index.html";

		mv "$BUILD_ID-ubuntu/root/usr/bin/__NAME__" "$BUILD_ID-ubuntu/root/usr/bin/$PROJECT_NAME";
		mv "$BUILD_ID-ubuntu/root/usr/share/__NAME__" "$BUILD_ID-ubuntu/root/usr/share/$PROJECT_NAME";
		mv "$BUILD_ID-ubuntu/root/usr/share/applications/__NAME__.desktop" "$BUILD_ID-ubuntu/root/usr/share/applications/$PROJECT_NAME.desktop";

		# Well, fuck you, Apple.
		if [ "$OS" == "osx" ]; then
			sed -i '' "s/__NAME__/$PROJECT_NAME/g" "$BUILD_ID-ubuntu/root/usr/bin/$PROJECT_NAME";
			sed -i '' "s/__NAME__/$PROJECT_NAME/g" "$BUILD_ID-ubuntu/root/usr/share/applications/$PROJECT_NAME.desktop";
			sed -i '' "s/__NAME__/$PROJECT_NAME/g" "$BUILD_ID-ubuntu/root/usr/share/$PROJECT_NAME/apparmor.json";
		else
			sed -i "s/__NAME__/$PROJECT_NAME/g" "$BUILD_ID-ubuntu/root/usr/bin/$PROJECT_NAME";
			sed -i "s/__NAME__/$PROJECT_NAME/g" "$BUILD_ID-ubuntu/root/usr/share/applications/$PROJECT_NAME.desktop";
			sed -i "s/__NAME__/$PROJECT_NAME/g" "$BUILD_ID-ubuntu/root/usr/share/$PROJECT_NAME/apparmor.json";
		fi;

		cd "$PROJECT_ROOT/../$BUILD_ID-ubuntu/root";
		tar czf $PROJECT_ROOT/../$BUILD_ID-ubuntu/data.tar.gz *;

		let SIZE=`du -s $PROJECT_ROOT/../$BUILD_ID-ubuntu/root | sed s'/\s\+.*//'`+8

		# Well, fuck you, Apple.
		if [ "$OS" == "osx" ]; then
			sed -i '' "s/__SIZE__/${SIZE}/g" "$PROJECT_ROOT/../$BUILD_ID-ubuntu/DEBIAN/control";
			sed -i '' "s/__NAME__/${PROJECT_NAME}/g" "$PROJECT_ROOT/../$BUILD_ID-ubuntu/DEBIAN/control";
		else
			sed -i "s/__SIZE__/${SIZE}/g" "$PROJECT_ROOT/../$BUILD_ID-ubuntu/DEBIAN/control";
			sed -i "s/__NAME__/${PROJECT_NAME}/g" "$PROJECT_ROOT/../$BUILD_ID-ubuntu/DEBIAN/control";
		fi;

		cd "$PROJECT_ROOT/../$BUILD_ID-ubuntu/DEBIAN";
		tar czf $PROJECT_ROOT/../$BUILD_ID-ubuntu/control.tar.gz *;

		cd "$PROJECT_ROOT/../$BUILD_ID-ubuntu";
		echo 2.0 > ./debian-binary;
		ar r "$PROJECT_ROOT/../$BUILD_ID-ubuntu/$PROJECT_NAME-1.0.0-all.deb" debian-binary control.tar.gz data.tar.gz &>/dev/null;
		UBUNTU_STATUS=$?;

		cd "$PROJECT_ROOT/../";
		rm -rf "$BUILD_ID-ubuntu/DEBIAN";
		rm -rf "$BUILD_ID-ubuntu/root";
		rm "$BUILD_ID-ubuntu/data.tar.gz";
		rm "$BUILD_ID-ubuntu/control.tar.gz";
		rm "$BUILD_ID-ubuntu/debian-binary";

	fi;


	if [ "$UBUNTU_AVAILABLE" == "0" ]; then
		UBUNTU_STATUS=0;
	fi;

}



if [ -f "$PROJECT_ROOT/index.html" ]; then

	# Package process

	cd "$PROJECT_ROOT/../";
	_package_android;

	if [ "$ANDROID_STATUS" != "0" ]; then
		echo "FAILURE (Android build)";
	fi;


	cd "$PROJECT_ROOT/../";
	_package_firefoxos;

	if [ "$FIREFOXOS_STATUS" != "0" ]; then
		echo "FAILURE (FirefoxOS build)";
	fi;


	cd "$PROJECT_ROOT/../";
	_package_ubuntu;

	if [ "$UBUNTU_STATUS" != "0" ]; then
		echo "FAILURE (Ubuntu build)";
	fi;


	if [ "$ANDROID_STATUS" != "0" ] || [ "$FIREFOXOS_STATUS" != "0" ] || [ "$UBUNTU_STATUS" != "0" ]; then
		exit 1;
	fi;



	echo "SUCCESS";
	exit 0;

else

	echo "FAILURE";
	exit 1;

fi;

