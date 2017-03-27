/**
 * Created by wuxiangan on 2016/12/12.
 */

define([
    'app', 
    'helper/util',
    'text!wikimod/wiki/html/organizationStatics.html',
], function (app, util, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("organizationStaticsController", ['$scope', function ($scope) {
            function init() {
                util.http("POST", config.apiUrlPrefix + "website/getStatics", {websiteId: $scope.siteinfo._id}, function (data) {
                    $scope.statics = data || [];
                });
            }

            init();
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
        }
    }
});