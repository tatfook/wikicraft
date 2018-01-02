#! /usr/bin/env bash
#
# build-dist.sh
#

set -ex

# nodejs compress code, only for test env
# how it work
# 1 mkdir temp_www_build
# 2 cp www to temp_www_build
# 3 node r.js -o r_package.js
# 4 new js files are placed in www_build dir, as release version
# 5 remember remove temp_www_build dir
TEMP_DIR=temp_www_build
BUILD_DIR=www_build
DEV_DIR=www
STAGE_DIR=www
RELEASE_DIR=test
PROD_DIR=rls

clean_dir() {
  if [[ -d $1 ]] || [[ -L $1 ]]; then
    rm -rf $1
  fi
}

clean_dir $TEMP_DIR
clean_dir $BUILD_DIR

cp -a $DEV_DIR $TEMP_DIR
node r.js -o r_package.js
clean_dir $TEMP_DIR

clean_dir $DEV_DIR
clean_dir $STAGE_DIR
clean_dir $RELEASE_DIR
clean_dir $PROD_DIR
ln -s $BUILD_DIR $DEV_DIR
ln -s $BUILD_DIR $STAGE_DIR
ln -s $BUILD_DIR $RELEASE_DIR
ln -s $BUILD_DIR $PROD_DIR
