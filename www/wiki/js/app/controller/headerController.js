/**
 * Created by wuxiangan on 2016/12/20.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'helper/dataSource',
    'text!html/header.html',
    'jquery-sharejs'
], function (app, util, storage, dataSource,  htmlContent) {
    app.controller('headerController', ['$rootScope', '$scope', 'Account', 'Message', 'modal', function ($rootScope, $scope, Account, Message, modal) {
        //console.log("headerController");
        //$scope.isLogin = Account.isAuthenticated();
        const SearchRangeText = ["全部内容", "当前站点", "我的网站"];
        const FoldPostfix = "/";
        $scope.urlObj = {};
        $scope.isIconShow = !util.isOfficialPage();
        var pageDetail = util.parseUrl();
        $scope.isUserPage = (pageDetail.username && pageDetail.pathname.substring(1) == pageDetail.username);
        $scope.trendsType = "organization";
        $scope.isCollect=false;//是否已收藏当前作品
        $scope.searchRange = [];
        $scope.searchRange.push(SearchRangeText[0]);
        $scope.nowSearchRange = $scope.searchRange[0];

        // 通过站点名搜索
        $scope.goSearchPage = function () {
            //window.location.reload(false);
			var params = {
				searchType:"pageinfo",
				keyword:$scope.search || "",
			};
			switch ($scope.nowSearchRange){
                case SearchRangeText[1]:
                    params.sitename = $scope.urlObj.sitename;
                    break;
                case SearchRangeText[2]:
                    params.username = $scope.user.username;
                    break;
                default:
                    break;
            }
            util.go("search?" + util.getQueryString(params));
        };

        $scope.changeSearchRange = function (range) {
            $scope.nowSearchRange = range;
        };

        // 确定下拉框选择项
        function initSearchRange() {
            var urlObj = $scope.urlObj || util.parseUrl(),
                hasUserInfo = $scope.isLogin,
                hasSiteInfo = urlObj.sitename && (urlObj.username != "wiki");

            if (hasSiteInfo && $scope.searchRange.indexOf(SearchRangeText[1]) == -1){
                $scope.searchRange.push(SearchRangeText[1]);
            }
            if (hasUserInfo && $scope.searchRange.indexOf(SearchRangeText[2]) == -1){
                $scope.searchRange.push(SearchRangeText[2]);
            }
        }

        var initPageInfo = function(){
            var url = pageDetail.pathname;
            var visitor = $scope.user && $scope.user.username || "";
            util.get(config.apiUrlPrefix + "pages/getDetail", {
                url: url,
                visitor: visitor
            }, function(data){
                $scope.isCollect = data.starred;
                $scope.pageFansCount = data.starredCount;
            })
        }

        var initPagePath = function(){
            var pathUrl = pageDetail.pagepath;
            $scope.urlItemList = pathUrl.split("/");
        }

        function init() {
            $scope.isJoin = (window.location.pathname == "/wiki/join") ? true : false;
            $scope.isSearch = (window.location.pathname == "/wiki/search") ? true : false;
            $scope.userSiteList = [{name: 'home'}, {name: 'login'}, {name: 'userCenter'},{name:'wikieditor'}];
            var urlObj = util.parseUrl();

            if (!config.islocalWinEnv()) {
                $scope.urlObj.username = urlObj.username;
                $scope.urlObj.sitename = urlObj.sitename;
                $scope.urlObj.pagename = urlObj.sitename && urlObj.pagename;
                //console.log(urlObj);
                if (urlObj.domain && !config.isOfficialDomain(urlObj.domain)) {
                    //console.log(urlObj.domain);
                    util.post(config.apiUrlPrefix + 'website_domain/getByDomain', {domain: urlObj.domain}, function (data) {
                        //console.log(data);
                        if (data) {
                            //$scope.urlObj.pagename = $scope.urlObj.sitename;
                            $scope.urlObj.username = data.username;
                            $scope.urlObj.sitename = data.sitename;
                        }
                    });
                }
            }
            // 获取用户粉丝数量
            if (Account.isAuthenticated()) {
                $scope.userFansCount = storage.sessionStorageGetItem("userFansCount");
                if ($scope.userFansCount == undefined || $scope.userFansCount== null) {
                    util.post(config.apiUrlPrefix + 'user_fans/getCountByUserId', {userId:$scope.user._id}, function (data) {
                        data = data || 0;
                        $scope.userFansCount = data;
                        storage.sessionStorageSetItem("userFansCount", data);
                    });
                }
            }

            initSearchRange();

            initPageInfo();

            initPagePath();
            // var container=document.getElementById("js-prev-container");
            // container.style.overflow="visible";
        }

		$scope.$watch('$viewContentLoaded', function() {
			Account.getUser(function(userinfo){
				$scope.user = userinfo;
				init();
			}, init);
		});

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
            }, undefined, false);
        }

        $scope.clickPageList = function (index) {
            if ($scope.urlObj.username == "wiki")
                return;
            
            var userDataSource = dataSource.getUserDataSource($scope.urlObj.username)
            var currentDataSource = userDataSource && userDataSource.getDataSourceBySitename($rootScope.siteinfo.name);
            if (!currentDataSource) {
                // console.log(userDataSource,$rootScope.siteinfo._id );
                return;
            }
            $scope.userSitePageList = [];
            var selectPath = $scope.urlItemList.slice(0, index);
            var path = selectPath.join("/");
            var pagesObj = {};
            currentDataSource.getTree({
                path:path, 
                recursive: true,
                isShowLoading: true
            }, function (data) {
                var pageIndex = 0;
                var conflictPages = [];
                $scope.userSitePageList = data.filter(function(page){
                    if (new RegExp("^(.gitignore|_header|_footer|_sidebar|_theme)$").test(page.pagename)) {
                        return false;
                    }

                    var pageUrlArr = page.url.split("/");
                    var pageUrlLen = pageUrlArr.length;

                    if (pageUrlLen >= (index + 2)) { //文件夹
                        page.foldname = pageUrlArr[index] + " " + FoldPostfix; // 从url获取文件夹名
                        page.foldpath = pageUrlArr.splice(0, pageUrlLen-1).join("/");
                        page.isFold = true;
                    }

                    if (pagesObj[page.foldname] && pagesObj[page.foldname].isFold) { // 文件夹已记录过
                        switch (page.pagename) {
                            case "index":
                                conflictPages.push({
                                    index: pagesObj[page.foldname].index,
                                    pageDetail: page
                                });
                                break;
                        }
                        return false;
                    }
                    
                    page.index = pageIndex ++;
                    pagesObj[page.foldname || page.pagename] = page;
                    return true;
                });
                
                conflictPages.forEach(function(conflictPage){
                    $scope.userSitePageList[conflictPage.index] = conflictPage.pageDetail;
                });
            });
        }

        $scope.selectPage = function (page) {
            window.location.href = page.url;
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
        
        $scope.goUserPage = function () {
            util.goUserSite('/' + $scope.urlObj.username);
        }

        //=======================================================
        $scope.clickMyHistory = function () {
            if (!Account.isAuthenticated())
                return;

            // 用户收藏
            util.post(config.apiUrlPrefix + 'user_visit_history/get', {username: $scope.user.username}, function (data) {
                $scope.visitHistoryList = data.visitList;
            });
        }

        $scope.clickMyFavorite = function () {
            if (!Account.isAuthenticated())
                return;
            util.post(config.apiUrlPrefix + "user_favorite/getByUserId", {userId: $scope.user._id}, function (data) {
                //console.log(data);
                $scope.favoriteWebsiteObj = data;
            });
        }
        // 用户动态=======================================start=========================================
        $scope.clickMyTrends = function () {
            if (!Account.isAuthenticated())
                return;

            // 用户动态
            util.post(config.apiUrlPrefix + 'user_trends/get', {userId: $scope.user._id}, function (data) {
                data = data || {};
                $scope.trendsList = data.trendsList;
                $scope.trendsCount = data.total;
            });
        }
        $scope.isShowTrend = function (trends) {
            if ($scope.trendsType == "organization") {
                if (trends.trendsType =20 || trends.trendsType ==21) {
                    return true;
                }
                return false;
            } else if ($scope.trendsType == "attent") {
                if (trends.trendsType ==10 || trends.trendsType == 11) {
                    return true;
                }
                return false;
            } else if ($scope.trendsType == "works") {
                if (trends.trendsType == 1 || trends.trendsType == 2 || trends.trendsType == 3 || trends.trendsType == 4 || trends.trendsType == 5) {
                    return true;
                }
                return false;
            }
        }
        // 选择动态类型
        $scope.selectTrendsType = function (trendsType) {
            $scope.trendsType = trendsType;
        }
        // 用户动态=======================================end=========================================

        // 页面编辑页面
        $scope.goWikiEditorPage = function () {
            storage.sessionStorageSetItem("urlObj", util.parseUrl());
            // console.log(storage.sessionStorageGetItem("urlObj"));
            util.go("wikieditor");
        }

        // 用户主页
        $scope.goUserIndexPage = function (username) {
            util.goUserSite('/' + username);
        }

        $scope.goLoginPage = function () {
            // util.go("login");
            if (!config.isOfficialDomain() || (window.location.pathname != "/wiki/join" && window.location.pathname != "/wiki/login" && window.location.pathname != "/wiki/home" && window.location.pathname != "/")) {
                modal('controller/loginController', {
                    controller: 'loginController',
                    size: 'lg',
                    backdrop: true
                }, function (result) {
                    // console.log(result);
                    // nowPage.replaceSelection(login.content);
                }, function (result) {
                    // console.log(result);
                });
            } else {
                util.go("home");
            }
        };

        $scope.goRegisterPage = function () {
            util.go("join");
        };

        $scope.goHomePage = function (isFeature) {
            storage.sessionStorageSetItem("isFeature", isFeature);
            util.go("home");
        };

        $scope.goModPackagePage = function () {
            util.go("mod/packages",true);
        };

        $scope.goVIPLevel = function () {
            util.go("VipLevel");
        };

        $scope.goVipPay = function () {
            util.go("vip");
        };

		$scope.goAdminPage = function() {
			util.go("/wiki/js/mod/admin/js/login", true);
		};

		$scope.goApps = function () {
            util.go("apps");
        };

		$scope.isAdmin = function() {
			if (Account.isAuthenticated() && $scope.user && $scope.user.roleId) {
				if ($scope.user.roleId == 8  || $scope.user.roleId == 10) {
					return true;
				}
			}

			return false;
		};

        $scope.goUserCenterPage = function (contentType, subContentType) {
            // console.log(contentType, subContentType);
            if (util.snakeToHump(window.location.pathname) == '/wiki/userCenter') {
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
			// console.log(window.location.pathname);
			if (/^\/wiki/.test(window.location.pathname)){
				util.go('home');
			}
			//util.post(config.apiUrlPrefix + 'user/logout', {}, function(){
				//Account.logout();
				//$rootScope.isLogin = false;
				//console.log(window.location.pathname);
				//if (/^\/wiki/.test(window.location.pathname)){
					//util.go('home');
				//}
			//});
        };
        
        $scope.clickShare=function () {
            if ($scope.user){
                $scope.tit = $scope.user.displayName;
            }else{
                $scope.tit = "未知用户";
            }
            $scope.tit += '分享给你'+$scope.urlObj.username+"制作的"+$scope.urlObj.sitename+"网站";
            var description="我将"+$scope.urlObj.username+"在KEEPWORK.COM制作的网站分享给你";
            var img=$scope.imgsPath+"icon/logo.png";
            var $config = {
                url                 : window.location.href, // 网址，默认使用 window.location.href
                description         : description, // 描述, 默认读取head标签：<meta name="description" content="PHP弱类型的实现原理分析" />
                sites               : ['qq', 'qzone', 'weibo', 'wechat'], // 启用的站点（weibo qq wechat tencent douban qzone linkedin diandian facebook twitter google）
                disabled            : [], // 禁用的站点
                wechatQrcodeTitle   : "", // 微信二维码提示文字
                wechatQrcodeHelper  : '扫描二维码打开网页'
            };
            $('.social-share').share($config);
        }

        // 收藏作品
        $scope.doWorksFavorite=function (event,doCollect) {
            if (!Account.isAuthenticated()) {
                Message.info("登录后才能关注");
                modal('controller/loginController', {
                    controller: 'loginController',
                    size: 'lg',
                    backdrop: true
                }, function (result) {
                    console.log(result);
                    $scope.doWorksFavorite(event, doCollect);
                    // nowPage.replaceSelection(login.content);
                }, function (result) {
                    console.log(result);
                });
                return; // 登录后才能关注
            }
            var worksFavoriteRequest = function(isFavorite) {
                console.log(pageDetail);
                util.post(config.apiUrlPrefix + "pages/star", {
                    url: pageDetail.pathname,
                    visitor: $scope.user.username
                }, function(data){
                    $scope.isCollect = data.starred;
                    $scope.pageFansCount = data.starredCount;
                }, function(err){
                    console.log(err);
                });
            };

            if (doCollect){
                worksFavoriteRequest(true);
                $scope.isCollect=true;
            }else{
                worksFavoriteRequest(false);
                $scope.isCollect=false;
            }
        };

        //作品的粉丝页
        $scope.goFans=function(){
            util.go("fans");
        }

        $scope.$on("onUserProfile", function (event, user) {
            //console.log('onUserProfile');
            $scope.user = user;
            $rootScope.isLogin = Account.isAuthenticated();
            init();
        });

        $scope.$on("userpageLoaded", function (event, data) {
            init();
            // var container=document.getElementById("js-prev-container");
            // var content=document.getElementById("js-prev-content");
            // var ellipsis=document.getElementById("js-prev-ellipsis");
            // prevEllipsis(container,content,ellipsis);
        });

        $scope.$watch(Account.isAuthenticated, function (bAuthenticated) {
            $rootScope.isLogin = Account.isAuthenticated();
            //console.log("isAuthenticated");
        });

        //导航条面包屑超出宽度，省略前面部分，显示后面部分
        function prevEllipsis(container,content,ellipsis){
            var containerW=container.clientWidth;
            var contentW=content.clientWidth;
            var minus=containerW-contentW;
            if(minus<0){
                content.style.transform="translateX("+minus+"px)";
                ellipsis.style.display="inline";
            }
            container.style.overflow="visible";
        }

        $(document).keyup(function (event) {
            if(event.keyCode=="13" && ($("#searchbar").is(":focus") || $("#searchbar-nologin").is(":focus"))){
                $scope.goSearchPage();
            }
        });
    }]);

    return htmlContent;
});
