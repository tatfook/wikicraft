#!/bin/bash

serverAddr="http://localhost:8099"

curl -H "Content-Type: application/json" -X PUT  --data '{"name":"空模板", "categoryId":1, "filename":"blank_tpl.html", "content":"<div>__PageContent__</div>"}'  "${serverAddr}/api/wiki/models/website_template/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"空模板", "categoryId":2, "filename":"blank_tpl.html","content":"<div>__PageContent__</div>"}'  "${serverAddr}/api/wiki/models/website_template/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"导航模板", "categoryId":1, "filename":"nav_tpl.html","content":"<div>__PageContent__</div>"}'  "${serverAddr}/api/wiki/models/website_template/new"
#curl -H "Content-Type: application/json" -X PUT  --data '{"name":"空模板", "categoryId":3, "content":"<div>__PageContent__</div>"}'  "${serverAddr}/api/wiki/models/website_template/new"
#curl -H "Content-Type: application/json" -X PUT  --data '{"name":"空模板", "categoryId":4, "content":"<div>__PageContent__</div>"}'  "${serverAddr}/api/wiki/models/website_template/new"

#curl -H "Content-Type: application/json" -X POST --data '{}' "localhost:8099/api/wiki/models/website_template"
