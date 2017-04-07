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
            var user = angular.copy($scope.user);
            user.dataSource = undefined;
            user.dataSourceId = parseInt($scope.defaultDataSourceId);
            util.post(config.apiUrlPrefix + 'user/updateUserInfo', user, function (data) {
                dataSource.setDefaultDataSourceId(user.dataSourceId);
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

            util.post(config.apiUrlPrefix + 'data_source/setDataSource', $scope.newDataSource, function () {
                Message.info("数据源添加成功");
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
            util.post(config.apiUrlPrefix + 'data_source/deleteById', {dataSourceId:x._id}, function () {
                getUserDataSource();
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
        }

        $scope.$watch('viewContentLoaded', init);

    }]);

    return htmlContent;
});
