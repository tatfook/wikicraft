#!/bin/bash

code_dir="../keepwork_code"

change_dev_env() {
	local env_branch=$1
	local env_name=$2
	if [ -z $env_branch or -z $env_name ]; then
		echo "需要指明环境类型(分支名 环境名)"
	fi

	cd $code_dir
	git reset --hard HEAD
	git checkout $env_branch
	git pull origin $env_branch
	cd -
	sh start.sh stop dev
	rm -fr "www/$env_name"
	cp -fr "$code_dir/wwww/wiki" "www/$env_name"
	sh start.sh start dev
}

change_dev_env $1 $2
