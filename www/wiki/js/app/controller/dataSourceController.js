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
        $scope.dataSourceList = $scope.user.dataSource;
        $scope.defaultDataSourceId = $scope.user.dataSourceId && $scope.user.dataSourceId.toString();

        $scope.dataSourceTypeList = ["github", "gitlab"];
        $scope.newDataSource = {userId:$scope.user._id};

        // 更改默认数据源
        $scope.changeDefaultDataSource = function () {
            //console.log("change default data source");
            $scope.user.dataSourceId = parseInt($scope.defaultDataSourceId);
            util.post(config.apiUrlPrefix + 'user/updateUserInfo', $scope.user, function (data) {
                dataSource.getUserDataSource($scope.user.username).setDefaultDataSourceId($scope.user.dataSourceId);
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

            $scope.errMsg = "";

            // 格式化根路径
            if ($scope.newDataSource.rootPath) {
                var rootPath = $scope.newDataSource.rootPath;
                var paths = rootPath.split('/');
                var path = "";
                for (var i = 0; i < paths.length; i++) {
                    if (paths[i]) {
                        path += "/" + paths[i];
                    }
                }
                $scope.newDataSource.rootPath = path;
            }

            util.post(config.apiUrlPrefix + 'data_source/setDataSource', $scope.newDataSource, function () {
                Message.info("操作成功");
                $scope.newDataSource = {userId:$scope.user._id};
                getUserDataSource();
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

            util.post(config.apiUrlPrefix + 'data_source/deleteById', {id:x._id}, function () {
                //getUserDataSource();
                x.isDelete = true;
            });
        }

        function getUserDataSource() {
            util.post(config.apiUrlPrefix + 'data_source/getByUserId', {userId:$scope.user._id}, function (data) {
                console.log(data);
                $scope.dataSourceList = data;
                $scope.user.dataSource = data;
                Account.setUser($scope.user);
            });
        }

        function init() {
            getUserDataSource();
        }

        $scope.$watch('viewContentLoaded', init);

    }]);

    return htmlContent;
});
