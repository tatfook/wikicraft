/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: none
 * @Last Modified time: 2018-02-28 18:09:26
 */
define([
    'app', 
    'helper/util',
    'text!wikimod/profile/html/sites.html'
], function (app, util, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("sitesCtrl", ['$scope', '$translate', function ($scope, $translate) {
            wikiBlock.init({
				scope:$scope,
				params_template:{
                    is_leaf: true,
                    require: true,
					type:"created"
				}
            });

            $scope.getModTitle = function(type){
                var title = "";
                switch (type) {
                    case "stick":
                        title = $translate.instant("置顶内容");
                        break;
                    case "created":
                        title = $translate.instant("创建的网站");
                        break;
                    case "joined":
                        title = $translate.instant("参与的网站");
                        break;
                    case "concerned":
                        title = $translate.instant("关注的网页");
                        break;
                    default:
                        break;
                }
                return title;
            }
            
			$scope.sites = {
                "stick":[],
                "created":[],
                "joined":[],
                "concerned": []
            }

            $scope.toggleStickSite = function(site){
                util.post(config.apiUrlPrefix + "website/setTop", {
                    sitename: site.name,
                    username: site.username
                }, function(data){
                    site.isTop = data.isTop;
                }, function(err){
                    console.log(err);
                });
            }

            var getStickSites = function(type){
                $scope.sites[type] = $scope.allSiteList;
            }
            
            var getCreatedSites = function(type){
                $scope.sites[type] = $scope.allSiteList;
            }

            var getJoinedSites = function(type){
                if($scope.sites[type].length > 0){
                    return;
                }
                util.post(config.apiUrlPrefix + "site_user/getSiteListByMemberName", {
                    memberName: $scope.userinfo.username,
                }, function(data){
                    data = data || [];
                    for (var i = data.length - 1; i>=0; i--){
                        if (data[i].siteinfo){
                            $scope.sites[type].push(data[i].siteinfo);
                        }
                    }
                }, function (err) {
                    console.log(err);
                });
            }

            var getConcernedSites = function(type){
                $scope.starredPages.map(function(pageUrl, index) {
                    var visitor = ($scope.user && $scope.user.username) || "";
                    util.get(config.apiUrlPrefix + 'pages/getDetail', {
                        url: pageUrl,
                        visitor: visitor
                    }, function(data){
                        if (!data) {
                            return;
                        }
                        $scope.sites[type].push(data);
                    }, function(err){
                        console.log(err);
                    });
                });
            }

            var initSites = function(type){
                switch (type) {
                    case "stick":
                        getStickSites(type);
                        break;
                    case "created":
                        getCreatedSites(type);
                        break;
                    case "joined":
                        getJoinedSites(type);
                        break;
                    case "concerned":
                        getConcernedSites(type);
                        break
                    default:
                        break;
                }
            }

            initSites($scope.params.type);
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});