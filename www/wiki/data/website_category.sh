#!/bin/bash

serverAddr="http://localhost:8099"

#curl -H "Content-Type: application/json" -X PUT  --data '{"name":"个人网站", "parentId":"0"}'  "${serverAddr}/api/wiki/models/website_category/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"作品网站", "parentId":"0"}'  "${serverAddr}/api/wiki/models/website_category/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"组织网站", "parentId":"0"}'  "${serverAddr}/api/wiki/models/website_category/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"比赛网站", "parentId":"0"}'  "${serverAddr}/api/wiki/models/website_category/new"

#curl -H "Content-Type: application/json" -X GET  "localhost:8099/api/wiki/models/website_category"
