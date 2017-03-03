/**
 * Created by wuxiangan on 2017/2/28.
 */

define(['app'], function (app) {
    app.directive('scopeElement', function () {
        return {
            restrict: "A",
            replace: false,
            link: function ($scope, elem, attrs) {
                if (!$scope.scopeElements) {
                    $scope.scopeElements = {};
                }
                $scope.scopeElements[attrs.scopeElement] = elem[0];
            }
        };
    });
});