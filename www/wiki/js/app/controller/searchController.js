/**
 * Created by wuxiangan on 2016/12/21.
 */

define([
	'app',
   	'helper/util',
   	'helper/storage',
   	'text!html/search.html'
], function (app, util, storage, htmlContent) {
    app.controller('searchController', ['$scope', '$location', '$sce', '$translate', 'Account','Message', 'modal', function ($scope, $location, $sce, $translate, Account, Message, modal) {
        const tagSplitRegexp = /\[([^\]]+)\]/;
        const SearchRangeText = ["全部内容", "当前站点", "我的网站"];
        $scope.totalItems = 0;
        $scope.currentPage = 1;
        $scope.pageSize = 12;
        $scope.searchRange = [];
        $scope.searchRange.push(SearchRangeText[0]);
        $scope.nowSearchRange = $scope.searchRange[0];

		// 站点信息: siteinfo
		// 用户信息: userinfo
		// 页面信息: pageinfo
        var searchParams = {
			keyword:"",             // 搜索关键词
			searchType:"pageinfo",  // 搜索类型
			isTagSearch:false,      // 是否为tag搜索
			username:undefined,     // 限定用户名搜索
			sitename:undefined,     // 限定站点名搜索
		};

        function getSiteList() {
			elasticSearch(searchParams);
        }

        var doSearch = function(params) {
            util.get(config.apiUrlPrefix + params.queryPath, params, function(result) {
                $scope.searchResult = result;
                $scope.totalItems = result.total;
            }, function(err) {
            });
        }

		function elasticSearch(query) {
			query.keyword = query.keyword || "";
			var searchType = query.searchType || "pageinfo";
			var page = query.currentPage || $scope.currentPage;
            var size = query.pageSize || $scope.pageSize;
            var username = query.username || undefined;

            var queryParams = {
                "q": query.keyword,
                "page": page,
                "size": size,
                "username": username
            };

            switch (searchType) {
                case "pageinfo":
                    queryParams.queryPath = "pages/search";
                    break;
                case "userinfo":
                    queryParams.queryPath = "user/search";
                    queryParams.visitor = $scope.user && $scope.user.username;
                    break;
                case "siteinfo":
                    queryParams.queryPath = "website/search";
                    break;
                default:
                    break;
            }

            doSearch(queryParams);
		}

        // 确定下拉框选择项
        function initSearchRange() {
            var hasUserInfo = $scope.user;

            if (hasUserInfo && $scope.searchRange.indexOf(SearchRangeText[2]) == -1){
                $scope.searchRange.push(SearchRangeText[2]);
            }
        }

        function init() {
            // console.log('init search controller');
            searchParams = util.getQueryObject() || searchParams;
            $scope.searchType = searchParams.searchType || "pageinfo";
            $scope.searchText = searchParams.keyword;
            $scope.nowSearchRange = searchParams.username ? SearchRangeText[2] : undefined;
            getSiteList();
            initSearchRange();
        }

        $scope.changeSearchRange = function (range) {
            $scope.nowSearchRange = range;
        };

        $scope.sitePageChanged = function () {
            getSiteList();
            $("#"+searchParams.searchType).get(0).scrollIntoView();
        };

        $scope.changeSearch = function (searchType, searchText) {
            $scope.searchResult = {};
            $scope.totalItems = 0;

            searchParams.searchType = searchType;
            searchParams.keyword = searchText || $scope.searchText || "";

            switch ($scope.nowSearchRange){
                case SearchRangeText[2]:
                    searchParams.username = $scope.user.username;
                    break;
                default:
                    searchParams.username = "";
                    break;
            }

            elasticSearch(searchParams);
            $scope.searchType = searchType;
            $scope.searchText = searchParams.keyword;
        };

        $scope.seachTag = function (tag) {
            searchParams = {
                keyword: tag,
                searchType: "siteinfo",
                isTagSearch: true,
                username: undefined,
                sitename: undefined,
            };
            // util.go("/wiki/search?keyword="+tag+"&isTagSearch=true&searchType=siteinfo");
            // $location.search(searchParams);
            elasticSearch(searchParams);
        };

        //打开用户页
        $scope.goUserSite = function (site) {
            util.goUserSite('/' + site.username + '/' + site.name + '/index');
        };

        $scope.goUserIndexPage=function(username){
            util.goUserSite('/'+username,true);
        };

        // 收藏作品
        $scope.worksFavorite=function (event, site) {
            if (!Account.isAuthenticated()) {
                Message.info($translate.instant("登录后才能收藏!!!"));
                return ;
            }

            if (site.userId == $scope.user._id) {
                Message.info($translate.instant("不能收藏自己作品!!!"));
                return ;
            }

            var worksFavoriteRequest = function(isFavorite) {
                var params = {
                    userId: $scope.user._id,
                    favoriteUserId: site.userId,
                    favoriteWebsiteId: site._id,
                }

                var url = config.apiUrlPrefix + 'user_favorite/' + (isFavorite ? 'favoriteSite' : 'unfavoriteSite');
                util.post(url, params, function () {
                    Message.info(isFavorite ? $translate.instant('作品已收藏') : $translate.instant('作品已取消收藏'));
                });
            };

            var obj=event.target;
            var loveIcon=$(obj);
            if (obj.outerHTML.indexOf('<span') > 0) {
                loveIcon=$(obj).find(".js-heart");
            }
            if (loveIcon.hasClass("glyphicon-star-empty")) {
                loveIcon.addClass("glyphicon-star");
                loveIcon.removeClass("glyphicon-star-empty");
                worksFavoriteRequest(true);
                site.favoriteCount++;
            }else{
                loveIcon.addClass("glyphicon-star-empty");
                loveIcon.removeClass("glyphicon-star");
                worksFavoriteRequest(false);
                site.favoriteCount--;
            }
        };

        // 关注用户
        $scope.favoriteUser = function (fansUser) {
            if (!fansUser) {
                $scope.following  = !$scope.following ;
                return;
            }

            if (!Account.isAuthenticated()) {
                Message.info($translate.instant("登录后才能关注"));
                modal('controller/loginController', {
                    controller: 'loginController',
                    size: 'lg',
                    backdrop: true
                }, function (result) {
                }, function (result) {
                });
                return; // 登录后才能关注
            }
            if (!Account.isAuthenticated() || !$scope.user || $scope.user.username == fansUser.username) {
                Message.danger($translate.instant("自己不关注自己"));
                return; // 自己不关注自己
            }

            if(fansUser.following){//取消关注
                util.post(config.apiUrlPrefix + 'user_fans/unattent', {username:fansUser.username, fansUsername:$scope.user.username}, function () {
                    Message.info($translate.instant("取消关注成功"));
                    fansUser.following =false;
                });
            }else{
                util.post(config.apiUrlPrefix + 'user_fans/attent', {username:fansUser.username, fansUsername:$scope.user.username}, function () {
                    Message.info($translate.instant("关注成功"));
                    fansUser.following =true;
                });
            }
        }

        $scope.isTagSearched = function(tag, highlightTags) {
            return (highlightTags.indexOf("<span>" + tag + "</span>") < 0) ? false : true;
        }

        $scope.$watch('$viewContentLoaded', init);

        $(document).keyup(function (event) {
            if(event.keyCode=="13" && ($("#searchpage-search").is(":focus"))){
                $scope.changeSearch($scope.searchType, $scope.searchText);
            }
        });
    }]);

    return htmlContent;
});
