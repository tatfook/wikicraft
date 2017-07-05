/**
 * Created by big on 2017.4.23
 */

define([
    'app',
    'helper/util',
    'markdown-it',
    'text!wikimod/wiki/html/worldList.html'
], function (app, util, markdownit, htmlContent) {
    function registerController(wikiblock) {
        app.registerController('worldListController', ['$scope', function ($scope) {
            $scope.modParams = angular.copy(wikiblock.modParams || {});

            var userid = $scope.modParams.userid;
            var url    = "http://" + location.host + "/api/mod/worldshare/models/worlds"

            var params = {
                "userid": userid,
                "amount": 1000,
            }

            util.http("POST", url, params, function (response) {
                $scope.opusLists   = response;
                $scope.worldsTotal = $scope.opusLists.length;

                $($scope.opusLists).each(function () {
                    if (this.filesTotals <= 1048576) {
                        this.filesTotals = parseInt(this.filesTotals / 1024) + "KB";
                    } else {
                        this.filesTotals = parseInt(this.filesTotals / 1024 / 1024) + "M";
                    }

                    this.preview = JSON.parse(this.preview)[0].previewUrl + "?ver=" + this.revision;
                });
            }, function (response) { });
        }]);
    }
    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
        }
    };
})