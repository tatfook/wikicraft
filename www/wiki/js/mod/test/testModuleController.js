/**
 * Created by wuxiangan on 2016/12/20.
 */

define(['app'], function (app) {
    app.registerController("testModuleController", function ($scope) {
        $scope.htmlUrl = config.wikiModuleConfig.htmlPath + 'test/html/test.html';
    });

    return {
        render: function () {
            return '<div ng-controller="testModuleController"><div>{{message}}</div><div ng-include="htmlUrl"></div></div>';
        }
    }
});