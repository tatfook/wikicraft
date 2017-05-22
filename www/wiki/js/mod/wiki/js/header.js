
define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/header.html',
], function (app, util, htmlContent) {

    // 使用闭包使模块重复独立使用
    function registerController(wikiblock) {
        // 个人主页头部控制器
        app.registerController("personalHeaderController", ['$scope','Account','Message', function ($scope, Account, Message) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.modParams = angular.copy(wikiblock.modParams || {});
            $scope.user = Account.getUser();

            function init() {
                console.log("----------init personal header---------");
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

            $scope.$watch("$viewContentLoaded", init);
        }]);

        // 组织主页头部控制器
        app.registerController("organizationHeaderController", ['$scope','Account','Message', function ($scope, Account, Message) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.modParams = angular.copy(wikiblock.modParams || {});
            $scope.user = Account.getUser();


            function init() {
                console.log("----------init organization header---------");
            }

            $scope.$watch("$viewContentLoaded", init);
        }]);

        // 比赛类头部控制器
        app.registerController("gameHeaderController", ['$scope', function ($scope) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.modParams = angular.copy(wikiblock.modParams || {});

            function init() {
                console.log("----------init game header---------");
            }

            $scope.$watch("$viewContentLoaded", init);
        }]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
        }
    }
});

/*
```@wiki/js/header
{
    "moduleKind":"personal"
}
```
*/

/*
```@wiki/js/header
{
    "moduleKind":"organization",
    "displayBgImg":"http://keepwork.com/wiki/js/mod/wiki/assets/imgs/blog_header_banner.jpg",
    "displayName":"ParaCraft小组",
    "location":"深圳",
    "info":"成立于2017.4.19",
    "introduce":"这里是一段描述介绍小组的文字，内容自定义。介绍自己的小组成员或者是邀请新成员加入小组等等。"
}
```
*/
/*
```@wiki/js/header
{
    "moduleKind":"game",
    "bgImg":"",
    "title":"",
    "stages":[
        {
            "name":"投稿期",
            "time":"5月1日-5月30日"
        },
        {
            "name":"评选期",
            "time":"5月1日-5月30日"
        },
        {
            "name":"公布结果",
            "time":"5月1日-5月30日"
        }
    ]
}
```
*/
