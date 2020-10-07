#!/bin/bash

OSXHELPER_DIR=$(cd "$(dirname "$0")"; pwd);

cd $OSXHELPER_DIR;
rm -rf ./helper.app

osacompile -o ./helper.app ./helper.applescript;

cp ./Info.plist ./helper.app/Contents;
cp ./applet.icns ./helper.app/Contents/Resources/applet.icns;

open ./helper.app;
