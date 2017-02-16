/**
 * Created by wuxiangan on 2017/2/15.
 */

define(['app'], function (app) {
    var jiathis_config = {};
    app.controller('shareController', function ($scope, $uibModal, $http, $location, $rootScope, $timeout) {
        var request = $location.search();
        var host = $location.host();

        if (host == "localhost") {
            $uibModal.open({
                template: "<div style='width: 435px;height: 150px;margin: 0 auto;text-align: center;font-size: 25px;line-height: 150px;font-weight: 400;'>使用本地服务器分享的页面将不可用</div>",
                size: 'md'
            }).result.then(function (params) {

            }, function (text, error) {

            });
        }

        if (request.type == "person" && request.userid) {
            $scope.shareUrl = "http://" + $location.host() + ":8099/wiki/mod/worldshare/person/#?userid=" + request.userid;
        } else if (request.type == "opus" && request.opusId) {
            $scope.shareUrl = "http://" + $location.host() + ":8099/wiki/mod/worldshare/opus/#?opusId=" + request.opusId;
        } else {
            history.go(-1);
            return;
        }

        $scope.shareUrlencode = encodeURIComponent($scope.shareUrl);

        $scope.isCopy = false;

        $scope.copy = function () {
            $scope.isCopy = true;

            $timeout(function () {
                $scope.isCopy = false;
            }, 3000);
        }
        /*
        jQuery(document).ready(function ($) {
            $("body").on("copy", ".zclip", function (e) {
                e.clipboardData.clearData();
                e.clipboardData.setData("text/plain", $(".share-url").val());
                e.preventDefault();
            });
        });
        */

        jiathis_config.url = $scope.shareUrl;
        jiathis_config.summary = request.summary ? request.summary : "NO SUMMARY";
        jiathis_config.title = request.title ? request.title : "TITLE";
        jiathis_config.shortUrl = false;
        jiathis_config.hideMore = true;

        $("body").append('<script type="text/javascript" src="http://v3.jiathis.com/code/jia.js" charset="utf-8"></script>');
    });
})