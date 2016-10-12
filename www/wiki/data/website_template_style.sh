#!/bin/bash

serverAddr="http://localhost:8099"

curl -H "Content-Type: application/json" -X PUT  --data '{"name":"样式", "templateId":1, "content":"<div>hello world</div>"}'  "${serverAddr}/api/wiki/models/website_template_style/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"样式", "templateId":1, "content":"<div>hello world</div>"}'  "${serverAddr}/api/wiki/models/website_template_style/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"样式", "templateId":2, "content":"<div>hello world</div>"}'  "${serverAddr}/api/wiki/models/website_template_style/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"样式", "templateId":2, "content":"<div>hello world</div>"}'  "${serverAddr}/api/wiki/models/website_template_style/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"样式", "templateId":3, "content":"<div>hello world</div>"}'  "${serverAddr}/api/wiki/models/website_template_style/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"样式", "templateId":4, "content":"<div>hello world</div>"}'  "${serverAddr}/api/wiki/models/website_template_style/new"

#curl -H "Content-Type: application/json" -X POST --data '{}' "localhost:8099/api/wiki/models/website_template_style"
