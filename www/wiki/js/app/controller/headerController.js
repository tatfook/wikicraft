/**
 * Created by wuxiangan on 2016/12/20.
 */

define(['app', 'helper/util', 'helper/storage'], function (app, util, storage) {
    app.controller('headerController',['$rootScope','$scope', 'Account', 'Message', function ($rootScope, $scope, Account, Message) {
        console.log("headerController");
        //$scope.isLogin = Account.isAuthenticated();
        $scope.urlObj = {};

        // 用户收藏
        $scope.getFavoriteList = function() {
            util.post(config.apiUrlPrefix + "user_favorite/getFavoriteWebsiteListByUserId", {userId:$scope.user._id}, function (data) {
                console.log(data);
                $scope.favoriteWebsiteObj = data;
            });
            
        }
        function init() {
            var urlObj = util.parseUrl();
            $scope.isWikiPage = urlObj.username == 'wiki';

            if (!config.localEnv) {
                $scope.urlObj.username = urlObj.username;
                $scope.urlObj.sitename = urlObj.sitename;
                $scope.urlObj.pagename = urlObj.pagename;
                if (urlObj.username != 'wiki') {
                    if (urlObj.sitename) {
                        util.post(config.apiUrlPrefix + 'website_pages/getByWebsiteName',{websiteName:urlObj.sitename}, function (data) {
                            $scope.userSitePageList = data || [];
                        });
                    }
                }
            }

            if (Account.isAuthenticated()) {
                // 用户站点
                if (urlObj.username != 'wiki') {
                    util.post(config.apiUrlPrefix + 'website/getAllByUserId', {userId:$scope.user._id}, function (data) {
                        $scope.userSiteList = data || [];
                    });
                } else {
                    $scope.userSiteList = [{name:'home'},{name:'login'},{name:'userCenter'}];
                }

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
            $scope.goUrlSite();

            //util.post(config.apiUrlPrefix + 'website_pages/getByWebsiteId', {websiteId:site._id}, function (data) {
            //    $scope.userSitePageList = data;
            //});
        }

        $scope.selectPage = function (page) {
            $scope.urlObj.pagename = page.name;
            $scope.goUrlSite();
        }

        $scope.goUrlSite = function () {
            var url = '/' + $scope.urlObj.username;
            url += '/' + ($scope.urlObj.sitename || $scope.urlObj.username);
            if ($scope.urlObj.pagename || $scope.urlObj.username != 'wiki')
                url += '/' + ($scope.urlObj.pagename || 'index' );
            util.goUserSite(url);
        }

        $scope.goUserSite = function (username) {
            if (username == 'wiki') {
                util.goUserSite('/' + username + '/home');
            } else {
                util.goUserSite('/' + username + '/' + username);
            }
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
            storage.sessionStorageSetItem('userCenterContentType', 'websiteManager');
            util.go("userCenter");
            //util.go("website");
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
            $rootScope.isLogin = false;
            util.go('home');
        };

        $scope.$on("onUserProfile", function (event, user) {
            console.log('onUserProfile');
            $scope.user = user;
        });

        $scope.$watch(Account.isAuthenticated, function (bAuthenticated) {
            console.log("isAuthenticated");
        });
    }]);
});