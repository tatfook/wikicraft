# ubuntu-nplruntime by 2017-04-12
FROM xuntian/ubuntu-npl-runtime:latest
MAINTAINER xuntian "li.zq@foxmail.com"

RUN apt-get -y update && apt-get -y install nginx

ADD nginx_config /etc/nginx/sites-available/default

EXPOSE 80
EXPOSE 8099

RUN cd /opt && git clone -b wxa_dev https://github.com/tatfook/wikicraft 

WORKDIR /opt/wikicraft
CMD ["./wikicraft.sh", "start"]