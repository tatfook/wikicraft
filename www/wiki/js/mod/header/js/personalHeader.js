
define(['app', 'helper/util'], function (app, util) {
    function registerController(wikiBlock) {
        app.registerController("personalHeaderController", function ($scope, $auth, Account, Message) {
            //console.log($scope);
            $scope.htmlUrl = config.wikiModPath + 'header/pages/personalHeader.page';
            // 显示全部作品
            $scope.showWorksList = function() {
                $('#worksListNavId').toggle();
            }
            
            // 去网站管理页
            $scope.goWebsiteMangerPage = function() {
                window.location.href= config.frontEndRouteUrl + '#/website';
            }
            // 页面编辑页面
            $scope.goWebsitePageManagerPage = function() {
                if (config.localEnv) {
                    window.location.href = config.frontEndRouteUrl + '#/wikiEditor';
                } else {
                    window.location.href = "/wiki/wikiEditor";
                }
            }

            // 去站点
            $scope.goWebsitePage = function (websiteName) {
                util.goUserSite('/' + websiteName);
            }

            $scope.attention = function () {
                if (!Account.isAuthenticated()) {
                    // todo tipinfo
                    Message.info("请登录");
                    return;
                }
                // 自己不能关注自己
                if ($scope.user._id == $scope.userinfo._id) {
                    return ;
                }

                // 发送关注请求
                var params = {
                    favoriteUserId:$scope.userinfo._id,
                    favoriteWebsiteId: $scope.siteinfo._id,
                    userId:$scope.user._id,
                };

                util.http("POST", config.apiUrlPrefix + "user_favorite/favoriteUser", params, function (data) {
                    Message.info("关注成功");
                    console.log(data);  // 申请成功
                });
            }

            function init() {
                // 获得站点列表
                console.log(config.apiUrlPrefix);
                wikiBlock.http("POST", config.apiUrlPrefix + "website",{userId:$scope.userinfo._id}, function (data) {
                    $scope.websiteList = data.data || [];
                });
            }

            init();
        });
    }

    return {
        render: function (mdwiki) {
            mdwiki.viewEdit = false; // 关闭视图编辑功能
            registerController(mdwiki);
            return '<div ng-controller="personalHeaderController"><div ng-include="htmlUrl"></div></div>';
        }
    }
});
