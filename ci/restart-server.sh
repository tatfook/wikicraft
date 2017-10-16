#! /usr/bin/env bash
#
# restart-server.sh
#
# restart container after building image

set -ex

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

# dev port is 8900, test port 8099
port=8900
if [[ ${ENV_TYPE} == "test" ]]; then
  port=8099
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


