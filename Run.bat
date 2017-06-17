@echo off 
pushd "C:/ParaCraftSDK/redist/" 
call "ParaEngineClient.exe" bootstrapper="script/apps/WebServer/WebServer.lua" port="8099" root="www/"  dev="C:/wikicraft/" servermode="true"