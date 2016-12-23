/**
 * Created by wuxiangan on 2016/12/12.
 */

define(['app', 'util', 'config', 'storage'], function (app, util, config, storage) {
    app.registerController("organizationStaticsController", function ($scope, $auth, Account, Message) {
        $scope.htmlUrl = config.wikiModPath + 'statics/pages/organizationStatics.page';

        function init() {
            util.http("POST", config.apiUrlPrefix + "website/getStatics", {websiteId: $scope.siteinfo._id}, function (data) {
                $scope.statics = data || [];
            });
        }

        init();
    });
    
    return {
        render: function () {
            return '<div ng-controller="organizationStaticsController"><div ng-include="htmlUrl"></div></div>';
        }
    }
});