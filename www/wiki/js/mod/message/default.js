/**
 * Created by wuxiangan on 2016/12/20.
 */

define(['app','app/config'], function (app, config) {
    app.registerController("defaultMessageController", function ($scope) {
        $scope.htmlUrl = config.wikiModuleConfig.htmlPath + 'message/html/test.html';
        $scope.hi
    });

    return {
        render: function () {
            return '<div ng-controller="defaultMessageController"><div>{{message}}</div><div ng-include="htmlUrl"></div></div>';
        }
    }
});