define([
    'app',
    'wangEditor',
    'helper/util',
	'text!wikimod/adi/html/paratext.html',
    'pako',
    'helper/mdconf',
], function (app, wangEditor, util, htmlContent, pako, mdconf) {
    function registerController(wikiBlock) {
        app.registerController("paratextController", ['$scope', '$uibModal', '$sce', function ($scope, $uibModal, $sce) {
            $scope.editorMode = wikiBlock.editorMode;
            
			wikiBlock.init({
                scope  : $scope,
				styles : [],
				params_template : {
                    diagram_board:{
                        is_leaf      : true,
						type         : "modal",
                        editable     : true,
						is_card_show : true,
						is_mod_hide  : false,
                        name         : "富文本",
                        button_name  : "打开富文本",
                        svg          : "",
                        compress     : "",
                    	require      : true,
                    },
                }
            });

            $scope.options = {
                "animation"      : true,
                "ariaLabeledBy"  : "title",
                "ariaDescribedBy": "body",
                "templateUrl"    : config.wikiModPath + 'adi/html/richText.html',
                "controller"     : "paratextEditorController",
                "size"           : "full",
                // "openedClass"    : "mx-client-modal",
                "backdrop"       : "static",
                "keyboard"       : false,
                "resolve"        : {
                    "wikiBlock" : function(){
                        return wikiBlock;
                    }
                }
            }
            
            $scope.modalBody = $sce.trustAsHtml("<h1>点击编辑内容qwq</h1>")
            $scope.success = function(paratextEditor){
                // $scope.paratextEditor = paratextEditor;
                // $scope.$apply($scope.paratextEditor);
                console.log("测试效果")
                console.log(paratextEditor)
                console.log("测试效果")
                $scope.$apply();
            }
            // $scope.error   = function(){};
            // // console.log(boardEditor)
            // $scope.success = function(Editor){
            //     console.log(Editor)
            // }
            // console.log($scope.success)
		}])
		app.registerController("paratextEditorController", ['$scope', '$uibModalInstance', 'wikiBlock', function ($scope, $uibModalInstance, wikiBlock) {
            
            $scope.init = function() {
                wangEditor.config.printLog = false;
                $scope.editor = new wangEditor('richTextEditor');
                $scope.editor.create()

                $scope.editor.$txt.html(wikiBlock.modParams);
            }
            $scope.richText = function () {
                var paratextEditor = $scope.editor.$txt.html();
                $scope.paratextEditor = paratextEditor;
                $scope.$close($scope.paratextEditor);
                // console.log($scope.editor.$txt.html())
                // console.log(paratextEditor)
            }
            
            $scope.close = function () {
                console.log(777777777)
                $uibModalInstance.close($scope.boardEditor);
            }
          
            $scope.$watch('$viewContentLoaded', $scope.init);
            
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
		}
    }
    
});