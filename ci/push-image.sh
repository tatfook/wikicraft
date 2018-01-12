#! /usr/bin/env bash
#
# push-image.sh
#
set -ex

ADDR=121.14.117.251:5000

if [[ ! -z $1 ]]; then
    ADDR="$1"
fi

TAG=keepwork/release:b$BUILD_NUMBER
NEW_TAG=$ADDR/keepwork/prod:b$BUILD_NUMBER

# docker tag
docker tag $TAG $NEW_TAG
docker push $NEW_TAG
