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
                }

                if (wikiBlock.moduleKind == "organization") {
                    util.post(config.apiUrlPrefix + 'website/getStatics', {websiteId:siteinfo._id}, function (data) {
                        $scope.statics = data || {};
                        $scope.statics.recommendWorksCount = modParams.recommendWorksCount;
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
    "btns":[
        {
            "link":"#",
            "text":"我要参赛"
        },
         {
             "link":"#",
             "text":"教学视频"
         }
    ]
 }
```
```@wiki/js/statics
 {
 "moduleKind":"gameStatics",
 "btns":[
     {
         "link":"#",
         "text":"我要投稿"
     }
 ],
 "messages":[
    {
         "info":"参赛作者",
         "count":"20"
    },
     {
         "info":"参赛成员",
         "count":"20"
     }
 ]
 }
```
*/
