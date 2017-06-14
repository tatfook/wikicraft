/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/resumeHeader.html'
], function (app, util, htmlContent) {
    function registerController(wikiblock) {
        app.registerController('resumeHeaderController',['$scope', function ($scope) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.modParams = angular.copy(wikiblock.modParams || {});
        }]);
    }
    return {
        render: function(wikiblock){
            registerController(wikiblock);
            return htmlContent;
        }
    };
})

/*
```@wiki/js/resumeHeader
{
    "backgroundImage":"",
    "portrait":"",
    "username":"逍遥",
    "baseInfo":"'男 本科 3年工作经验 深圳",
    "company":"xxx",
    "cellphone":"187027*****",
    "email":"765485868@qq.com",
    "introduce":"我是一个边学习边分享的人。关于读书、关于影视剧、关于足球， 所学，所思，所感，所闻，分享一切有趣的、有用的。"
}
```
*/