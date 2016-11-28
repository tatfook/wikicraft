#!/bin/bash

serverAddr="http://localhost:8099"

curl -H "Content-Type: application/json" -X POST  --data '{"username":"xiaoyao", "password":"wuxiangan", "email":"765485868@qq.com"}'  "${serverAddr}/api/wiki/models/user/register"

curl -H "Content-Type: application/json" -X POST  --data '{"username":"xiaoyao1", "password":"wuxiangan", "email":"765485869@qq.com"}'  "${serverAddr}/api/wiki/models/user/register"

curl -H "Content-Type: application/json" -X POST  --data '{"username":"xuejian", "password":"wuxiangan", "email":"765485867@qq.com"}'  "${serverAddr}/api/wiki/models/user/register"

curl -H "Content-Type: application/json" -X POST  --data '{"username":"jingtian", "password":"wuxiangan", "email":"765485866@qq.com"}'  "${serverAddr}/api/wiki/models/user/register"
