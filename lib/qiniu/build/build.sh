#!/bin/bash

export NPLRUNTIME_ROOT=/root/workspace/npl/NPLRuntime
rm -fr CMake*
cmake ~/workspace/npl/nplproject/keepwork/lib/qiniu
make
cp libQiNiuPlugin.so ~/workspace/npl/nplproject/keepwork/lib
