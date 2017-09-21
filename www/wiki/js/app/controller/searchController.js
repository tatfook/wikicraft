/**
 * Created by wuxiangan on 2016/12/21.
 */

define([
	'app',
   	'helper/util',
   	'helper/storage',
   	'text!html/search.html'
], function (app, util, storage, htmlContent) {
    app.controller('searchController', ['$scope', '$location', '$sce', 'Account','Message', 'modal', function ($scope, $location, $sce, Account, Message, modal) {
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

		function elasticSearch(query) {
			query.keyword = query.keyword || "";
			var searchType = query.searchType || "pageinfo";
			var page = query.currentPage || $scope.currentPage;
			var size = query.pageSize || $scope.pageSize;
			var keyword = {
				bool:{
					should:[
					{
						wildcard:{
							"url.keyword":"*" + query.keyword + "*",
						}
					}
					]
				}
			};
			var should = keyword.bool.should;
			
			if (query.keyword && searchType == "pageinfo") {
				should.push({
					match:{
						"extra_search":query.keyword,
					}
				});
			} else {
				if (query.isTagSearch && query.keyword) {
					should.push({
						wildcard:{
							"tags.keyword":"*[" + (query.keyword || "") + "]*",
						}
					});
				} else {
					should.push({
						wildcard:{
							"extra_search.keyword":"*" + (query.keyword || "") + "*",
						}
					});
				}
			}

			var host = window.location.host;
			if (config.isLocal()) {
				host = "dev.keepwork.com";
			}

			var data = {
				from: (page-1) * size,
				size: size,
				query:{
					bool:{
						must:[
							keyword,
							{
								wildcard:{
									"access_url.keyword":"*"+host+"*",
								}
							},
						]
					}
				},
				highlight:{
					pre_tags:[
						"<span>"
					],
					post_tags:[
						"</span>"
					],
					fields:{
						extra_search:{},
						//"extra_search.keyword":{},
					}
				}
			}

			var must = data.query.bool.must;
			if (query.username) {
				must.push({
					term:{
						"user_name.keyword":query.username,
					}
				});
			}

			if (query.sitename) {
				must.push({
					term:{
						"site_name.keyword":query.username,
					}
				});
			}

			var username = undefined;
			if (Account.isAuthenticated()) {
				username = $scope.user.username;
			}

			if (username && (searchType == "siteinfo" || searchType == "pageinfo")) {
				must.push({
					bool:{
						should:[
						{
							term:{
								"extra_type.keyword":searchType + ":[]",
							}
						},
						{
							wildcard:{
								"extra_type.keyword":searchType + ":*["+ username +	"]*",
							}
						}
						]
					}
				})
			} else {
				must.push({
					term:{
						"extra_type.keyword":searchType + (searchType == "userinfo" ? "" : ":[]")
					}
				});
			}

			util.ajax({
				url:"http://221.0.111.131:19001/Application/kwcustom_search",
				type:"GET",
				data:{
					keyword:angular.toJson(data),
				},
				success: function(result, status, xhr) {
					if (result.code != 200) {
						return;
					}
					var searchList = [];
					$scope.totalItems = result.total;
					for (var i = 0; i < result.data.list.length; i++) {
						var obj = result.data.list[i];
						var site = angular.fromJson(obj.extra_data);
						site.highlight_ext = obj.highlight_ext;
						site.tagsArr = obj.tags ? obj.tags.split(tagSplitRegexp) : [];
						searchList.push(site);
					}
					$scope.searchList = searchList;
					console.log($scope.searchList);
					util.$apply($scope);
				},
				error: function(xhr, status, error){

				}
			});

		}

		function elasticSearch_old(query) {
			var searchType = query.searchType || "pageinfo";
			var fuzzymatch = 0;
			var data = {
				extra_type:searchType,
				page: query.currentPage || $scope.currentPage,
				size: query.pageSize || $scope.pageSize,
			}

			if (searchType == "pageinfo") {
				fuzzymatch = 1;
			}
		
			data.user_name = query.username;
			data.site_name = query.sitename;
			data.fuzzymatch = fuzzymatch;
			
			query.keyword = query.keyword || "";	
			if (query.isTagSearch) {
				data.tags = "*[" + query.keyword + "]*";
			} else {
			    if (fuzzymatch == 0){
                    data.extra_search = "*" + query.keyword + "*";
                } else {
                    data.extra_search = query.keyword || undefined;
                }
			}

			util.ajax({
				url:"http://221.0.111.131:19001/Application/kwbool_search",
				type:"GET",
				data:data,
				success: function(result, status, xhr) {
					if (result.code != 200) {
						return;
					}
					var searchList = [];
					$scope.totalItems = result.total;
					for (var i = 0; i < result.data.list.length; i++) {
						var obj = result.data.list[i];
						var site = angular.fromJson(obj.extra_data);
						site.highlight_ext = obj.highlight_ext;
						site.tagsArr = obj.tags ? obj.tags.split(tagSplitRegexp) : [];
						searchList.push(site);
					}
					$scope.searchList = searchList;
					console.log($scope.searchList);
					util.$apply($scope);
				},
				error: function(xhr, status, error){

				}
			});
		}

        // 确定下拉框选择项
        function initSearchRange() {
            var hasUserInfo = $scope.user;

            if (hasUserInfo && $scope.searchRange.indexOf(SearchRangeText[2]) == -1){
                $scope.searchRange.push(SearchRangeText[2]);
            }
        }

        function init() {
            console.log('init search controller');
            searchParams = util.getQueryObject() || searchParams;
            $scope.searchType = searchParams.searchType || "pageinfo";
            $scope.searchText = searchParams.keyword;
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
            $scope.searchList = [];
            $scope.totalItems = 0;

            searchParams.searchType = searchType;
            searchParams.keyword = searchText || $scope.searchText || "";

            switch ($scope.nowSearchRange){
                case SearchRangeText[2]:
                    searchParams.username = $scope.user.username;
                    break;
                default:
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
                console.log(fansUser);
                console.log($scope.user);
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
