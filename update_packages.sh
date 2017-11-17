#!/bin/bash
# author : onedou@126.com
# date   : 2017.11.5
# desc   : update main packages

packages_dir="./npl_packages"

if [ ! -d $packages_dir ]; then
   mkdir ${packages_dir}
fi

pushd ${packages_dir}

InstallPackages(){
    if [ -f "./"$1"/README.md" ]; then
        pushd $1
        git reset --hard HEAD
        git pull
        popd
    else
        rm -r "./"$1
        git clone https://github.com/NPLPackages/$1
    fi
}

InstallPackages main

popd
exit 0

