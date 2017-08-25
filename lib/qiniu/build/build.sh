#!/bin/bash

export NPLRUNTIME_ROOT=/root/workspace/npl/NPLRuntime
rm Makefile
rm cmake*
rm -fr CMake*
cmake ~/workspace/npl/nplproject/keepwork/lib/qiniu
make
mv libQiNiuPlugin.so ~/workspace/npl/nplproject/keepwork/lib
