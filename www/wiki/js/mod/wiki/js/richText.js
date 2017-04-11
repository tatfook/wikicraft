/**
 * Created by wuxiangan on 2017/4/11.
 */

define([
    'app',
    'wangEditor'
], function (app, wangEditor) {
    function registerController(wikiblock) {
        app.registerController('richTextController',['$rootScope','$scope', function ($rootScope, $scope) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            //console.log(wikiblock.modParams);
            $scope.modParams = angular.copy(wikiblock.modParams || {});

            //console.log("init pageListController");

            function init() {

            }
            
            $scope.viewEditor = function () {
                var editor = $(event.target).children()[0];
                editor = new wangEditor(editor);
                console.log(editor.config);
                editor.create();
            }
            
            $scope.$watch("$viewContentLoaded", init);
        }]);
    }
    return {
        render: function(wikiblock){
            registerController(wikiblock);
            return '<div ng-controller="richTextController" ng-click="viewEditor()" style="height: 30px; border: 1px solid"><div></div><div ng-bind-html="htmlContent"></div></div>';
        }
    };
});

/*
```@wiki/js/richText
```
*/