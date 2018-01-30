/**
 * Created by 18730 on 2017/8/29.
 */
define([
    'app',
    'helper/storage',
    'text!wikimod/wiki/html/layouts.html'
], function (app, storage, htmlContent) {
    function getModParams(wikiblock) {
        var modParams = wikiblock.modParams || storage.sessionStorageGetItem("wikiModParams") || {};
        return angular.copy(modParams);
    }

    function registerController(wikiblock) {
        app.registerController("layoutsController", ["$scope", function ($scope) {
            $scope.modParams = getModParams(wikiblock);
            function init() {
                // console.log("layoutsController");
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
 ```@wiki/js/layouts
 {
 "moduleKind":"leftImg",	"img":"http://git.keepwork.com/gitlab_rls_tibet/keepworkdatasource/raw/master/tibet_images/img_1504167340127.png",
 "title":"欢迎下载XXX软件",
 "detail":"XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍 XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍 XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍 XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍 ",
 "link":"#",
 "moreText":"了解更多>>",
 "info":"额外信息介绍啊",
 "infoLinks":[
 {
 "url":"#",
 "text":"这里是链接"
 }
 ]
 }
 ```
 */
/*
 ```@wiki/js/layouts
 {
 "moduleKind":"PCDownload",
 "imgUrl":"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1503996369093.png",
 "title":"Windows版",
 "titleInfo":"软件大小",
 "info":"额外信息，比如支持的版本等",
 "iconImg":"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1503996562536.png",
 "btnText":"下载",
 "rightTitle":"下面是一些其它下载链接：",
 "details":[
 {
 "text":"该下载具体信息介绍，该下载具体信息介绍，该下载具体信息介绍，该下载具体信息介绍",
 "info":"下载地址",
 "link":"#",
 "linkText":"这是下载链接1"
 },
 {
 "text":"该下载具体信息介绍，该下载具体信息介绍，该下载具体信息介绍，该下载具体信息介绍",
 "info":"下载地址",
 "link":"#",
 "linkText":"[这是下载链接2]"
 },
 {
 "text":"该下载具体信息介绍，该下载具体信息介绍，该下载具体信息介绍，该下载具体信息介绍",
 "info":"下载地址",
 "link":"#",
 "linkText":"*这是下载链接3*"
 }
 ]
 }
 ```
 */
/*
 ```@wiki/js/layouts
 {
 "moduleKind":"AndroidIOS",
 "device1":{
 "img":"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1504062266400.png",
 "title":"Android版",
 "link":"#",
 "info":"这里是android安装包的下载链接",
 "detail":"XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍 XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍 XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍 XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍。"
 },
 "device2":{
 "img":"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1504062280837.png",
 "title":"IOS版",
 "link":"#",
 "info":"这里是ios安装包的下载链接",
 "detail":"XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍 XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍 XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍 XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍。"
 }
 }
 ```
 */