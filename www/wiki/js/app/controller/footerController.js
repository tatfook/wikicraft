/**
 * Created by wuxiangan on 2017/3/29.
 */

define([
    'app',
    'text!html/footer.html',
], function (app, htmlContent) {
    app.controller("footerController", ['$scope', function ($scope) {
        function init() {
            //console.log(config.bustVersion);
            $scope.serverUpdateTime =  config.bustVersion ? new Date(config.bustVersion) : new Date();
            $scope.serverUpdateTime = $scope.serverUpdateTime.toLocaleString();
        }
        $scope.$watch('$viewContentLoaded', init);
    }]);

    return htmlContent;
});

