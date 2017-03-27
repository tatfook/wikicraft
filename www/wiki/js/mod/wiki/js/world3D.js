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
```
*/