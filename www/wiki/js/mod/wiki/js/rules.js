
define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/rules.html',
], function (app, util, htmlContent) {

    // 使用闭包使模块重复独立使用
    function registerController(wikiblock) {
        // 比赛类头部控制器
        app.registerController("gameRulesController", ['$scope', function ($scope) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.modParams = angular.copy(wikiblock.modParams || {});

            function init() {
                // console.log("----------init game header---------");
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
```@wiki/js/rules
{
    "moduleKind":"game",
    "title":"大赛规则",
    "rules":[
    {
        "title":"参赛形式",
        "describe":"参赛作品需在paracraft平台创作以方块的形式搭建，题材不限。微电影、游戏类、参观类型均可。"
    },
     {
        "title":"温馨提示",
         "describe":"同一参赛选手可以同时报名多个作品，官方鼓励作品的原创与多样性，同时也鼓励改编和重构其他游戏。"
     },
     {
         "title":"报名方式",
         "describe":"请在报名页中填写有效的参赛信息，并上传作品到www.paracraft.cn."
     }
    ]
}
```
*/
