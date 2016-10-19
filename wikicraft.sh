#!/bin/bash

workDir=`pwd`

case $1 in
	"start")
		echo "start wikicraft web server..."
		npl -d bootstrapper="script/apps/WebServer/WebServer.lua"  root="www/" port="8099" dev="${workDir}"
		;;
	"stop")
		echo "stop wikicraft web server..."
		killall npl
		;;
	"restart")
		echo "restart wikicraft web server..."
		killall npl
		npl -d bootstrapper="script/apps/WebServer/WebServer.lua"  root="www/" port="8099" dev="${workDir}"
		;;
	"update")
		echo "update npl_package...."
		cd "npl_packages/main"
		echo `pwd`
		git pull origin master

		echo "update wikicraft...."
		cd ${workDir}
		echo `pwd`
		git pull origin master
		;;
	*)
		echo "unknow cmd"
		;;
esac




