/**
 * Created by 18730 on 2017/9/29.
 */
define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/bigfile.html',
], function (app, util, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("bigFileController", ['$scope', '$sce', function ($scope, $sce) {
            function getFileType(fileType) {
                if (/image\/\w+/.test(fileType)){
                    return "image";
                }else {
                    return;
                }
            }

            function init() {
                var modParams = wikiBlock.modParams;
                $scope.modParams = modParams;
                if (modParams.channel == "qiniu") {
                    if (!modParams.fileId) {
                        console.log("bigfile module params error!!!");
                        return;
                    }

                    var type = getFileType(modParams.fileType);

                    util.get(config.apiUrlPrefix + "bigfile/getDownloadUrlById", {
                        _id:modParams.fileId,
                    }, function(data){
                        if (data) {
                            switch(type){
                                case "image":
                                    $scope.imgUrl = $sce.trustAsResourceUrl(data);
                                    break;
                                default:
                                    $scope.linkUrl = $sce.trustAsResourceUrl(data);
                                    break;
                            }
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