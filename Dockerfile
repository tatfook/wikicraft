FROM xuntian/npl-runtime:prod
MAINTAINER zdw "favorofife@yeah.net"

RUN mkdir -p /project/wikicraft
ADD ./build.tar.gz /project/wikicraft/
WORKDIR /project/wikicraft

# compile qiniu sdk (libboost ver > 1.55)
RUN apt update && apt install libboost-all-dev
RUN chmod u+x ./lib/qiniu/build/build.sh && ./lib/qiniu/build/build.sh 

VOLUME ["/project/wikicraft/database", "/project/wikicraft/log"]

ENTRYPOINT ["./serve.sh"]
