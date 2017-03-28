/**
 * Created by wuxiangan on 2017/1/6.
 */

define(['app',
    'text!html/fans.html',
], function (app, htmlContent, util) {
    app.registerController("fansController", ['$scope', function ($scope) {
        console.log("+++++++++++++++++++++++++++++++");
        function init() {
            $scope.fansList=[1,2,3,4,5,6,7,8,9,10,11,12];
            // util.post(config.apiUrlPrefix + "website/getWebsiteListByUserId", {userId: $scope.user._id}, function (data) {
            //     $scope.siteList = data;
            //     $scope.totalFavoriteCount = 0;
            //     for (var i = 0; i < $scope.siteList.length; i++) {
            //         $scope.totalFavoriteCount += $scope.siteList[i].favoriteCount;
            //     }
            //     if ($scope.siteList.length > 0) {
            //         $scope.currentFansSite = $scope.siteList[0];
            //         getFansList();
            //     }
            // });
            //
            // function getFansList() {
            //     var params = {
            //         userId: $scope.user._id,
            //         websiteId: $scope.currentFansSite._id,
            //         page: $scope.currentPage,
            //         pageSize: $scope.pageSize
            //     };
            //     util.http("POST", config.apiUrlPrefix + "user_favorite/getFansListByUserId", params, function (data) {
            //         $scope.totalItems = data.total;
            //         $scope.fansList = data.fansList || [];
            //     });
            // }
            //
            // $scope.selectFansSite = function (site) {
            //     $scope.currentFansSite = site;
            //     getFansList();
            // }
            //
            // $scope.fansPageChanged = function () {
            //     getFansList();
            // }
        }
        init();
        //$scope.$watch("$viewContentLoaded", init);
    }]);

    return htmlContent;
});

