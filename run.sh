#!/bin/bash

service nginx start

npl bootstrapper="script/apps/WebServer/WebServer.lua"  root="www/" port="8099" dev="./"
