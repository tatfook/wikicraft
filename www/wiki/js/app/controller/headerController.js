/**
 * Created by wuxiangan on 2016/12/20.
 */

define(['app', 'helper/util', 'helper/storage'], function (app, util, storage) {
    app.controller('headerController',['$scope', 'Account', 'Message', function ($scope, Account, Message) {
        console.log("headerController");

        // 信息提示框
        $("#messageTipCloseId").click(function () {
            Message.hide();
        });

        $scope.isLogin = Account.isAuthenticated();
        $scope.user = Account.getUser();

        // 页面编辑页面
        $scope.goWikiEditorPage = function() {
            storage.sessionStorageSetItem("urlObj", util.parseUrl());
            util.go("wikiEditor")
        }

        $scope.goLoginPage = function () {
            util.go("login");
        };

        $scope.goRegisterPage = function () {
            util.go("home");
        };

        $scope.goHomePage = function () {
            util.go("home");
        };

        $scope.goUserCenterPage = function () {
            util.go("userCenter");
        };

        $scope.goWebsitePage = function () {
            util.go("website");
        };

        $scope.goGitVersionPage = function () {
            util.go("gitVersion");
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
            //window.location.href= config.frontEndRouteUrl + "#/home";
            window.location.href = "/wiki/home";
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