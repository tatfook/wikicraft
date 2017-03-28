/**
 * Created by wuxiangan on 2017/1/6.
 */

define(['app',
    'text!html/fans.html',
    'helper/util',
], function (app, htmlContent, util) {
    app.registerController("fansController", ['$scope', function ($scope) {
        function init() {
            $scope.fansList=[1,2,3,4,5];
            var params = {
                userId: $scope.user._id,
                websiteId: 4 //需要修改
            };
            util.http("POST", config.apiUrlPrefix + "user_favorite/getFansListByUserId", params, function (data) {
                $scope.totalItems = data.total;
                $scope.fansList = data.fansList || [];
            });
        }
        init();
    }]);

    return htmlContent;
});

