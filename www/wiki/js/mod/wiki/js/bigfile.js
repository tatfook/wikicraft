/**
 * Created by 18730 on 2017/9/29.
 */
define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/bigfile.html'
], function (app, util, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("bigFileController", ['$scope', '$sce', function ($scope, $sce) {
            function getFileType(fileType) {
                if (/image\/\w+/.test(fileType)){
                    return "image";
                }else if (/video\/\w+/.test(fileType)){
                    return "video";
                } else {
                    return;
                }
            }

            function typeUrl(type, url) {
                $scope.errMsg = "";
                if (!url){
                    $scope.errMsg = "内容找不到了";
                    return;
                }
                switch(type){
                    case "image":
                        $scope.imgUrl = $sce.trustAsResourceUrl(url);
                        break;
                    case "video":
                        $scope.videoUrl = $sce.trustAsResourceUrl(url);
                        break;
                    default:
                        $scope.linkUrl = $sce.trustAsResourceUrl(url);
                        break;
                }
            }

            function init() {
                var modParams = wikiBlock.modParams;
                $scope.modParams = modParams;
                if (modParams.channel == "qiniu") {
                    if (!modParams.fileId) {
                        // console.log("bigfile module params error!!!");
                        return;
                    }

                    var type = getFileType(modParams.fileType);

                    util.get(config.apiUrlPrefix + "bigfile/getDownloadUrlById", {
                        _id:modParams.fileId,
                    }, function(data){
                        if (data) {
                            typeUrl(type, data);
                        }else {
                            typeUrl();
                        }
                    }, function () {
                        typeUrl();
                    });
                }else if (modParams.fileUrl){
                    typeUrl(modParams.fileType, modParams.fileUrl);
                }
            }

            init();

			wikiBlock.init({
				scope:$scope,
			});

			$scope.onParamsChange = function() {
				init();
				util.$apply();
			}
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});
