/**
 * Created by wuxiangan on 2017/4/24.
 */

define([
    'app',
	'helper/util',
    'text!wikimod/wiki/html/video.html',
], function (app, util, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("videoController", ['$scope', '$sce', function ($scope, $sce) {
            function init() {
				var modParams = wikiBlock.modParams;
                var url = wikiBlock.modParams.videoUrl;
				if (url) {
					$scope.videoUrl = $sce.trustAsResourceUrl(url);
				} else if (modParams.channel == "qiniu") {
					if (!modParams.domain || !modParams.key) {
						return;
					}

					util.post(config.apiUrlPrefix + "qiniu/getDownloadUrl", {
						domain:modParams.domain,
						key:modParams.key,
					}, function(data){
						if (data && data.download_url) {
							$scope.videoUrl = $sce.trustAsResourceUrl(data.download_url);
						}
					});
				}
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
