#! /usr/bin/env bash
#
# restart container after building image

set -ex

usage() {
  echo "usage error"
  echo
  echo "usage: $0 dev|stage|release [branch_name] [port]"
  exit 1
}

if [[ $1 != "stage" ]] && [[ $1 != "dev" ]] && [[ $1 != "release" ]]; then
  usage
fi

ENV_TYPE=$1
# zh_CN is default locale for us
RUN_ENV="${ENV_TYPE}-${KEEPWORK_LOCALE}"

name=keepwork-${ENV_TYPE}-server
database=${ENV_TYPE}-database
log=${ENV_TYPE}-log
case $RUN_ENV in
    "dev-zh_CN")
        outside_port=8900
        inside_port=8900
        database=stage-database
        log=stage-log
    ;;
    "dev-en_US")
        name=keepwork-${ENV_TYPE}-server-${KEEPWORK_LOCALE}
        outside_port=8901
        inside_port=8900
        database=stage-database-${KEEPWORK_LOCALE}
        log=stage-log-${KEEPWORK_LOCALE}
    ;;
    "release-zh_CN")
        outside_port=8088
        inside_port=8088
    ;;
    "release-en_US")
        name=keepwork-${ENV_TYPE}-server-${KEEPWORK_LOCALE}
        outside_port=8089
        inside_port=8088
        database=${ENV_TYPE}-database-${KEEPWORK_LOCALE}
        log=${ENV_TYPE}-log-${KEEPWORK_LOCALE}
    ;;
    "stage-zh_CN")
        name=$2
        outside_port=$3
        inside_port=8099
    ;;
    "stage-en_US")
        echo "no i18n setting for stage env"
        exit 1
    ;;
    *)
        exit 1
    ;;
esac


if docker ps -f name=$name | grep $name; then
  docker stop $name
  docker rm $name
fi

docker run -d --restart=always --name=$name \
  --add-host "git.stage.keepwork.com:10.28.18.6" \
  --add-host "git.release.keepwork.com:10.28.18.6" \
  --add-host "git.keepwork.com:10.28.18.6" \
  --add-host "daofeng-school.com:10.28.14.2" \
  -v "${database}:/project/wikicraft/database" \
  -v "${log}:/project/wikicraft/log" \
  -p "${outside_port}:${inside_port}" \
  -e "KEEPWORK_LOCALE=${KEEPWORK_LOCALE}" \
  -e "http_proxy=${KEEPWORK_PROXY}" \
  -e "https_proxy=${KEEPWORK_PROXY}" \
  -e "no_proxy=${KEEPWORK_NOPROXY}" \
  keepwork/$ENV_TYPE:b$BUILD_NUMBER $ENV_TYPE


