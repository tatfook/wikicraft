pushd "../ParaCraftSDK/redist"
call "paraengineclient.exe"  bootstrapper="script/apps/WebServer/WebServer.lua" port="8099" root="www/" dev="%~dp0" 