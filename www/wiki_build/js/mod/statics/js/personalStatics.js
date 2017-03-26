/**
 * Created by wuxiangan on 2016/12/12.
 */
define([
    'app',
    'helper/util',
    'text!wikimod/statics/html/personalStatics.html',
], function (app, util, htmlContent) {

    function registerController(wikiBlock) {
        app.registerController("personalStaticsController", ['$scope','Account','Message', function ($scope, Account, Message) {
            $scope.imgsPath = config.wikiModPath + 'statics/assets/imgs/';
            function init() {
                util.http("POST", config.apiUrlPrefix + "user/getStatics", {userId: $scope.userinfo._id}, function (data) {
                    $scope.statics = data || {};
                });
            }

            $scope.$watch("$viewContentLoaded", init);
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock)
            return htmlContent;
        }
    }
});