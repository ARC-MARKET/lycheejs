#!/bin/bash

PROJECT_ROOT=$(cd "$(dirname "$0")/"; pwd);

cd $PROJECT_ROOT;
./node ./index.js "$1" "$2" "$3" "$4" "$5" "$6" "$7" "$8";

