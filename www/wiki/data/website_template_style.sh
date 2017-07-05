#!/bin/bash

serverAddr="http://localhost:8099"

curl -H "Content-Type: application/json" -X PUT  --data '{"name":"空样式",   "templateId":1, "logoUrl":"/wiki/assets/imgs/Organization.jpg", "filename":"organization.html"}'  "${serverAddr}/api/wiki/models/website_template_style/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"导航样式", "templateId":2, "logoUrl":"/wiki/assets/imgs/Organization.jpg", "filename":"organization.html"}'  "${serverAddr}/api/wiki/models/website_template_style/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"空样式",   "templateId":3, "logoUrl":"/wiki/assets/imgs/Organization.jpg", "filename":"organization.html"}'  "${serverAddr}/api/wiki/models/website_template_style/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"导航样式", "templateId":4, "logoUrl":"/wiki/assets/imgs/Organization.jpg", "filename":"organization.html"}'  "${serverAddr}/api/wiki/models/website_template_style/new"

#curl -H "Content-Type: application/json" -X POST --data '{}' "localhost:8099/api/wiki/models/website_template_style"
