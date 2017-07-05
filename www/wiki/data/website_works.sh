
#!/bin/bash

serverAddr="http://localhost:8099"

curl -H "Content-Type: application/json" -X PUT  --data '{"websiteId":1, "worksId":2}'  "${serverAddr}/api/wiki/models/website_works/new"

curl -H "Content-Type: application/json" -X PUT  --data '{"websiteId":1, "worksId":3}'  "${serverAddr}/api/wiki/models/website_works/new"

curl -H "Content-Type: application/json" -X PUT  --data '{"websiteId":1, "worksId":4}'  "${serverAddr}/api/wiki/models/website_works/new"

