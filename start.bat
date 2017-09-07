@echo off
rem run in development mode
rem npl -d bootstrapper="script/apps/WebServer/WebServer.lua" port="8099" root="www/"  dev="%~dp0" servermode="true"
npl -d bootstrapper="script/apps/WebServer/WebServer.lua" port="8099" root="www/" dev="%~dp0" servermode="true"

