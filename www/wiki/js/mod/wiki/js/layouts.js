/**
 * Created by 18730 on 2017/8/29.
 */
define([
    'app',
    'helper/storage',
    'text!wikimod/wiki/html/layouts.html'
], function (app, storage, htmlContent) {
    function getModParams(wikiblock) {
        var modParams = wikiblock.modParams || storage.sessionStorageGetItem("wikiModParams") || {};
        return angular.copy(modParams);
    }

    function registerController(wikiblock) {
        app.registerController("layoutsController", ["$scope", function ($scope) {
            $scope.modParams = getModParams(wikiblock);
            function init() {
                console.log("layoutsController");
            }
            $scope.$watch("$viewContentLoaded", init);
        }]);
    }
    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
        }
    }
});