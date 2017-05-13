#!/bin/bash

current_dir=`pwd`
rls_dir="rls"
test_dir="test"
dev_dir="www"
build_dir="www_build"

#test_server() {
#	echo $current_dir
#	local db_dir=${build_dst_dir}"/wiki/database"
#	local temp_db_dir=".database"
#
#	if [ -e ${build_dst_dir} -a -e ${db_dir} ]; then 
#		echo "back up database ..."
#		cp -fr  ${db_dir} ${temp_db_dir}
#	fi
#	#node r.js -o test.js
#	ls ${db_dir}
#	rm -fr ${db_dir}
#	mv ${temp_db_dir} ${db_dir}
#}

start_server() {
	local server_type=$1
	
	if [ $server_type = "test" ]; then
		rm -fr ${test_dir}
		cp -fr ${build_dir} ${test_dir}
		npl -d bootstrapper="script/apps/WebServer/WebServer.lua"  root="${test_dir}/" port="8099" logfile="${test_dir}_log.log" 
	elif [ $server_type = "rls" ]; then 
		rm -fr ${rls_dir}
		cp -fr ${build_dir} ${rls_dir}
		npl -d bootstrapper="script/apps/WebServer/WebServer.lua"  root="${rls_dir}/" port="8088" logfile="${rls_dir}_log.log"
	elif [ $server_type = "dev" ]; then 
		npl -d bootstrapper="script/apps/WebServer/WebServer.lua"  root="${dev_dir}/" port="8900" logfile="${dev_dir}_log.log"
	else
		start_server "test"
		start_server "dev"
	fi
}

stop_server() {
	local server_type=$1

	if [ $server_type = "test" ]; then
		pid=`ps uax | grep "npl.*port=8099.*" | grep -v grep | awk '{print $2}'`
		if [ ! -z $pid ]; then
			kill -9 $((pid))
		fi
	elif [ $server_type = "dev" ]; then 
		pid=`ps uax | grep "npl.*port=8900.*" | grep -v grep | awk '{print $2}'`
		if [ ! -z $pid ]; then
			kill -9 $((pid))
		fi
	elif [ $server_type = "rls" ]; then 
		pid=`ps uax | grep "npl.*port=8088.*" | grep -v grep | awk '{print $2}'`
		if [ ! -z $pid ]; then
			kill -9 $((pid))
		fi
	else
		stop_server "test"
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
	if [ "$1" == "build" ]; then
		if [ -e ${build_dir} ]; then
			rm -fr ${build_dir}
		fi
		node r.js -o r_package.js
	elif [ "$1" == "start" ]; then
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
