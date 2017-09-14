/**
 * Created by wuxiangan on 2017/4/24.
 */

define([
    'app',
    'text!wikimod/wiki/html/iframe.html',
], function (app, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("iframeController", ['$scope', '$sce', "$auth", function ($scope, $sce, $auth) {
            function init() {
				var iframeUrl = wikiBlock.modParams.iframeUrl;
				var iframeId = wikiBlock.modParams.iframeId;

				//if (!iframeId || !iframeUrl) {
					//return;
				//}

				if ($auth.isAuthenticated()) {
					var token = $auth.getToken();
					//token = encodeURIComponent(token);
					if (iframeUrl.indexOf("?") > 0) {
						iframeUrl = iframeUrl + "&token=" + token;
					} else {
						iframeUrl = iframeUrl + "?token=" + token;
					}
				}
				$scope.iframeUrl = $sce.trustAsResourceUrl(iframeUrl);
				//$scope.iframeUrl = iframeUrl;
                $scope.iframeId = iframeId;
            }

			$scope.$watch($auth.isAuthenticated, function() {
				init();
			})

			$scope.$watch("$viewContentLoaded", init);
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});

//```
//{
	//"iframeId":"iframeId",
	//"iframeUrl":"http://keepwork.com"
//}
//```
