#!/bin/bash


SIPS="/usr/bin/sips";
ICONUTIL="/usr/bin/iconutil";


SOURCE="$2";
OUTPUT="$1";



ICONSET=$(basename "$SOURCE")".iconset";
SOURCE_FOLDER=$(cd "$(dirname "$SOURCE")"; pwd);
SOURCE_WIDTH=$($SIPS -g pixelWidth "$SOURCE"   | tail -n1 | awk '{print $2}');
SOURCE_HEIGHT=$($SIPS -g pixelHeight "$SOURCE" | tail -n1 | awk '{print $2}');
SOURCE_FORMAT=$($SIPS -g format "$SOURCE"      | tail -n1 | awk '{print $2}');



if [ "$SOURCE_WIDTH" != "128" ] || [ "$SOURCE_HEIGHT" != "128" ]; then
	echo "ERR: Source image should be 128 x 128 pixels." >&2
	exit 1;
fi

if [ "$SOURCE_FORMAT" != "png" ]; then
	echo "ERR: Source image format should be png." >&2
	exit 1;
fi



cd $SOURCE_FOLDER;

mkdir "${ICONSET}";


$SIPS -s format png --resampleWidth 1024 "$SOURCE" --out "$ICONSET/icon_512x512@2x.png" > /dev/null 2>&1;
$SIPS -s format png --resampleWidth 512 "$SOURCE" --out "$ICONSET/icon_512x512.png" > /dev/null 2>&1;
cp  "$ICONSET/icon_512x512.png"  "$ICONSET/icon_256x256@2x.png";

$SIPS -s format png --resampleWidth 256 "$SOURCE" --out "$ICONSET/icon_256x256.png" > /dev/null 2>&1;
cp  "$ICONSET/icon_256x256.png"  "$ICONSET/icon_128x128@2x.png";

$SIPS -s format png --resampleWidth 128 "$SOURCE" --out "$ICONSET/icon_128x128.png" > /dev/null 2>&1;
$SIPS -s format png --resampleWidth 64 "$SOURCE" --out "$ICONSET/icon_32x32@2x.png" > /dev/null 2>&1;
$SIPS -s format png --resampleWidth 32 "$SOURCE" --out "$ICONSET/icon_32x32.png" > /dev/null 2>&1;
cp "$ICONSET/icon_32x32.png" "$ICONSET/icon_16x16@2x.png";

$ICONUTIL -o $OUTPUT -c icns "$ICONSET";

rm -rf "$ICONSET";

