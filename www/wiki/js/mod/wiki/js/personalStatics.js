/**
 * Created by wuxiangan on 2016/12/12.
 */
define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/personalStatics.html',
], function (app, util, htmlContent) {
    function registerController(wikiBlock) {
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
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock)
            return htmlContent;
        }
    }
});

/*
```@wiki/js/personalStatics
{
    "moduleKind":"statics1"
}
```*/

/*```@wiki/js/personalStatics
{
    "moduleKind":"statics2",
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
```*/
