/**
 * Created by wuxiangan on 2016/12/21.
 */

define([
	'app',
   	'helper/util',
   	'helper/storage',
   	'text!html/search.html'
], function (app, util, storage, htmlContent) {
    app.controller('searchController', ['$scope', 'Account','Message', function ($scope, Account, Message) {
        $scope.totalItems = 0;
        $scope.currentPage = 1;
        $scope.pageSize = 12;

		// 站点信息: siteinfo
		// 用户信息: userinfo
		// 页面信息: pageinfo
        var searchParams = {keyword:"", searchType:"siteinfo"};

        function getSiteList() {
			elasticSearch(searchParams.keyword, searchParams.searchType);
        }

		function elasticSearch(keyword, searchType) {
			searchType = searchType || "siteinfo";
			util.ajax({
				url:"http://221.0.111.131:19001/Application/kwaccurate_search",
				type:"GET",
				data:{
					querytype:"extra_search",
					keyword:searchType + ":*" + keyword + "*",
					fuzzymatch:1,
					page:$scope.currentPage,
					highlight:1,
					size:$scope.pageSize,	
				},
				success: function(result, status, xhr) {
					if (result.code != 200) {
						return;
					}
					var sitelist = [];
					$scope.totalItems = result.total;
					for (var i = 0; i < result.data.list.length; i++) {
						var obj = result.data.list[i];
						var site = angular.fromJson(obj.extra_data);
						sitelist.push(site);
					}
					$scope.searchResult = {results:sitelist};
					console.log($scope.searchResult);
					util.$apply($scope);
				},
				error: function(xhr, status, error){

				}
			});
			
		}

        function init() {
            console.log('init search controller');
            searchParams = util.getQueryObject() || searchParams;
            $scope.searchType = searchParams.searchType;
            $scope.searchText = searchParams.keyword;
            getSiteList();
        }

        $scope.sitePageChanged = function () {
            getSiteList();
            $("#"+searchParams.searchType).get(0).scrollIntoView();
        };

        $scope.changeSearch = function (searchType, searchText) {
            $scope.searchResult = {};
            searchParams.searchType = searchType;
            searchParams.keyword = searchText || $scope.searchText || "";
            elasticSearch(searchParams.keyword, searchParams.searchType);
            $scope.searchType = searchType;
            $scope.searchText = searchParams.keyword;

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
            //console.log(event, site);
            if (!Account.isAuthenticated()) {
                Message.info("登录后才能收藏!!!");
                return ;
            }

            if (site.userId == $scope.user._id) {
                Message.info("不能收藏自己作品!!!");
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
                    Message.info(isFavorite ? '作品已收藏' : '作品已取消收藏');
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
                $scope.concerned = !$scope.concerned;
                return;
            }

            if (!Account.isAuthenticated()) {
                Message.info("登录后才能关注");
                modal('controller/loginController', {
                    controller: 'loginController',
                    size: 'lg',
                    backdrop: true
                }, function (result) {
                    console.log(result);
                    // nowPage.replaceSelection(login.content);
                }, function (result) {
                    console.log(result);
                });
                return; // 登录后才能关注
            }

            if (!Account.isAuthenticated() || !$scope.user || $scope.user._id == fansUser._id) {
                Message.info("自己不关注自己");
                return; // 自己不关注自己
            }

            if(fansUser.concerned){//取消关注
                util.post(config.apiUrlPrefix + 'user_fans/unattent', {userId:fansUser._id, fansUserId:$scope.user._id}, function () {
                    console.log("取消关注成功");
                    Message.info("取消关注成功");
                    fansUser.concerned=false;
                });
            }else{
                util.post(config.apiUrlPrefix + 'user_fans/attent', {userId:fansUser._id, fansUserId:$scope.user._id}, function () {
                    console.log("关注成功");
                    Message.info("关注成功");
                    fansUser.concerned=true;
                });
            }
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
