/**
 * Created by wuxiangan on 2016/12/20.
 */

define(['app'], function (app) {
    function registerController(cmdName, moduleParams) {
        app.registerController("testModuleController", function ($scope) {
            console.log(moduleParams);
            $scope.message = moduleParams;
            $scope.htmlUrl = config.wikiModPath + 'test/html/test.html';

            $scope.ok = function () {
                $scope.message = 10;
            }
        });
    }
    return {
        render: function (cmdName, moduleParams) {
            registerController(cmdName, moduleParams);

            return '<div ng-controller="testModuleController"><div>{{message}}</div><div ng-include="htmlUrl"></div></div>';
        }
    }
});