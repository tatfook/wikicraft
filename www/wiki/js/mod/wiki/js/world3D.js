/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/world3D.html'
], function (app, util, htmlContent) {
    function registerController(wikiblock) {
        app.registerController('world3DController',['$scope', '$http', function ($scope, $http) {
            $scope.imgsPath  = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.modParams = angular.copy(wikiblock.modParams || {});
            $scope.showModal = false;

            //console.log($scope.modParams);
            if ($scope.modParams.filesTotals <= 1048576) {
                $scope.modParams.filesTotals = parseInt($scope.modParams.filesTotals / 1024) + "KB";
            } else {
                $scope.modParams.filesTotals = parseInt($scope.modParams.filesTotals / 1024 / 1024) + "M";
            }

            try {
                $scope.modParams.logoUrl = JSON.parse($scope.modParams.logoUrl);
                $scope.modParams.logoUrl = $scope.modParams.logoUrl[0].previewUrl;
            } catch(e) {
                $scope.modParams.logoUrl = "";
            }

            var paracraftUrl = "paracraft://cmd/loadworld " + $scope.modParams.worldUrl;
            //console.log(paracraftUrl);

            $scope.checkEngine = function () {
                if(true){// 判断是否安装了Paracraft
                    $scope.showModal=true;
                }
                //alert(paracraftUrl);
                window.open(paracraftUrl);
            }

            $scope.closeModal = function () {
                $scope.showModal=false;
            }

            $scope.getImageUrl = function (url) {
                if (!url)
                    return undefined;

                if (url.indexOf("http") == 0)
                    return url + "?ver=" + $scope.modParams.version;

                if (url[0] == '/')
                    url = url.substring(1);

                return $scope.imgsPath + url + "?ver=" + $scope.modParams.version;
            }

            $scope.clickDownload = function() {
                $scope.showModal = false;
                window.open("http://www.paracraft.cn");
            }

            $scope.viewTimes = 0;
            var viewTimesUrl = "/api/mod/worldshare/models/worlds/getOneOpus";
            var params = { opusId: $scope.modParams.opusId };

            util.http("POST", viewTimesUrl, params, function (response) {
                //console.log(response);
                $scope.viewTimes = response.viewTimes;
            }, function (response) { });
        }]);
    }
    return {
        render: function(wikiblock){
            registerController(wikiblock);
            return htmlContent;
        }
    };
})

/*
```@wiki/js/world3D
{
    "worldName":"3D海洋世界",
    "worldUrl":"https://github.com/LiXizhi/HourOfCode/archive/master.zip",
    "logoUrl":"",
    "desc":"",
    "username":"lixizhi",
    "visitCount":235,
    "favoriteCount":51,
    "updateDate":"2017-03-30",
    "version":"1.0.1"
}
```
*/