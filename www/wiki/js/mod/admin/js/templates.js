/**
 * Created by 18730 on 2017/9/1.
 */
define([
    'app',
    'helper/util',
    'helper/storage',
    'text!wikimod/admin/html/templates.html',
], function (app, util, storage, htmlContent) {
    function getModParams(wikiblock) {
        var modParams = wikiblock.modParams || storage.sessionStorageGetItem("wikiModParams") || {};
        return angular.copy(modParams);
    }

    function registerController(wikiBlock) {
        app.registerController("templatesController", ["$scope","$uibModal", function ($scope, $uibModal) {
            $scope.modParams = getModParams(wikiBlock);
            $scope.activeCategories = $scope.modParams.categories ? $scope.modParams.categories[0] : {};
            $scope.newClassify = {
                "name": "",
                "classify":"",
                "templates":[]
            };
            $scope.newTemplate = {
                "name":"",
                "logoUrl":"",
                "previewUrl":"",
                "styles":[]
            };
            $scope.newStyle = {};
            $scope.newContent = {};
            // $scope.categories = $scope.modParams.categories || [];
            // $scope.templates = $scope.categories[0] ? $scope.categories[0].templates : {};
            function init() {
                console.log("init templates");
            }

            $scope.saveClassify = function () {
                $scope.modParams.categories = $scope.modParams.categories ? $scope.modParams.categories : [];
                $scope.modParams.categories.push($scope.newClassify);
                wikiBlock.applyModParams($scope.modParams);
            };

            $scope.selectCategory = function (category) {
                $scope.activeCategories = category;
            };

            $scope.addStyle = function () {
                $scope.newTemplate.styles.push($scope.newStyle);
                $scope.newStyle = {};
            };

            $scope.addContent = function () {
                $scope.newStyle.contents = $scope.newStyle.contents ? $scope.newStyle.contents : [];
                $scope.newStyle.contents.push($scope.newContent);
                $scope.newContent = {};
            };

            $scope.addTemplate = function () {
                $scope.activeCategories.templates.push($scope.newTemplate);
                wikiBlock.applyModParams($scope.modParams);
            };

            $scope.$watch("$viewContentLoaded", init);
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
        }
    };
});