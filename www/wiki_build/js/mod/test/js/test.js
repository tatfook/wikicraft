/**
 * Created by wuxiangan on 2016/12/20.
 */

define(['app'], function (app) {
    function registerController(wikiBlock) {
        app.registerController("testModuleController", function ($scope) {
            console.log(wikiBlock);
            $scope.htmlUrl = config.wikiModPath + 'test/html/test.html';
            $scope.modViewEdit = wikiBlock.viewEdit;
            //$scope.content = wikiBlock.modParams.key;

            $scope.submit = function () {
                console.log($scope);
                console.log($scope.content);
                wikiBlock.modParams.key = $scope.content;
                console.log(wikiBlock.modParams);
                wikiBlock.applyModParams(wikiBlock.modParams);
            }
        });
    }
    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);

            return '<div ng-controller="testModuleController"><div ng-include="htmlUrl"></div></div>';
        }
    }
});