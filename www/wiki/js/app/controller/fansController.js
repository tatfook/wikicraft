/**
 * Created by wuxiangan on 2017/1/6.
 */

define(['app',
    'text!html/fans.html',
    'helper/util',
    'helper/storage',
], function (app, htmlContent, util, storage) {
    app.controller("fansController", ['$scope', function ($scope) {
        function init() {
            var params=storage.sessionStorageGetItem('pageinfo');
            util.http("POST", config.apiUrlPrefix + "user_favorite/getFansListByUserId", params, function (data) {
                $scope.totalItems = data.total;
                $scope.fansList = data.fansList || [];
                console.log($scope.fansList);
            });
        }
        $scope.$watch('$viewContentLoaded', init);
    }]);

    return htmlContent;
});

