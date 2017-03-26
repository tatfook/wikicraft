
#!/bin/bash

serverAddr="http://localhost:8099"

curl -H "Content-Type: application/json" -X PUT  --data '{"websiteId":1, "userId":1}'  "${serverAddr}/api/wiki/models/website_member/new"

curl -H "Content-Type: application/json" -X PUT  --data '{"websiteId":1, "userId":2}'  "${serverAddr}/api/wiki/models/website_member/new"

curl -H "Content-Type: application/json" -X PUT  --data '{"websiteId":1, "userId":3}'  "${serverAddr}/api/wiki/models/website_member/new"

curl -H "Content-Type: application/json" -X PUT  --data '{"websiteId":1, "userId":4}'  "${serverAddr}/api/wiki/models/website_member/new"

