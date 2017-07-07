/**
 * Created by wuxiangan on 2016/12/12.
 */
define([
    'app',
    'helper/util',
    'helper/storage',
    'text!wikimod/wiki/html/statics.html',
], function (app, util, storage, htmlContent) {

    function getModParams(wikiblock) {
        var modParams = wikiblock.modParams || storage.sessionStorageGetItem("wikiModParams") || {};
        return angular.copy(modParams);
    }

    function registerController(wikiBlock) {
        app.registerController("staticsController", ['$scope', '$rootScope', 'Account','Message', function ($scope, $rootScope, Account, Message) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            var modParams = getModParams(wikiBlock);
            var siteinfo = $rootScope.siteinfo;
            var userinfo = $rootScope.userinfo;
            var visitorInfo = undefined;
            $scope.modParams = modParams;

            function init() {
                if (wikiBlock.moduleKind == "personal") {
                    util.http("POST", config.apiUrlPrefix + "user/getStatics", {userId: $scope.userinfo._id}, function (data) {
                        $scope.statics = data || {};
                    });
                } else {
                    util.post(config.apiUrlPrefix + 'website/getStatics', {websiteId:siteinfo._id}, function (data) {
                        data = data || {};
                        $scope.modParams.userCount = data.userCount;
                        $scope.modParams.worksCount = data.worksCount;
                    });
                }
            }

            $scope.$watch("$viewContentLoaded", function () {
                if (userinfo && siteinfo) {
                    modParams.username = userinfo.username;
                    modParams.sitename = siteinfo.name;
                    init();
                } else {
                    if (!modParams.username ||  !modParams.sitename) {
                        var urlObj = util.parseUrl();
                        modParams.username = urlObj.username;
                        modParams.sitename = urlObj.sitename;
                    }
                    util.post(config.apiUrlPrefix + "website/getUserSiteInfo", {username:modParams.username, sitename:modParams.sitename}, function (data) {
                        userinfo = data.userinfo;
                        siteinfo = data.siteinfo;
                        userinfo && siteinfo && init();
                    });
                }
            });

            // 主题配置
            var theme="template-theme-"+$scope.modParams.theme;
            $scope.themeClass=new Object();
            $scope.themeClass[theme]=true;
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock)
            return htmlContent;
        }
    }
});

/*
```@wiki/js/statics
{
    "moduleKind":"personal"
}
```
*/

/*
```@wiki/js/statics
{
    "moduleKind":"organization",
    "recommendWorksCount":"0"
}
```
 ```@wiki/js/statics
 {
 "moduleKind":"game",
 "userCountText":"统计信息一",
 "userCount":"1",
 "worksCountText":"统计信息二",
 "worksCount":"2",
 "riseCountText":"统计信息三",
 "riseCount":"3"
 }
 ```
 ```@wiki/js/statics
 {
 "moduleKind":"haqiGame",
 "bgImg":"",
 "btns":[
 {
 "text":"新手入门",
 "link":"#",
 "btnClass":""
 },
 {
 "text":"游戏充值",
 "link":"#",
 "btnClass":""
 },
 {
 "text":"相关攻略",
 "link":"#",
 "btnClass":""
 },
 {
 "text":"精彩视频",
 "link":"#",
 "btnClass":""
 }
 ]
 }
 ```
*/
