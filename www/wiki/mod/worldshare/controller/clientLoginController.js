/**
 * Title: clientLogin
 * Author: Big
 * Date: 2017/4/17
 */

define([
    'app',
    'text!mod/worldshare/html/client_login.html',
], function (app,htmlContent) {

    app.controller("clientLogin", function ($scope, $location, Account) {
        var param = $location.search();
        var token = param.token;
        var user  = {};

        $scope.type = -1;

        if(token != undefined){
            $scope.type = 1;

            $scope.$on("onUserProfile", function (event, newValue) {
                user = angular.copy(newValue);

                if(user != undefined && user.hasOwnProperty("github")){
                    $scope.type = 2;
                }
            });
            /*
            $scope.$watch(Account.getUser, function (newValue, oldValue) {
                user = angular.copy(newValue);

                if(user != undefined && user.hasOwnProperty("github")){
                    $scope.type = 2;
                }
            });
            */

            $scope.linkGithub = function(){
                if(user.hasOwnProperty("_id")){
                    Account.linkGithub();
                }
            }
        }
    });

    return htmlContent;
});
