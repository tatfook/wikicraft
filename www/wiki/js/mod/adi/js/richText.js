define([
    'app',
    'wangEditor',
    'helper/util',
    'helper/mdconf',
	'text!wikimod/adi/html/richText.html',
], function (app, wangEditor, util, mdconf, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("richController", ['$scope', '$uibModal', '$sce', function ($scope, $uibModal, $sce) {
            $scope.editorMode = wikiBlock.editorMode;
            
			wikiBlock.init({
                scope  : $scope,
				styles : [],
				params_template : {
                    modal_rich:{
                        is_leaf      : true,
						type         : "modal",
                        editable     : true,
						is_card_show : true,
						is_mod_hide  : false,
                        name         : "富文本",
                        button_name  : "打开富文本",
                        data         : "",
                    	require      : true,
                    },
                }
            });

            $scope.options = {
                "animation"      : true,
                "ariaLabeledBy"  : "title",
                "ariaDescribedBy": "body",
                "templateUrl"    : config.wikiModPath + 'adi/html/partial/richEditorModal.html',
                "controller"     : "richEditorController",
                "size"           : "full",
                "backdrop"       : "static",
                "keyboard"       : false,
                "resolve"        : {
                    "wikiBlock" : function(){
                        return wikiBlock;
                    }
                }
            }
            
            $scope.success = function(html){
                if(html == "<p><br></p>"){
                    html = "";
                }

                $scope.params.modal_rich.data = html;
                $scope.applyAttrChange();
            }

            $scope.error = function(msg){
                // console.log(msg);
            };

            $scope.dbClick = function(){
                config.services.selfDefinedModal($scope.options, $scope.success, $scope.error);
            }

            $scope.currentRichText = "__RICHTEXT__" + Date.now();

            $scope.applyContent = function(data){
                var richText = window.document.querySelector('#' + $scope.currentRichText);

                if(richText && data){
                    if(wikiBlock.editorMode){
                        if(data.match(/<iframe([\s\S]*)iframe>/)){
                            var content = data.match(/<iframe([\s\S]*)iframe>/)[1];
                            content  = '<iframe' + content + 'iframe>';
                            data = data.replace(content, '<div style="width:500px;height:500px;font-size:16px;line-height:500px;border:1px solid black;text-align:center">编辑模式下无法显示视频</div>');
                        }
                        
                        richText.innerHTML = data;
                    }else{
                        richText.innerHTML = data;
                    }
                }
            }
        }])
        
		app.registerController("richEditorController", ['$scope', '$uibModalInstance', 'wikiBlock', function ($scope, $uibModalInstance, wikiBlock) {
            $scope.init = function() {
                $scope.editor = new wangEditor('richEditor');

                $scope.editor.config.printLog = false;
                $scope.editor.create();

                if(typeof(wikiBlock.modParams.modal_rich.data) == "string"){
                    $scope.editor.$txt.html(wikiBlock.modParams.modal_rich.data);
                }
            }

            $scope.confirm = function () {
                $uibModalInstance.close($scope.editor.$txt.html());
            }
            
            $scope.close = function () {
                $uibModalInstance.dismiss("cancel");
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