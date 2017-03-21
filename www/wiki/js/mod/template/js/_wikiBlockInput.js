/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'text!wikimod/template/html/_wikiBlockInput.html'
], function (app, util, htmlContent) {
    app.registerController('_wikiBlockInputController',['$scope', function ($scope) {
        $scope.no = function () {
            $scope.$dismiss();
        }
        $scope.yes = function () {
            $scope.$close($scope.content);
        }
    }]);

    return htmlContent;
});