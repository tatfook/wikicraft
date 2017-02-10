/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app','helper/util', 'helper/storage','text!html/siteshow.html'], function (app, util, storage, htmlContent) {
    app.registerController('siteshowController', ['$scope',function ($scope) {
        var siteshowObj = storage.sessionStorageGetItem("siteshow");
        //console.log(siteshowObj);
        $scope.title = siteshowObj.title;
        $scope.requestUrl = siteshowObj.requestUrl;
        $scope.requestParams = siteshowObj.requestParams || {};
        $scope.requestParams.pageSize = 12;
        $scope.requestParams.page = 0;

        window.scrollTo(0,0);

        // 随机颜色
        $scope.getRandomColor = function (index) {
            return util.getRandomColor(index);
        }

        var height = (200 + Math.floor(($scope.requestParams.pageSize-1)/3) * 280) + "px";
        $(".workslistNav").css("height",height);
        height = Math.ceil($scope.requestParams.pageSize/3) * 280 + "px";
        $(".workslist").css("height",height);

        $scope.getSiteList = function (page) {
            if (!util.pagination(page, $scope.requestParams, $scope.siteObj && $scope.siteObj.pageCount)) {
                return ;
            }
            util.http("POST", $scope.requestUrl, $scope.requestParams, function (data) {
                $scope.siteObj = data;
            });
        }

        function init() {
            $scope.getSiteList();
        }

        init();
    }]);

    return htmlContent;
});