#!/bin/bash

keepwork_dir=/project/wikicraft
npl_runtime_dir=/opt/NPLRuntime

#keepwork_dir=/root/wikicraft
#npl_runtime_dir=/root/NPLRuntime

#keepwork_dir=/root/workspace/npl/nplproject/keepwork
#npl_runtime_dir=/root/workspace/npl/NPLRuntime

export NPLRUNTIME_ROOT="${npl_runtime_dir}"

rm -rf Makefile
rm -rf cmake*
rm -fr CMake*

cmake "${keepwork_dir}/lib/qiniu"
make

rm -rf Makefile
rm -rf cmake*
rm -fr CMake*

mv libQiNiuPlugin.so "${keepwork_dir}/lib"
