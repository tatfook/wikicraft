/**
 * Created by wuxiangan on 2017/3/29.
 */

define([
    'app',
    'text!html/footer.html',
], function (app, htmlContent) {
    app.controller("footerController", ['$scope', function ($scope) {
        function init() {
            $scope.serverUpdateTime =  config.wikiConfig.serverUpdateTime;
        }
        $scope.$watch('$viewContentLoaded', init);
    }]);

    return htmlContent;
});

