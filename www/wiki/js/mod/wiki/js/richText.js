/**
 * Created by wuxiangan on 2017/4/11.
 */

define([
    'app',
    'wangEditor',
    'helper/util',
], function (app, wangEditor, util) {
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
                $uibModal.open({
                    template: `<style>
                                    .modal-dialog.modal-full .wangEditor-container{
                                        display: flex;
                                        flex-direction: column;
                                    }
                                </style>
                                <div ng-controller="richTextController" style="height: 100%; display: flex;flex-direction: column;">
                                    <div class="modal-header">
                                        <button type="button" class="close" data-dismiss="modal" ng-click="$dismiss()">&times;</button>
                                        <h4 class="modal-title">富文本编辑器</h4>
                                    </div>
                                    <div class="modal-body" style="flex: 1;display: flex;">
                                        <div id="richTextEditor" style="border: 1px solid #CCC;width: 100%; flex: 1;"></div>
                                    </div>
                                    <div class="modal-footer">
                                        <!--<button class="btn"  data-dismiss="modal">取消</button>-->
                                        <button type="button" class="btn btn-default" data-dismiss="modal" ng-click="$dismiss()">取消</button>
                                        <!-- SUBMIT BUTTON -->
                                        <button type="button" class="btn btn-primary btn-fill" data-dismiss="modal" ng-click="OK()">确定</button>
                                    </div>
                                </div>`,
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