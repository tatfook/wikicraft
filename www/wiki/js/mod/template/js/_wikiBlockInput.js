/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/storage',
    'text!wikimod/template/html/_wikiBlockInput.html'
], function (app, storage, htmlContent) {
    app.registerController('_wikiBlockInputController',['$scope', function ($scope) {
        function init() {
            var params = storage.sessionStorageGetItem("_wikiBlockInputParam") || {content:""};
            //console.log(params);
            $scope.content = params.content;
        }

        $scope.$watch("$viewContentLoaded", init);

        $scope.no = function () {
            $scope.$dismiss();
        }

        $scope.yes = function () {
            $scope.$close($scope.content);
        }
    }]);

    return htmlContent;
});