FROM xuntian/npl-runtime:latest
MAINTAINER zdw "favorofife@yeah.net"

#RUN apt-get -y update && apt-get -y install nginx && apt-get clean && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /project/wikicraft
ADD ./build.tar.gz /project/wikicraft/
WORKDIR /project/wikicraft

VOLUME ["/project/wikicraft/database", "/project/wikicraft/log"]

ENTRYPOINT ["./serve.sh"]
