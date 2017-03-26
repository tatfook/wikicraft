/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app', 'helper/util', 'helper/storage', 'text!html/siteshow.html'], function (app, util, storage, htmlContent) {
    app.registerController('siteshowController', ['$scope', function ($scope) {
        $scope.totalItems = 0;
        $scope.currentPage = 1;
        $scope.pageSize = 12;
        var siteshowParams = {siteshowType:'all'};

        function getSiteList() {
            var params = {pageSize:$scope.pageSize, page:$scope.currentPage,sortBy:'-favoriteCount'};
            var url = config.apiUrlPrefix + 'website/getSiteList';
            // 个人站点
            if (siteshowParams.siteshowType == 'personal') {
                params.categoryId = 0;
            } else if (siteshowParams.siteshowType == 'search') {
                params.websiteName = siteshowParams.websiteName;
            }

            util.http("POST", url, params, function (data) {
                $scope.siteObj = data;
                $scope.totalItems = data.total;
            });
        }

        function init() {
            console.log('init siteshow controller');
            siteshowParams = storage.sessionStorageGetItem('siteshowParams') || siteshowParams;
            getSiteList();
        }

        $scope.sitePageChanged = function () {
            getSiteList();
        }

        $scope.$watch('$viewContentLoaded', init);
    }]);

    return htmlContent;
});