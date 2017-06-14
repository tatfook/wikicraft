#!/bin/bash

serverAddr="http://localhost:8099"

curl -H "Content-Type: application/json" -X PUT  --data '{"name":"空模板",   "categoryId":1, "logoUrl":"/wiki/assets/imgs/Organization.jpg", "content":"<!-- [/template/Default]( {\"isPreview\":true}  ) -->"}'  "${serverAddr}/api/wiki/models/website_template/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"导航模板", "categoryId":1, "logoUrl":"/wiki/assets/imgs/Organization.jpg", "content":"<!-- [/template/Default]( {\"isPreview\":true}  ) -->"}'  "${serverAddr}/api/wiki/models/website_template/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"空模板",   "categoryId":2, "logoUrl":"/wiki/assets/imgs/Organization.jpg", "content":"<!-- [/template/Default]( {\"isPreview\":true}  ) -->"}'  "${serverAddr}/api/wiki/models/website_template/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"导航模板", "categoryId":2, "logoUrl":"/wiki/assets/imgs/Organization.jpg", "content":"<!-- [/template/Default]( {\"isPreview\":true}  ) -->"}'  "${serverAddr}/api/wiki/models/website_template/new"

#curl -H "Content-Type: application/json" -X POST --data '{}' "localhost:8099/api/wiki/models/website_template"
