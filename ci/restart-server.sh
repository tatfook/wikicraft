#! /usr/bin/env bash
#
# restart container after building image

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

if [[ ${ENV_TYPE} == "dev" ]]; then
  port=8900
elif [[ ${ENV_TYPE} == "test" ]]; then
  port=8099
elif [[ ${ENV_TYPE} == "release" ]]; then
  port=8088
fi

name=keepwork-${ENV_TYPE}-server

if docker ps -f name=$name | grep $name; then
  docker stop $name
  docker rm $name
fi

docker run -d --restart=always --name=$name \
  -v "${ENV_TYPE}-database:/project/wikicraft/database" \
  -v "${ENV_TYPE}-log:/project/wikicraft/log" \
  -p "${port}:${port}" \
  keepwork/$ENV_TYPE:b$BUILD_NUMBER $ENV_TYPE


