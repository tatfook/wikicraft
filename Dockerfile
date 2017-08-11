FROM xuntian/npl-runtime:latest
MAINTAINER zdw "favorofife@yeah.net"

RUN mkdir -p /project/wikicraft
ADD ./build.tar.gz /project/wikicraft/
WORKDIR /project/wikicraft

VOLUME ["/project/wikicraft/database", "/project/wikicraft/log"]

ENTRYPOINT ["./serve.sh"]
