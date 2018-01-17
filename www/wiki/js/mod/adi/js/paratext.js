define([
    'app',
    'wangEditor',
    'helper/util',
	'text!wikimod/adi/html/paratext.html',
    'helper/mdconf',
], function (app, wangEditor, util, htmlContent, mdconf) {
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
            

            $scope.error   = function(){};

            $scope.success = function(boardEditor){
                var compressData = boardEditor.getCurrentCompressData();
                var mxData       = boardEditor.editor.getGraphXml();
            }

		}])
		app.registerController("paratextEditorController", ['$scope', '$uibModalInstance', 'wikiBlock', function ($scope, $uibModalInstance, wikiBlock) {
            console.log(111111)
            function init() {
                wangEditor.config.printLog = false;
                $scope.editor = new wangEditor('richTextEditor');
                $scope.editor.create()

                $scope.editor.$txt.html(wikiBlock.modParams);
            }
            console.log(22222)
            $scope.richText = function () {
                console.log(6666666666)
                // $scope.$close($scope.editor.$txt.html());
            }
            console.log(3333333)
            $scope.close = function () {
                console.log(777777777)
                // $uibModalInstance.close($scope.boardEditor);
            }
            console.log(444444444)
            $scope.$watch('$viewContentLoaded', init);
            console.log(555555555)
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
		}
    }
    
});