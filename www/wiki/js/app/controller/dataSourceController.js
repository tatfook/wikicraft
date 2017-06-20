/**
 * Created by wuxiangan on 2017/3/9.
 */


define(['app',
    'helper/util',
    'helper/storage',
    'helper/dataSource',
    'text!html/dataSource.html',
], function (app, util, storage,dataSource, htmlContent) {
    app.registerController('dataSourceController', ['$scope', 'Account', 'Message', 'github', function ($scope, Account, Message) {
        $scope.dataSourceTypeList = ["github", "gitlab"];

        // 更改默认数据源
        $scope.changeDefaultDataSource = function () {
			//console.log($scope.defaultDataSourceName);
			$scope.user.defaultDataSourceName = $scope.defaultDataSourceName;
            util.post(config.apiUrlPrefix + 'user/updateUserInfo', {
				username:$scope.user.username,
				defaultDataSourceName:$scope.defaultDataSourceName,
			});
        };

        // 添加新的数据源
        $scope.clickNewDataSource = function () {
            //console.log($scope.newDataSource);
            if (!$scope.newDataSource.type || !$scope.newDataSource.name || !$scope.newDataSource.apiBaseUrl || !$scope.newDataSource.dataSourceToken) {
                $scope.errMsg = "表单相关字段不能为空!!!";
                return ;
            }

            if ($scope.newDataSource.name == "内置gitlab" || $scope.newDataSource.name == "内置github") {
                $scope.errMsg = "内置数据源不可更改!!!";
                return;
            }
			
			var isModify = false;
			for (var i = 0; i < ($scope.dataSourceList || []).length; i++) {
				var temp = $scope.dataSourceList[i];
				if ($scope.newDataSource.name == temp.name) {
					isModify = true;
				}
			}

            $scope.errMsg = "";

            // 格式化根路径
            //if ($scope.newDataSource.rootPath) {
                //var rootPath = $scope.newDataSource.rootPath;
                //var paths = rootPath.split('/');
                //var path = "";
                //for (var i = 0; i < paths.length; i++) {
                    //if (paths[i]) {
                        //path += "/" + paths[i];
                    //}
                //}
                //$scope.newDataSource.rootPath = path;
            //}

            util.post(config.apiUrlPrefix + 'data_source/setDataSource', $scope.newDataSource, function (data) {
                Message.info("操作成功");
				!isModify && $scope.dataSourceList.push(angular.copy(data));
				$scope.newDataSource = {username:$scope.user.username};
                //getUserDataSource();
            });
        }

        // 修改数据源
        $scope.clickModifyDataSource = function (x) {
            $scope.newDataSource = angular.copy(x);
        }

        // 删除数据源
        $scope.clickDeleteDataSource = function (x) {
            if (x.name == "内置gitlab" || x.name == "内置github") {
                Message.info( "内置数据源不可删除!!!");
                return;
            }

            util.post(config.apiUrlPrefix + 'data_source/deleteByName', {username:x.username, dataSourceName:x.name}, function () {
				for (var i = 0; i < $scope.dataSourceList.length; i++) {
					if (x.name == $scope.dataSourceList[i].name) {
						$scope.dataSourceList.splice(i, 1);
					}
				}
            });
        }

		function getUserDataSource() {
			util.post(config.apiUrlPrefix + 'data_source/getByUsername', {username:$scope.user.username}, function (data) {
                $scope.dataSourceList = data;
            });
        }

        function init() {
			$scope.defaultDataSourceName = $scope.user.defaultDataSourceName;
			$scope.newDataSource = {username:$scope.user.username};
            getUserDataSource();
        }

		$scope.$watch('viewContentLoaded', function(){
			Account.getUser(function(userinfo){
				$scope.user = userinfo;
				init();
			});
		});

    }]);

    return htmlContent;
});
