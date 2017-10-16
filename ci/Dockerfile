FROM xuntian/npl-runtime:prod
MAINTAINER zdw "favorofife@yeah.net"

# compile qiniu sdk (libboost ver > 1.55)
RUN apt update && apt install -y libboost-all-dev

ADD ./bin/tini /tini
RUN chmod +x /tini

RUN mkdir -p /project/wikicraft
ADD ./build.tar.gz /project/wikicraft/
WORKDIR /project/wikicraft

RUN chmod +x ./lib/qiniu/build/build.sh; sync; ./lib/qiniu/build/build.sh

VOLUME ["/project/wikicraft/database", "/project/wikicraft/log"]

ENTRYPOINT ["/tini", "--", "./ci/serve.sh"]
