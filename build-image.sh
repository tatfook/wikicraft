#! /usr/bin/env bash
#
# build-image.sh
#
# build docker image
#
# usage:
#   ./build-image.sh dev|test
#
set -x

usage() {
  echo "usage error"
  echo
  echo "usage: $0 dev|test"
  exit 1
}

if [[ $# -eq 0 ]] || [[ $# -gt 1 ]]; then
  usage
fi

if [[ $1 != "test" ]] && [[ $1 != "dev" ]]; then
  usage
fi

ENV_TYPE=$1

is_test() {
  [[ $ENV_TYPE == "test" ]]
}

# FIXME
# clone main pkg for now
if [[ ! -d "npl_packages" ]]; then
  mkdir -p npl_packages
  cd npl_packages
  git clone https://github.com/NPLPackages/main
  # TODO checkout one specific version
  cd ..
fi

# copy config file (cp will override config file)
CONFIG_FILE_BACKUP_PATH=$JENKINS_HOME/project_secret_files/wikicraft/config.page
CONFIG_FILE_USE_PATH=$WORKSPACE/www/wiki/helpers/config.page
cp -a $CONFIG_FILE_BACKUP_PATH $CONFIG_FILE_USE_PATH


if is_test; then
  docker build -t wikicraft-test -f Dockerfile.test .
  docker run --rm wikicraft-test > build.tar.gz
  docker rmi wikicraft-test
else
  touch build.tar.gz
  tar -czf build.tar.gz --exclude build.tar.gz .
fi

# build image with build.tar.gz file
docker build -t keepwork/$ENV_TYPE:b$BUILD_NUMBER .

rm build.tar.gz

