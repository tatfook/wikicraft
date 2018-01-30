
define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/rewards.html',
], function (app, util, htmlContent) {

    // 使用闭包使模块重复独立使用
    function registerController(wikiblock) {
        // 比赛类活动奖励控制器
        app.registerController("rewardsController", ['$scope', function ($scope) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.modParams = angular.copy(wikiblock.modParams || {});

            function init() {
                // console.log("----------init game rewards---------");
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
```@wiki/js/rewards
{
    "moduleKind":"game",
    "title":"活动奖励",
    "rewards":[
    {
        "title":"一等奖",
        "num":"（1名）",
        "describe":"1888元现金奖励+获奖证书",
        "imgUrl":""
    },
     {
         "title":"二等奖",
         "num":"（1名）",
         "describe":"1888元现金奖励+获奖证书",
         "imgUrl":""
     },
     {
         "title":"三等奖",
         "num":"（1名）",
         "describe":"1888元现金奖励+获奖证书",
         "imgUrl":""
     },
     {
         "title":"优秀奖",
         "num":"（1名）",
         "describe":"1888元现金奖励+获奖证书",
         "imgUrl":""
     }
    ]
}
```
*/
