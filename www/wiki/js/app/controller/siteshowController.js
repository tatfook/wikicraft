/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app', 'helper/util', 'helper/storage', 'text!html/siteshow.html'], function (app, util, storage, htmlContent) {
    app.registerController('siteshowController', ['$scope', function ($scope) {
        $scope.totalItems = 0;
        $scope.currentPage = 1;
        $scope.pageSize = 12;

        function getSiteList() {
            var params = {pageSize:$scope.pageSize, page:$scope.currentPage,sortBy:'-favoriteCount'};

            // 个人站点
            if ($scope.siteshowType == 'personal') {
                params.filterType = 'personal';
            }
            console.log($scope.siteshowType);

            util.http("POST", config.apiUrlPrefix + 'website/getSiteList', params, function (data) {
                $scope.siteObj = data;
                $scope.totalItems = data.total;
            });
        }

        function init() {
            console.log('init siteshow controller');
            $scope.siteshowType = storage.sessionStorageGetItem('siteshowType') || 'all';
            getSiteList();
        }

        $scope.sitePageChanged = function () {
            getSiteList();
        }

        $scope.$watch('$viewContentLoaded', init);
    }]);

    return htmlContent;
});