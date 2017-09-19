FROM xuntian/npl-runtime:prod
MAINTAINER zdw "favorofife@yeah.net"

RUN mkdir -p /project/wikicraft
ADD ./build.tar.gz /project/wikicraft/
WORKDIR /project/wikicraft

VOLUME ["/project/wikicraft/database", "/project/wikicraft/log"]

ENTRYPOINT ["./serve.sh"]
