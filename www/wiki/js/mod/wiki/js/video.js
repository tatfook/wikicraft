/**
 * Created by wuxiangan on 2017/4/24.
 */

define([
    'app',
    'text!wikimod/wiki/html/video.html',
], function (app, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("videoController", ['$scope', '$sce', function ($scope, $sce) {
            function init() {
                var url = "https://imgcache.qq.com/tencentvideo_v1/playerv3/TPout.swf?max_age=86400&v=20161117&vid=s0386xlr78b&auto=0";
                $scope.videoUrl = $sce.trustAsResourceUrl(url);
            }

            init();
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});

/*
```@/wiki
```
*/    