/**
 * Created by wuxiangan on 2017/4/5.
 */

define([
    'app',
    'text!mod/example/html/index.html',
], function (app, htmlContent) {
    app.controller('indexController', ['$scope', function ($scope) {
        $scope.modName = "example";
    }]);

    return htmlContent;
});