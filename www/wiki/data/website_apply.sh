
#!/bin/bash

serverAddr="http://localhost:8099"

curl -H "Content-Type: application/json" -X POST  --data '{"websiteId":1, "applyId":2}'  "${serverAddr}/api/wiki/models/website_apply/memberApply"

curl -H "Content-Type: application/json" -X POST  --data '{"websiteId":1, "applyId":3}'  "${serverAddr}/api/wiki/models/website_apply/memberApply"

curl -H "Content-Type: application/json" -X POST  --data '{"websiteId":1, "applyId":4}'  "${serverAddr}/api/wiki/models/website_apply/memberApply"

curl -H "Content-Type: application/json" -X POST  --data '{"websiteId":1, "applyId":2}'  "${serverAddr}/api/wiki/models/website_apply/worksApply"

curl -H "Content-Type: application/json" -X POST  --data '{"websiteId":1, "applyId":3}'  "${serverAddr}/api/wiki/models/website_apply/worksApply"

curl -H "Content-Type: application/json" -X POST  --data '{"websiteId":1, "applyId":4}'  "${serverAddr}/api/wiki/models/website_apply/worksApply"

