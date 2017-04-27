/**
 * Created by big on 2017.4.23
 */

define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/worldList.html'
], function (app, util, htmlContent) {
    function registerController(wikiblock) {
        app.directive('preview', [function () {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    imageSrc: "@",
                    hasPreview: "@",
                },
                link: function (scope, element, attrs) {
                    if (JSON.parse(scope.hasPreview)) {
                        element.context.innerHTML = '<img src="' + scope.imageSrc + '" />';
                    } else {
                        element.context.innerHTML = '<div><h3>暂无图片</h3></div>';
                    }

                    util.$apply(scope);
                },
                template: "<div>图片正在加载中</div>",
            };
        }])
        .registerController('worldListController', ['$scope', function ($scope) {
            $scope.modParams = angular.copy(wikiblock.modParams || {});
            console.log(wikiblock.modParams);
            $($scope.modParams).each(function () {
                this.preview = JSON.parse(this.preview);

                if (this.filesTotals) {
                    if (this.filesTotals <= 1048576) {
                        this.filesTotals = parseInt(this.filesTotals / 1024) + "KB";
                    } else {
                        this.filesTotals = parseInt(this.filesTotals / 1024 / 1024) + "M";
                    }
                } else {
                    this.filesTotals = "0KB";
                }
            });

            $scope.opusTotals = $scope.modParams.length;
            
            util.$apply($scope);
        }]);
    }
    return {
        render: function (wikiblock) {
            console.log(wikiblock);
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