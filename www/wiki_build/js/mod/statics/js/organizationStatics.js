/**
 * Created by wuxiangan on 2016/12/12.
 */

define(['app', 'helper/util'], function (app, util) {
    function registerController(wikiBlock) {
        app.registerController("organizationStaticsController", function ($scope, $auth, Account, Message) {
            $scope.htmlUrl = config.wikiModPath + 'statics/pages/organizationStatics.page';

            function init() {
                util.http("POST", config.apiUrlPrefix + "website/getStatics", {websiteId: $scope.siteinfo._id}, function (data) {
                    $scope.statics = data || [];
                });
            }

            init();
        });
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return '<div ng-controller="organizationStaticsController"><div ng-include="htmlUrl"></div></div>';
        }
    }
});