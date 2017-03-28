workDir=`pwd`
#npl -d bootstrapper="script/apps/WebServer/WebServer.lua" ip="10.0.2.15" port="8099" root="www/" dev="${workDir}"

if [ "$1" = "build" ]; then
	echo "start build web server..."
	pid=`ps uax | grep "npl.*port=8900.*" | grep -v grep | awk '{print $2}'`
	if [ ! -z $pid ]; then
		kill -9 $((pid))
	fi
	npl -d bootstrapper="script/apps/WebServer/WebServer.lua"  root="www_build/" port="8900" logfile="build_log.log" dev="${workDir}"
else
	echo "start server..."
	pid=`ps uax | grep "npl.*port=8099.*" | grep -v grep | awk '{print $2}'`
	if [ ! -z $pid ]; then
		kill -9 $((pid))
	fi
	npl -d bootstrapper="script/apps/WebServer/WebServer.lua"  root="www/" port="8099" logfile="dev_log.log" dev="${workDir}"
fi

