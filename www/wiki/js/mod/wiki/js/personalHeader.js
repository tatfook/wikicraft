
define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/personalHeader.html',
], function (app, util, htmlContent) {

    // 使用闭包使模块重复独立使用
    function registerController(wikiblock) {
        app.registerController("personalHeaderController", ['$scope','Account','Message', function ($scope, Account, Message) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.modParams = angular.copy(wikiblock.modParams || {});
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
                console.log("----------init personal header---------");
            }

            $scope.$watch("$viewContentLoaded", init);
        }]);
    }

    return {
        render: function (wikiblock) {
            wikiblock.viewEdit = false; // 关闭视图编辑功能
            registerController(wikiblock);
            return htmlContent;
        }
    }
});

/*```@wiki/js/personalHeader
{
    "moduleKind":"header1"
}
```*/
/*```@wiki/js/personalHeader
{
    "moduleKind":"header2",
    "displayBgImg":"http://keepwork.com/wiki/js/mod/wiki/assets/imgs/blog_header_banner.jpg",
    "displayName":"ParaCraft小组",
    "location":"深圳",
    "info":"成立于2017.4.19",
    "introduce":"这里是一段描述介绍小组的文字，内容自定义。介绍自己的小组成员或者是邀请新成员加入小组等等。"
}
```*/
