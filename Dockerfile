<<<<<<< .merge_file_H52hGM
FROM xuntian/npl-runtime:latest
MAINTAINER xuntian "li.zq@foxmail.com"

RUN apt-get -y update && apt-get -y install nginx && apt-get clean && rm -rf /var/lib/apt/lists/*

ADD nginx_config /etc/nginx/sites-available/default
ADD ./ /opt/wikicraft/

EXPOSE 80
EXPOSE 8099

WORKDIR /opt/wikicraft

ENTRYPOINT ["./run.sh"]
=======
FROM xuntian/npl-runtime:latest
MAINTAINER xuntian "li.zq@foxmail.com"

RUN apt-get -y update && apt-get -y install nginx && apt-get clean && rm -rf /var/lib/apt/lists/*

ADD nginx_config /etc/nginx/sites-available/default
ADD ./ /opt/wikicraft/

EXPOSE 80
EXPOSE 8099

WORKDIR /opt/wikicraft
ENTRYPOINT ["./run.sh"]
>>>>>>> .merge_file_FWwmKM
