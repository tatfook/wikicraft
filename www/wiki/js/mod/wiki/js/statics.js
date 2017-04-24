/**
 * Created by wuxiangan on 2016/12/12.
 */
define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/statics.html',
], function (app, util, htmlContent) {
    function registerController(wikiBlock) {
        // 个人信息统计
        app.registerController("personalStaticsController", ['$scope','Account','Message', function ($scope, Account, Message) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.modParams = angular.copy(wikiBlock.modParams || {});
            function init() {
                util.http("POST", config.apiUrlPrefix + "user/getStatics", {userId: $scope.userinfo._id}, function (data) {
                    $scope.statics = data || {};
                });
            }

            $scope.$watch("$viewContentLoaded", init);
        }]);
        // 组织信息统计
        app.registerController("organizationStaticsController", ['$scope','Account','Message', function ($scope, Account, Message) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.modParams = angular.copy(wikiBlock.modParams || {});
            function init() {
            }

            $scope.$watch("$viewContentLoaded", init);
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
    "methods":[
        {
            "name":"组织管理",
            "link":"http://keepwork.com"
        },
        {
            "name":"作品管理",
            "link":"http://keepwork.com"
        },
        {
            "name":"提交作品",
            "link":"http://keepwork.com"
        },
        {
            "name":"申请加入",
            "link":"http://keepwork.com"
        }
    ]
}
```
*/
