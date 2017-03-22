
define([
    'app',
    'helper/util',
    'text!wikimod/header/html/personalHeader.html',
], function (app, util, htmlContent) {

    // 使用闭包使模块重复独立使用
    function registerController(wikiBlock) {
        app.registerController("personalHeaderController", ['$scope','Account','Message', function ($scope, Account, Message) {
            $scope.imgsPath = config.wikiModPath + 'header/assets/imgs/';
            $scope.user = Account.getUser();

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
                util.goUserSite('/' + $scope.user.username + '/' + websiteName);
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
                wikiBlock.http("POST", config.apiUrlPrefix + "website",{userId:$scope.userinfo._id}, function (data) {
                    $scope.websiteList = data.data || [];
                });
            }

            $scope.$watch("$viewContentLoaded", init);
        }]);
    }

    return {
        render: function (mdwiki) {
            mdwiki.viewEdit = false; // 关闭视图编辑功能
            registerController(mdwiki);
            return htmlContent;
        }
    }
});
