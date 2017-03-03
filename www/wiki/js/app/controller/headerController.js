/**
 * Created by wuxiangan on 2016/12/20.
 */

define(['app', 'helper/util', 'helper/storage'], function (app, util, storage) {
    app.controller('headerController',['$scope', 'Account', 'Message', function ($scope, Account, Message) {
        console.log("headerController");

        $scope.isLogin = Account.isAuthenticated();
        $scope.urlObj = {username:$scope.user.username};
        
        $scope.favoriteWebsiteObj = {};
        
        function getFavoriteList() {
            util.http("POST", config.apiUrlPrefix + "user_favorite/getFavoriteWebsiteListByUserId", {userId:$scope.user._id}, function (data) {
                $scope.favoriteWebsiteObj = data;
            });
            
        }
        function init() {

            var urlObj = util.parseUrl();
            if (!config.localEnv && urlObj.username != 'wiki') {
                if (urlObj.sitename) {
                    $scope.urlObj.sitename = urlObj.sitename;
                    util.post(config.apiUrlPrefix + 'website_pages/getByWebsiteName',{websiteName:urlObj.sitename}, function (data) {
                        $scope.userSitePageList = data || [];
                    });
                }
                if (urlObj.pagename) {
                    $scope.urlObj.pagename = urlObj.pagename;
                }
            }

            if (Account.isAuthenticated()) {
                // 用户收藏
                util.post(config.apiUrlPrefix + "user_favorite/getFavoriteWebsiteListByUserId", {userId:$scope.user._id}, function (data) {
                    $scope.favoriteWebsiteObj = data;
                });
                // 用户站点
                util.post(config.apiUrlPrefix + 'website/getAllByUserId', {userId:$scope.user._id}, function (data) {
                    $scope.userSiteList = data || [];
                });
                // 用户收藏
                util.post(config.apiUrlPrefix + 'user_visit_history/getCurrentDay',{userId:$scope.user._id}, function (data) {
                    $scope.visitHistoryList = data.visitList;
                });
            }
        }
        
        $scope.$watch('$viewContentLoaded', init);

        $scope.selectSite = function (site) {
            $scope.urlObj.sitename = site.name;
            $scope.urlObj.pagename = undefined;

            util.post(config.apiUrlPrefix + 'website_pages/getByWebsiteId', {websiteId:site._id}, function (data) {
                $scope.userSitePageList = data; 
            });
        }

        $scope.selectPage = function (page) {
            $scope.urlObj.pagename = page.name;
            $scope.goUrlSite();
        }

        $scope.goUrlSite = function () {
            var url = '/' + $scope.urlObj.username;
            url += '/' + ($scope.urlObj.sitename || $scope.urlObj.username);
            url += '/' + ($scope.urlObj.pagename || 'index');
            util.goUserSite(url);
        }

        $scope.goUserSite = function (site) {
            util.goUserSite('/' + site.username + '/' + site.name);
        }

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
            //window.location.href = "/wiki/home";
            util.go('home');
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