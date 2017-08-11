#! /usr/bin/env bash
#
# push-image.sh
#

IP=121.14.117.251

TAG=keepwork/test:b$BUILD_NUMBER
NEW_TAG=$IP/keepwork/prod:b$BUILD_NUMBER

# docker tag
docker tag $TAG $NEW_TAG
docker push $NEW_TAG
