#!/bin/bash

serverAddr="http://localhost:8099"

#curl -H "Content-Type: application/json" -X POST  --data '{"userId":1, "favoriteUserId":2, "favoriteType":0, "favoriteId":2}'  "${serverAddr}/api/wiki/models/user_favorite/create"
#curl -H "Content-Type: application/json" -X POST  --data '{"userId":1, "favoriteUserId":3, "favoriteType":0, "favoriteId":3}'  "${serverAddr}/api/wiki/models/user_favorite/create"
#curl -H "Content-Type: application/json" -X POST  --data '{"userId":1, "favoriteUserId":4, "favoriteType":0, "favoriteId":4}'  "${serverAddr}/api/wiki/models/user_favorite/create"
#
#curl -H "Content-Type: application/json" -X POST  --data '{"userId":1, "favoriteUserId":2, "favoriteType":1, "favoriteId":2}'  "${serverAddr}/api/wiki/models/user_favorite/create"
#curl -H "Content-Type: application/json" -X POST  --data '{"userId":1, "favoriteUserId":3, "favoriteType":1, "favoriteId":3}'  "${serverAddr}/api/wiki/models/user_favorite/create"
#curl -H "Content-Type: application/json" -X POST  --data '{"userId":1, "favoriteUserId":4, "favoriteType":1, "favoriteId":4}'  "${serverAddr}/api/wiki/models/user_favorite/create"

curl -H "Content-Type: application/json" -X POST  --data '{"userId":2, "favoriteUserId":1, "favoriteType":0, "favoriteId":1}'  "${serverAddr}/api/wiki/models/user_favorite/create"
curl -H "Content-Type: application/json" -X POST  --data '{"userId":3, "favoriteUserId":1, "favoriteType":0, "favoriteId":1}'  "${serverAddr}/api/wiki/models/user_favorite/create"
curl -H "Content-Type: application/json" -X POST  --data '{"userId":4, "favoriteUserId":1, "favoriteType":0, "favoriteId":1}'  "${serverAddr}/api/wiki/models/user_favorite/create"
