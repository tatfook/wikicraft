/**
 * Created by wuxiangan on 2017/4/11.
 */

define([
    'app',
    'wangEditor'
], function (app, wangEditor) {
    function registerController(wikiblock) {
        app.registerController('richTextController',['$rootScope','$scope', function ($rootScope, $scope) {
            var editor = undefined;
            var isDestroyEditor = false;
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            //console.log(wikiblock.modParams);
            $scope.modParams = angular.copy(wikiblock.modParams || {});
            $scope.isEditor = false;
            //console.log("init pageListController");

            function init() {

            }
            
            $scope.viewEditor = function () {
                //console.log(editor);
                $scope.isEditor = true;
                if (editor) {
                    if (isDestroyEditor) {
                        editor.undestroy();
                        isDestroyEditor = false;
                    }
                    return ;
                }
                editor = $(event.target).children()[0];
                editor = new wangEditor(editor);
                console.log(editor.config, wangEditor);
                editor.create();
                editor.$txt.on("blur", function () {
                    $scope.isEditor = false;
                    editor.destroy();
                    isDestroyEditor = true;
                });
            }

            $scope.$watch("$viewContentLoaded", init);
        }]);
    }
    return {
        render: function(wikiblock){
            registerController(wikiblock);
            return '<div ng-controller="richTextController" ng-click="viewEditor()" style="height: 130px; border: 1px solid"><div></div></div>';
        }
    };
});

/*
```@wiki/js/richText
```
*/