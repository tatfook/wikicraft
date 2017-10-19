#! /usr/bin/env bash
#
#
# build docker image
#
# usage:
#   ./build-image.sh dev|test|release
#
set -ex

usage() {
  echo "usage error"
  echo
  echo "usage: $0 dev|test|release"
  exit 1
}

if [[ $# -eq 0 ]] || [[ $# -gt 1 ]]; then
  usage
fi

if [[ $1 != "test" ]] && [[ $1 != "dev" ]] && [[ $1 != "release" ]]; then
  usage
fi

ENV_TYPE=$1

# use npl_packages in runtime image, not in local dir
if [[ -d "npl_packages" ]]; then
  rm -rf npl_packages
fi

# copy config file (cp will override config file)
CONFIG_FILE_BACKUP_PATH=$JENKINS_HOME/project_secret_files/wikicraft/config.page
CONFIG_FILE_USE_PATH=$WORKSPACE/www/wiki/helpers/config.page
cp -a $CONFIG_FILE_BACKUP_PATH $CONFIG_FILE_USE_PATH


docker build -t wikicraft-dist -f Dockerfile.dist ..
docker run --rm wikicraft-dist > build.tar.gz
docker rmi wikicraft-dist

# build image with build.tar.gz file
docker build -t keepwork/$ENV_TYPE:b$BUILD_NUMBER .

rm build.tar.gz

