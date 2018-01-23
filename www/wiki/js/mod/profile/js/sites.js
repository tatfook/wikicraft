/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: none
 * @Last Modified time: 2018-01-22 18:13:28
 */
define([
    'app', 
    'helper/util',
    'text!wikimod/profile/html/sites.html'
], function (app, util, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("sitesCtrl", ['$scope',function ($scope) {
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
                        title = "置顶内容";
                        break;
                    case "created":
                        title = "创建的网站";
                        break;
                    case "joined":
                        title = "参与的网站";
                        break;
                    case "concerned":
                        title = "关注的网站";
                        break;
                    default:
                        break;
                }
                return title;
            }
            
			$scope.sites = {
                "stick":[],
                "created":[],
                "joined":[]
            }

            var getStickSites = function(type){

            }
            
            var getCreatedSites = function(type){
                $scope.sites[type] = $scope.allSiteList;
            }

            var getJoinedSites = function(type){
                if($scope.sites[type].length > 0){
                    return;
                }
                util.post(config.apiUrlPrefix + "site_user/getSiteListByMemberName", {
                    memberName: "kaitlyn",
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
                $scope.sites[type] = $scope.followSiteList;
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