/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/blogHeader.html'
], function (app, util, htmlContent) {
    function registerController(wikiblock) {
        app.registerController('blogHeaderController',['$scope', function ($scope) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.modParams = angular.copy(wikiblock.modParams || {});

            var username = $scope.urlObj.username;
            if (config.islocalWinEnv()) {
                username = "kasdff";
            }

            function init() {
                util.post(config.apiUrlPrefix + 'user/getDetailByName', {username:username}, function (data) {
                    if (!data) {
                        return ;
                    }
                    // 用户信息
                    $scope.userinfo = data.userinfo;
                });
            }
            $scope.$watch('$viewContentLoaded', init);

            // 主题配置
            var theme="template-theme-"+$scope.modParams.theme;
            $scope.themeClass=new Object();
            $scope.themeClass[theme]=true;
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
```@wiki/js/blogHeader
{
    "introduce":"我是一个边学习边分享的人。关于读书、关于影视剧、关于足球， 所学，所思，所感，所闻，分享一切有趣的、有用的。"
}
```
*/