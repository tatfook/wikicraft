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
						//sitelist.push({
							//username:obj.user_name,
							//sitename:obj.site_name,
						//});
					}
					$scope.searchResult = {results:sitelist};
					console.log($scope.searchResult);
					util.$apply($scope);
					//util.post(config.apiUrlPrefix + "website/getSiteListByName", {list:sitelist}, function(data){
						//$scope.siteObj = {siteList:data || []};
					//});
					
				},
				error: function(xhr, status, error){

				}
			});
			
		}

        function init() {
            console.log('init siteshow controller');
            searchParams = util.getQueryObject() || searchParams;
            getSiteList();
        }

        $scope.sitePageChanged = function () {
            getSiteList();
        };

        $scope.changeSearchType = function (searchType, event) {
            searchParams.searchType = searchType;
            elasticSearch(searchParams.keyword, searchParams.searchType);
            console.log(event.target);
            $(event.target).tab("show");
        };

        //打开用户页
        $scope.goUserSite = function (site) {
            util.goUserSite('/' + site.username + '/' + site.name + '/index');
        }

        $scope.goUserIndexPage=function(username){
            util.goUserSite('/'+username,true);
        }

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

        $scope.$watch('$viewContentLoaded', init);
    }]);

    return htmlContent;
});
