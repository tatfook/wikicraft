
define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/header.html',
], function (app, util, htmlContent) {

    // 使用闭包使模块重复独立使用
    function registerController(wikiblock) {
        // 个人主页头部控制器
        app.registerController("headerController", ['$scope', '$translate', 'Account','Message', function ($scope, $translate, Account, Message) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.modParams = angular.copy(wikiblock.modParams || {});
            $scope.user = Account.getUser();

            function init() {
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
                    Message.info($translate.instant("关注成功"));
                    // console.log(data);  // 申请成功
                });
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
 "moduleKind":"personal2",
 "displayName":"姓名",
 "nameinfo":"职位",
 "name":"PingYin Or EnglishName",
 "bgUrl":"https://api.keepwork.com/git/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1504170502765.jpeg",
 "messages":[
 {
 "message":"信息1介绍介绍简介简介",
 "info":"额外信息PingYin Or EnglishName"
 },
 {
 "message":"信息2介绍介绍简介简介",
 "info":"额外信息PingYin Or EnglishName额外信息"
 },
 {
 "message":"信息3介绍介绍简介简介",
 "info":"额外信息PingYin Or EnglishName额外信息EnglishName"
 }
 ],
 "phone":"手机号",
 "email":"邮箱",
 "qq":"QQ号",
 "wechat":"微信号",
 "weibo":"新浪微博号"
 }
 ```
 */
/*
 ```@wiki/js/header
 {
 "moduleKind":"personal3",
 "headerBg":"https://api.keepwork.com/git/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1503653688101.jpeg",
 "profile":"http://keepwork.com/wiki/assets/imgs/wiki_default_profile.jpg",
 "displayName":"姓名",
 "nameinfo":"职位",
 "name":"PingYin Or EnglishName",
 "messages":[
 {
 "message":"信息1介绍介绍简介简介"
 },
 {
 "message":"信息2介绍介绍简介简介"
 },
 {
 "message":"信息3介绍介绍简介简介"
 }
 ],
 "qq":"qq号",
 "wechat":"微信号",
 "weibo":"微博账号"
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
/*
 ```@wiki/js/header
 {
 "moduleKind":"game2",
 "bgImg":"",
 "title":"PAC全国3D创作大赛",
 "subTitle":"———— 2017 * 夏季赛 ————",
 "message":"用ParaCraft创意空间制作电影作品参赛",
 "time":"2017年6月1日——2017年10月15日"
 }
 ```
 */
/*
 ```@wiki/js/header
 {
 "moduleKind":"haqiGame",
 "bgImg":"",
 "btnGroup1":[
 {
 "text":"下载游戏",
 "link":"#",
 "btnClass":""
 }
 ],
 "btnGroup2":[
 {
 "text":"注册账号",
 "link":"#",
 "btnClass":""
 }
 ]
 }
 ```
 */
