/**
 * Created by wuxiangan on 2016/12/20.
 */

define(['app', 'helper/util'], function (app, util) {
    app.controller('headerController',['$scope', 'Account', 'Message', function ($scope, Account, Message) {
        console.log("headerController");

        // 信息提示框
        $("#messageTipCloseId").click(function () {
            Message.hide();
        });

        $scope.isLogin = Account.isAuthenticated();
        $scope.user = Account.getUser();

        $scope.goLoginPage = function () {
            window.location.href = "/wiki/login";
            //window.location.href=config.frontEndRouteUrl + "#/login";
        };

        $scope.goRegisterPage = function () {
            window.location.href = "/wiki/home";
            //window.location.href=config.frontEndRouteUrl + "#/home";
        };

        $scope.goHomePage = function () {
            window.location.href = "/wiki/home";
            //window.location.href=config.frontEndRouteUrl + "#/home";
        };

        $scope.goUserCenterPage = function () {
            window.location.href = "/wiki/userCenter";
            //window.location.href=config.frontEndRouteUrl + "#/userCenter";
        };

        $scope.goWebsitePage = function () {
            window.location.href = "/wiki/website";
            //window.location.href=config.frontEndRouteUrl + "#/website";
        };

        $scope.goGitVersionPage = function () {
            window.location.href = "/wiki/gitVersion";
            //window.location.href=config.frontEndRouteUrl + "#/gitVersion";
        };

        $scope.goPersonalPage = function () {
            if (!$scope.isLogin) {
                Message.info("请先登录!!!");
                return;
            }
            util.goUserSite('/' + $scope.user.username + '/' + $scope.user.username);
        };

        $scope.logout = function () {
            Account.logout();
            $scope.isLogin = false;
            window.location.href= config.frontEndRouteUrl + "#/home";
        };

        $scope.$on("onUserProfile", function (event, user) {
            console.log('onUserProfile');
            $scope.user = user;
        });

        $scope.$watch(Account.isAuthenticated, function (bAuthenticated) {
            console.log("isAuthenticated");
            $scope.isLogin = bAuthenticated;
        });
    }]);
});