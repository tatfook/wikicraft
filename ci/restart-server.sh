#! /usr/bin/env bash
#
# restart container after building image

set -ex

usage() {
  echo "usage error"
  echo
  echo "usage: $0 dev|stage|test|release [branch_name] [port]"
  exit 1
}

if [[ $1 != "test" ]] && [[ $1 != "stage" ]] && [[ $1 != "dev" ]] && [[ $1 != "release" ]]; then
  usage
fi

ENV_TYPE=$1

if [[ ${ENV_TYPE} == "dev" ]]; then
  name=keepwork-${ENV_TYPE}-server
  outside_port=8900
  inside_port=8900
elif [[ ${ENV_TYPE} == "release" ]]; then
  name=keepwork-${ENV_TYPE}-server
  outside_port=8088
  inside_port=8088
elif [[ ${ENV_TYPE} == "release" ]]; then
  name=keepwork-${ENV_TYPE}-server
  outside_port=8088
  inside_port=8088
elif [[ ${ENV_TYPE} == "stage" ]]; then
  name=$2
  outside_port=$3
  inside_port=8099
fi

if docker ps -f name=$name | grep $name; then
  docker stop $name
  docker rm $name
fi

docker run -d --restart=always --name=$name \
  --add-host "git.stage.keepwork.com:10.28.18.6" \
  --add-host "git.release.keepwork.com:10.28.18.6" \
  --add-host "git.keepwork.com:10.28.18.6" \
  --add-host "daofeng-school.com:10.28.14.2" \
  -v "${ENV_TYPE}-database:/project/wikicraft/database" \
  -v "${ENV_TYPE}-log:/project/wikicraft/log" \
  -p "${outside_port}:${inside_port}" \
  keepwork/$ENV_TYPE:b$BUILD_NUMBER $ENV_TYPE


