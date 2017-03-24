/**
 * Created by wuxiangan on 2016/12/20.
 */

define(['app', 'helper/util', 'helper/storage'], function (app, util, storage) {
    app.controller('headerController', ['$rootScope', '$scope', 'Account', 'Message', 'modal', function ($rootScope, $scope, Account, Message, modal) {
        console.log("headerController");
        //$scope.isLogin = Account.isAuthenticated();
        $scope.urlObj = {};
        $scope.isIconShow = !util.isOfficialPage();
        $scope.trendsType = "organization";

        // 通过站点名搜索
        $scope.searchWebsite = function () {
            storage.sessionStorageSetItem("siteshowParams", {siteshowType: 'search', websiteName: $scope.search});
            //window.location.reload(false);
            util.go("siteshow");
        }

        function init() {
            $scope.userSiteList = [{name: 'home'}, {name: 'login'}, {name: 'userCenter'},{name:'wikiEditor'}];
            var urlObj = util.parseUrl();

            if (!config.islocalWinEnv()) {
                $scope.urlObj.username = urlObj.username || "wiki";
                $scope.urlObj.sitename = urlObj.sitename || "home";
                $scope.urlObj.pagename = urlObj.pagename;
                //console.log(urlObj);
                if (urlObj.domain) {
                    console.log(urlObj.domain);
                    util.post(config.apiUrlPrefix + 'website/getByDomain', {domain: urlObj.domain}, function (data) {
                        console.log(data);
                        if (data) {
                            $scope.urlObj.pagename = $scope.urlObj.sitename;
                            $scope.urlObj.username = data.username;
                            $scope.urlObj.sitename = data.name;
                        }
                    });
                }
            }
        }

        $scope.$watch('$viewContentLoaded', init);

        $scope.selectSite = function (site) {
            $scope.urlObj.sitename = site.name;
            $scope.urlObj.pagename = undefined;
            $scope.goUrlSite();
        }

        // 点击站点
        $scope.clickSiteList = function () {
            if ($scope.urlObj.username == "wiki")
                return;
            util.post(config.apiUrlPrefix + 'website/getAllByUsername', {username: $scope.urlObj.username}, function (data) {
                $scope.userSiteList = data || [];
            });
        }

        $scope.clickPageList = function () {
            if ($scope.urlObj.username == "wiki")
                return;

            if (urlObj.sitename) {
                util.post(config.apiUrlPrefix + 'website_pages/getByWebsiteName', {websiteName: urlObj.sitename}, function (data) {
                    $scope.userSitePageList = data || [];
                });
            }
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


        //=======================================================
        $scope.clickMyHistory = function () {
            if (!Account.isAuthenticated())
                return;

            // 用户收藏
            util.post(config.apiUrlPrefix + 'user_visit_history/get', {userId: $scope.user._id}, function (data) {
                $scope.visitHistoryList = data.visitList;
            });
        }

        $scope.clickMyFavorite = function () {
            if (!Account.isAuthenticated())
                return;
            util.post(config.apiUrlPrefix + "user_favorite/getFavoriteWebsiteListByUserId", {userId: $scope.user._id}, function (data) {
                //console.log(data);
                $scope.favoriteWebsiteObj = data;
            });
        }
        // 用户动态=======================================start=========================================
        $scope.clickMyTrends = function () {
            if (!Account.isAuthenticated())
                return;

            // 用户动态
            util.post(config.apiUrlPrefix + 'user_trends/getUnread', {userId: $scope.user._id}, function (data) {
                $scope.trendsList = data.trendsList;
                $scope.trendsCount = data.total;
            });
        }
        $scope.isShowTrend = function (trends) {
            var trendsTypeList = ["organization", "favorite", "works"];
            return trends.state == 'unread' && $scope.trendsType == trendsTypeList[trends.trendsType];
        }
        // 选择动态类型
        $scope.selectTrendsType = function (trendsType) {
            //console.log(trendsType);
            $scope.trendsType = trendsType;
        }
        // 读取动态
        $scope.rendTrends = function (trends) {
            trends.state = 'read';
            util.post(config.apiUrlPrefix + 'user_trends/upsert', trends);

            for (var i = 0; i < $scope.trendsList.length; i++) {
                if ($scope.trendsList[i]._id = trends._id) {
                    $scope.trendsList[i].state = 'read';
                    break;
                }
            }
        }
        // 用户动态=======================================end=========================================

        // 页面编辑页面
        $scope.goWikiEditorPage = function () {
            storage.sessionStorageSetItem("urlObj", util.parseUrl());
            util.go("wikiEditor");
        }

        // 用户主页
        $scope.goUserIndexPage = function (username) {
            util.goUserSite('/' + username);
        }

        $scope.goLoginPage = function () {
            // util.go("login");
            if (window.location.pathname != "/wiki/login" && window.location.pathname != "/wiki/home" && window.location.pathname != "/") {
                modal('controller/loginController', {
                    controller: 'loginController',
                    size: 'lg'
                }, function (result) {
                    console.log(result);
                    // nowPage.replaceSelection(login.content);
                }, function (result) {
                    console.log(result);
                });
            } else {
                util.go("login");
            }
        };

        $scope.goRegisterPage = function () {
            util.go("home");
        };

        $scope.goHomePage = function () {
            util.go("home");
        };

        $scope.goModPackagePage = function () {
            util.go("mod/packages",true);
        };

        $scope.goVIPLevel = function () {
            util.go("VIPLevel");
        };

        $scope.goUserCenterPage = function (contentType) {
            if (window.location.pathname == '/wiki/userCenter') {
                $rootScope.$broadcast('userCenterContentType', contentType);
            } else {
                storage.sessionStorageSetItem('userCenterContentType', contentType);
                util.go("userCenter");
            }
        };

        $scope.logout = function () {
            Account.logout();
            $rootScope.isLogin = false;
            util.go('home');
        };

        $scope.$on("onUserProfile", function (event, user) {
            //console.log('onUserProfile');
            $scope.user = user;
            init();
        });

        $scope.$watch(Account.isAuthenticated, function (bAuthenticated) {
            console.log("isAuthenticated");
            $rootScope.isLogin = Account.isAuthenticated();
        });
    }]);
});