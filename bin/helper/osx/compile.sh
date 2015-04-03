#!/bin/bash

rm -rf ./helper/osx/helper.app
osacompile -o ./helper/osx/helper.app ./helper/osx/helper.applescript;

cp ./helper/osx/Info.plist ./helper/osx/helper.app/Contents;
cp ./helper/osx/applet.icns ./helper/osx/helper.app/Contents/Resources/applet.icns;

open ./helper/osx/helper.app;

