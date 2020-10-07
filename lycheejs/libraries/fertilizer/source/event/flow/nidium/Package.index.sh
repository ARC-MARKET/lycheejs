#!/bin/bash

PROJECT_ROOT=$(cd "$(dirname "$0")/"; pwd);

cd $PROJECT_ROOT;
./nidium ./index.nml "$1" "$2" "$3" "$4" "$5" "$6" "$7" "$8";

