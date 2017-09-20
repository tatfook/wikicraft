FROM xuntian/npl-runtime:prod
MAINTAINER zdw "favorofife@yeah.net"

RUN mkdir -p /project/wikicraft
ADD ./build.tar.gz /project/wikicraft/
WORKDIR /project/wikicraft

# compile qiniu sdk (libboost ver > 1.55)
RUN apt update && apt install -y libboost-all-dev
RUN chmod +x ./lib/qiniu/build/build.sh; sync; ./lib/qiniu/build/build.sh 

VOLUME ["/project/wikicraft/database", "/project/wikicraft/log"]

ENTRYPOINT ["./serve.sh"]
