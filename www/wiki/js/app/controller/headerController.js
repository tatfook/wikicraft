/**
 * Created by wuxiangan on 2016/12/20.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'jquery-sharejs'
], function (app, util, storage) {
    app.controller('headerController', ['$rootScope', '$scope', 'Account', 'Message', 'modal', function ($rootScope, $scope, Account, Message, modal) {
        console.log("headerController");
        //$scope.isLogin = Account.isAuthenticated();
        $scope.urlObj = {};
        $scope.isIconShow = !util.isOfficialPage();
        $scope.trendsType = "organization";
        $scope.isCollect=false;//是否已收藏当前作品

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

        $scope.goUserSite = function (site) {
            util.goUserSite('/' + site.username + '/' + site.name + '/index');
        }

        $scope.goUserPersonalSite = function (username) {
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

        $scope.goUserCenterPage = function (contentType, subContentType) {
            console.log(contentType, subContentType);
            if (window.location.pathname == '/wiki/userCenter') {
                $rootScope.$broadcast('userCenterContentType', contentType);
                subContentType && $rootScope.$broadcast('userCenterSubContentType', subContentType);
            } else {
                storage.sessionStorageSetItem('userCenterContentType', contentType);
                subContentType && storage.sessionStorageSetItem('userCenterSubContentType', subContentType);
                util.go("userCenter");
            }
        };

        $scope.logout = function () {
            Account.logout();
            $rootScope.isLogin = false;
            util.go('home');
        };
        
        $scope.clickShare=function () {
            var $config = {
                url                 : '', // 网址，默认使用 window.location.href
                source              : '', // 来源（QQ空间会用到）, 默认读取head标签：<meta name="site" content="http://overtrue" />
                title               : '', // 标题，默认读取 document.title 或者 <meta name="title" content="share.js" />
                description         : '', // 描述, 默认读取head标签：<meta name="description" content="PHP弱类型的实现原理分析" />
                image               : '', // 图片, 默认取网页中第一个img标签
                sites               : ['qq', 'qzone','tencent' , 'weibo', 'wechat'], // 启用的站点（weibo qq wechat tencent douban qzone linkedin diandian facebook twitter google）
                disabled            : [], // 禁用的站点
                wechatQrcodeTitle   : "", // 微信二维码提示文字
                wechatQrcodeHelper  : '扫一扫分享到微信',
            };
            $('.social-share').share($config);
        }

        // 收藏作品
        $scope.worksFavorite=function (event) {
            $scope.isCollect=$scope.isCollect? false:true;
        };

        //作品的粉丝页
        $scope.goFans=function(){
            util.go("fans");
        }

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