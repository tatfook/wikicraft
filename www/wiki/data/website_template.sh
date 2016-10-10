#!/bin/bash

serverAddr="http://localhost:8099"

curl -H "Content-Type: application/json" -X PUT  --data '{"name":"template_test", "category_id":"1", "content":"<div>hello world</div>"}'  "${serverAddr}/api/wiki/models/website_template/new"

