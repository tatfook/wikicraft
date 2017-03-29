#!/bin/bash


start_server() {
	local server_type=$1
	
	if [ $server_type = "build" ]; then
		node r.js -o build.js
		npl -d bootstrapper="script/apps/WebServer/WebServer.lua"  root="www_build/" port="8099" logfile="build_log.log" 
	elif [ $server_type = "dev" ]; then 
		npl -d bootstrapper="script/apps/WebServer/WebServer.lua"  root="www/" port="8900" logfile="dev_log.log"
	else
		start_server "build"
		start_server "dev"
	fi
}

stop_server() {
	local server_type=$1

	if [ $server_type = "build" ]; then
		pid=`ps uax | grep "npl.*port=8099.*" | grep -v grep | awk '{print $2}'`
		if [ ! -z $pid ]; then
			kill -9 $((pid))
		fi
	elif [ $server_type = "dev" ]; then 
		pid=`ps uax | grep "npl.*port=8900.*" | grep -v grep | awk '{print $2}'`
		if [ ! -z $pid ]; then
			kill -9 $((pid))
		fi
	else
		stop_server "build"
		stop_server "dev"
	fi
}

restart_server() {
	local server_type=$1

	stop_server $server_type
	start_server $server_type
}


main() {
	echo "------------main function----------------"
	
	local server_type=$2
	if [ -z $server_type  ]; then 
		server_type="all"
	fi

	if [ "$1" == "start" ]; then
		echo "start server :"$server_type
		start_server $server_type
	elif [ "$1" == "stop" ]; then
		echo "stop server :"$server_type  
		stop_server $server_type
	else
		echo "restart server :"$server_type
		restart_server $server_type
	fi
}

main $1 $2
