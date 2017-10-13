/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app','helper/util', 'helper/storage', 'text!html/usershow.html'], function (app, util, storage, htmlContent) {
    app.registerController('usershowController', ['$scope',function ($scope) {
        var usershowObj = storage.sessionStorageGetItem("usershow");
        //console.log(usershowObj);
        $scope.title = usershowObj.title;
        $scope.requestUrl = usershowObj.requestUrl;
        $scope.requestParams = usershowObj.requestParams || {};
        $scope.requestParams.pageSize = 9;
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

        $scope.getUserList = function (page) {
            if (!util.pagination(page, $scope.requestParams, $scope.userObj && $scope.userObj.pageCount)) {
                return ;
            }

            var url = $scope.requestUrl || config.apiUrlPrefix + "user/getByWebsiteId"; // 获得最近更新

            util.http("POST", url, $scope.requestParams, function (data) {
                $scope.userObj = data;
            });
        }

        function init() {
            $scope.getUserList();
        }

        init();
    }]);

    return htmlContent;
});
