/**
 * Created by wuxiangan on 2016/12/20.
 */

define(['app'], function (app) {
    app.controller('headerController',['$scope', '$state', '$auth', 'Account', 'Message', function ($scope, $state, $auth, Account, Message) {
        console.log("headerController");

        // 信息提示框
        $("#messageTipCloseId").click(function () {
            Message.hide();
        });

        $scope.isLogin = Account.isAuthenticated();
        $scope.user = Account.getUser();

        $scope.goLoginPage = function () {
            window.location.href="/#/login";
        };

        $scope.goRegisterPage = function () {
            window.location.href="/#/home";
        };

        $scope.goHomePage = function () {
            window.location.href="/#/home";
        };

        $scope.goPersonalPage = function () {
            if (!$scope.isLogin) {
                Message.info("请先登录!!!");
                return;
            }
            window.location.href = "/" + $scope.user.username;
        };

        $scope.logout = function () {
            $auth.logout();
            $scope.isLogin = false;
            window.location.href="/#/home";
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