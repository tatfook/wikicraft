#! /usr/bin/env bash
#
# build docker image
#
# usage:
#   ./build-image.sh dev|stage|test|release $BUILD_NUMBER
#
set -ex

usage() {
  echo "usage error"
  echo
  echo "usage: $0 dev|stage|test|release BUILD_NUMBER"
  exit 1
}

if [[ $# -ne 2 ]]; then
  usage
fi

if [[ $1 != "test" ]] && [[ $1 != "stage" ]] && [[ $1 != "dev" ]] && [[ $1 != "release" ]]; then
  usage
fi

ENV_TYPE=$1
BUILD_NUMBER=$2

# use npl_packages in runtime image, not in local dir
if [[ -d "npl_packages" ]]; then
  rm -rf npl_packages
fi

# copy config file (cp will override config file)
CONFIG_FILE_BACKUP_PATH=$JENKINS_HOME/project_secret_files/wikicraft/config.page
CONFIG_FILE_USE_PATH=$WORKSPACE/www/wiki/helpers/config.page
cp -a $CONFIG_FILE_BACKUP_PATH $CONFIG_FILE_USE_PATH


building_pkg_image=build-wikicraft-$ENV_TYPE-$BUILD_NUMBER
dist_pkg=build-$ENV_TYPE-$BUILD_NUMBER.tar.gz

docker build -t $building_pkg_image -f Dockerfile.dist ..
docker run --rm $building_pkg_image > $dist_pkg
docker rmi $building_pkg_image

# build image with $dist_pkg file
docker build -t keepwork/$ENV_TYPE:b$BUILD_NUMBER \
  --build-arg DIST_PKG=./$dist_pkg .

rm $dist_pkg
