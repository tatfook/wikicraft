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
                var url = wikiBlock.modParams.videoUrl || "http://static.video.qq.com/TPout.swf?vid=l01276tvc8i";
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
```@wiki/js/video
{
    "videoUrl":"video url address"
}
```
*/
// sed -i 's/\[[^\|]\+\](\([^)]*\.swf[^)]*\))/```@wiki\/js\/video\n{\n\t"videoUrl":"\1"\n}\n```/g' filename