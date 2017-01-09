/**
 * Created by wuxiangan on 2016/12/12.
 */
define(['app', 'helper/util'], function (app, util) {
    function registerController(wikiBlock) {
        app.registerController("personalStaticsController", function ($scope, $auth, Account, Message) {

            $scope.htmlUrl = config.wikiModPath + 'statics/pages/personalStatics.page';

            function init() {
                util.http("POST", config.apiUrlPrefix + "user/getStatics", {userId: $scope.userinfo._id}, function (data) {
                    $scope.statics = data || [];
                });
            }

            init();
        });
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock)
            return '<div ng-controller="personalStaticsController"><div ng-include="htmlUrl"></div></div>';
        }
    }
});