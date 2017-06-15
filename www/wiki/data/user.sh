#!/bin/bash

serverAddr="http://localhost:8900"
#serverAddr="http://test.keepwork.com"
#serverAddr="http://keepwork.com"
#serverAddr="http://dev.keepwork.com"

curl -H "Content-Type: application/json" -X POST  --data '{"username":"lixizhi", "password":"1234567", "email":"lixizhi@paraengine.com"}'  "${serverAddr}/api/wiki/models/user/register"

curl -H "Content-Type: application/json" -X POST  --data '{"username":"zhanglei", "password":"zhanglei", "email":"zhanglei@yeah.net"}'  "${serverAddr}/api/wiki/models/user/register"

curl -H "Content-Type: application/json" -X POST  --data '{"username":"xiaoyao", "password":"wuxiangan", "email":"765485868@qq.com"}'  "${serverAddr}/api/wiki/models/user/register"

#curl -H "Content-Type: application/json" -X POST  --data '{"username":"xiaoyao3", "password":"wuxiangan", "email":"111111113@qq.com"}'  "${serverAddr}/api/wiki/models/user/register"

#curl -H "Content-Type: application/json" -X POST  --data '{"username":"xiaoyao4", "password":"wuxiangan", "email":"111111114@qq.com"}'  "${serverAddr}/api/wiki/models/user/register"

#curl -H "Content-Type: application/json" -X POST  --data '{"username":"xiaoyao5", "password":"wuxiangan", "email":"111111115@qq.com"}'  "${serverAddr}/api/wiki/models/user/register"

#curl -H "Content-Type: application/json" -X POST  --data '{"username":"xiaoyao6", "password":"wuxiangan", "email":"111111116@qq.com"}'  "${serverAddr}/api/wiki/models/user/register"

#curl -H "Content-Type: application/json" -X POST  --data '{"username":"xiaoyao7", "password":"wuxiangan", "email":"111111117@qq.com"}'  "${serverAddr}/api/wiki/models/user/register"

#curl -H "Content-Type: application/json" -X POST  --data '{"username":"xiaoyao8", "password":"wuxiangan", "email":"111111118@qq.com"}'  "${serverAddr}/api/wiki/models/user/register"

#curl -H "Content-Type: application/json" -X POST  --data '{"username":"xiaoyao9", "password":"wuxiangan", "email":"111111119@qq.com"}'  "${serverAddr}/api/wiki/models/user/register"
