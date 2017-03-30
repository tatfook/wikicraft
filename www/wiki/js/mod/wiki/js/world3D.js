/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/world3D.html'
], function (app, util, htmlContent) {
    function registerController(wikiblock) {
        app.registerController('world3DController',['$scope', function ($scope) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.modParams = angular.copy(wikiblock.modParams || {});
            $scope.showModal=false;

            $scope.checkEngine=function () {
                if(true){// 判断是否安装了Paracraft
                    $scope.showModal=true;
                }
            }

            $scope.closeModal=function () {
                $scope.showModal=false;
                window.open("paracraft://cmd/loadworld " + $scope.modParams.worldUrl);
            }

            $scope.getImageUrl = function (url) {
                if (!url)
                    return undefined;

                if (url.indexOf("http") == 0)
                    return url;

                if (url[0] == '/')
                    url = url.substring(1);

                return $scope.imgsPath + url;
            }
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