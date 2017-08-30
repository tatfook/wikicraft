#!/bin/bash

keepwork_dir=/root/wikicraft
npl_runtime_dir=/root/NPLRuntime

export NPLRUNTIME_ROOT="${npl_runtime_dir}"

rm Makefile
rm cmake*
rm -fr CMake*

cmake "${keepwork_dir}/lib/qiniu"
make

rm Makefile
rm cmake*
rm -fr CMake*

mv libQiNiuPlugin.so "${keepwork_dir}/lib"
