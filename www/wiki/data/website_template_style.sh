#!/bin/bash

serverAddr="http://localhost:8099"

#curl -H "Content-Type: application/json" -X PUT  --data '{"name":"空样式", "templateId":1, "content":"<div>__PageContent__</div>"}'  "${serverAddr}/api/wiki/models/website_template_style/new"
#curl -H "Content-Type: application/json" -X PUT  --data '{"name":"空样式", "templateId":2, "content":"<div>__PageContent__</div>"}'  "${serverAddr}/api/wiki/models/website_template_style/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"空模板灰色", "templateId":1, "content":"<div style=\"background-color: #8cbbad\">__PageContent__</div>"}'  "${serverAddr}/api/wiki/models/website_template_style/new"
curl -H "Content-Type: application/json" -X PUT  --data '{"name":"空模板灰色", "templateId":2, "content":"<div style=\"background-color: #8cbbad\">__PageContent__</div>"}'  "${serverAddr}/api/wiki/models/website_template_style/new"

#curl -H "Content-Type: application/json" -X POST --data '{}' "localhost:8099/api/wiki/models/website_template_style"
