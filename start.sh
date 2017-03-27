workDir=`pwd`
#npl -d bootstrapper="script/apps/WebServer/WebServer.lua" ip="10.0.2.15" port="8099" root="www/" dev="${workDir}"
npl -d bootstrapper="script/apps/WebServer/WebServer.lua"  root="www/" port="8099" dev="${workDir}"
npl -d bootstrapper="script/apps/WebServer/WebServer.lua"  root="www_build/" port="8088" dev="${workDir}"

