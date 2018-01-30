/**
 * Created by wuxiangan on 2017/4/11.
 */

define([
    'app',
    'wangEditor',
    'helper/util',
    'text!wikimod/wiki/html/richText.html',
], function (app, wangEditor, util, htmlContent) {
    function registerController(wikiblock) {
        app.registerController('richTextController',['$scope','$uibModal', function ($scope, $uibModal) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            //console.log(wikiblock.modParams, !wikiblock.modParams);

            function init() {
                $scope.htmlContent = wikiblock.modParams || '<div>点击编辑内容^-^</div>';
                util.$apply();
                //console.log($scope.htmlContent);
            }
            
            $scope.viewEditor = function () {
                if (!wikiblock.isEditorEnable()) {
                    return;
                }
                $uibModal.open({
                    template: htmlContent,
                    size: 'full',
                    backdrop: 'static',
                    keyboard: false,
                    controller: ['$scope', function ($scope) {
                        function init() {
                            //console.log($('richTextEditor'));
                            wangEditor.config.printLog = false;
                            $scope.editor = new wangEditor('richTextEditor');
                            $scope.editor.create()
                            // 初始化编辑器的内容

                            $scope.editor.$txt.html(wikiblock.modParams);
                        }

                        $scope.OK = function () {
                            $scope.$close($scope.editor.$txt.html());
                            // console.log($scope.editor.$txt.html())
                        }

                        $scope.$watch('$viewContentLoaded', init);
                    }],
                }).result.then(function (result) {
                    wikiblock.applyModParams(result);
                    //$scope.htmlContent = result;
                }, function (result) {

                });
            }

            //$scope.$watch("$viewContentLoaded", init);
            init();
        }]);
    }
    return {
        render: function(wikiblock){
            registerController(wikiblock);
            return '<div ng-controller="richTextController" ng-click="viewEditor()" style="min-height: 10px"><div ng-bind-html="htmlContent"></div></div>';
        }
    };
});

/*
```@wiki/js/richText
```
*/