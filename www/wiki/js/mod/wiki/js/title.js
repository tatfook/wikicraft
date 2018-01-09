define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/title.html',
], function (app, util, htmlContent) {

    // 使用闭包使模块重复独立使用
    function registerController(wikiblock) {
        // 比赛类活动奖励控制器
        app.registerController("titleController", ['$scope','$sce', function ($scope, $sce) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.modParams = angular.copy(wikiblock.modParams || {});

            function init() {
                $scope.content = $sce.trustAsHtml(config.services.markdownit.render($scope.modParams.content || ""));
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
```@wiki/js/title
{
    "moduleKind":"title",
    "title":"大赛简介",
    "content":"比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍"
}
```
*/
/*
 ```@wiki/js/title
 {
 "moduleKind":"title2",
 "column":"大赛简介",
 "columnInfo":"大赛简介",
 "content":"比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍比赛介绍"
 }
 ```
 */
/*
 ```@wiki/js/title
 {
 "moduleKind":"title3",
 "title":"标题标题",
 "content":"简介简介  \n[可以加链接](链接url)  \n [可以加链接](链接Url)：（我不是链接）"
 }
 ```
 */
