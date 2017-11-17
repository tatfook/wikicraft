/**
 * Created by wuxiangan on 2017/1/10.
 */

define([
    'app'
], function (app, htmlContent) {
    app.registerController('videoPlayerController', ['$scope', '$rootScope', '$location', '$http', function ($scope, $rootScope, $location, $http) {
        $rootScope.frameFooterExist = false;
        $rootScope.frameHeaderExist = false;
    }]);

    return '\
        <div ng-controller="videoPlayerController">\
            Let\'s Play Video \
        </div>\
    ';
});