/**
 * Created by 18730 on 2017/8/14.
 */
define(['app', 'helper/util', 'helper/storage', 'text!html/statics.html'], function (app, util, storage, htmlContent) {
    app.controller('staticsController', ['$scope', function ($scope) {
        function init() {
            // 获得网站统计信息
            util.http("POST", config.apiUrlPrefix + "wikicraft/getStatics", {}, function (data) {
                $scope.wikicraft = data || {};
            });

            util.http("POST", config.apiUrlPrefix + 'website/getSiteList', {page:1, pageSize:4, sortBy:'-favoriteCount'}, function (data) {
                $scope.siteObj = data;
            });

            util.http("POST", config.apiUrlPrefix + 'website/getSiteList', {page:1, pageSize:4, sortBy:'-favoriteCount'}, function (data) {
                $scope.personalSiteObj = data;
            });
        }

        $scope.$watch('$viewContentLoaded', init);
    }]);

    return htmlContent;
});