#!/bin/bash

serverAddr="http://localhost:8099"

curl -H "Content-Type: application/json" -X PUT  --data '{"name":"个人网站模板1", "categoryId":1, "content":"<div>hello world</div>"}'  "${serverAddr}/api/wiki/models/website_template/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"个人网站模板2", "categoryId":1, "content":"<div>hello world</div>"}'  "${serverAddr}/api/wiki/models/website_template/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"作品网站模板1", "categoryId":2, "content":"<div>hello world</div>"}'  "${serverAddr}/api/wiki/models/website_template/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"作品网站模板2", "categoryId":2, "content":"<div>hello world</div>"}'  "${serverAddr}/api/wiki/models/website_template/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"组织网站模板1", "categoryId":3, "content":"<div>hello world</div>"}'  "${serverAddr}/api/wiki/models/website_template/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"教学网站模板1", "categoryId":4, "content":"<div>hello world</div>"}'  "${serverAddr}/api/wiki/models/website_template/new"

#curl -H "Content-Type: application/json" -X POST --data '{}' "localhost:8099/api/wiki/models/website_template"
