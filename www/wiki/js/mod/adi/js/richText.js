define([
    'app',
    'wangEditor',
    'helper/util',
    'helper/mdconf',
	'text!wikimod/adi/html/richText.html',
], function (app, wangEditor, util, mdconf, htmlContent) {

	function getStyleList() {
		return [];
	}

	function getEditorParams(modParams) {
		modParams = modParams || {};

		modParams.design = modParams.design || {};
		modParams.design.text = modParams.design.text || "style1";

		modParams.modal_rich = modParams.modal_rich || {};
		modParams.modal_rich.$data = {
			is_leaf      : true,
			type         : "modal",
			editable     : true,
			is_card_show : true,
			is_mod_hide  : false,
			name         : "富文本",
			button_name  : "打开富文本",
			data         : "",
			require      : true,
		}
		modParams.modal_rich.data = modParams.modal_rich.data || "";
		
		return modParams;
	}

    function render(wikiBlock) {
		var $scope = wikiBlock.$scope;
		var $sce = app.ng_objects.$sce;
		var $uibModal = app.ng_objects.$uibModal;

		$scope.params = wikiBlock.modParams = getEditorParams(wikiBlock.modParams);
		$scope.mode = wikiBlock.mode;
		
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
			$scope.params.modal_rich.data = html;
			wikiBlock.applyModParams(wikiBlock.modParams);
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
				if(wikiBlock.mode){
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

		return htmlContent;
	}
        
	app.registerController("richEditorController", ['$scope', '$uibModalInstance', 'wikiBlock', function ($scope, $uibModalInstance, wikiBlock) {
		$scope.init = function() {
			$scope.editor = new wangEditor('richEditor');
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

    return {
        render: render,
		getStyleList: getStyleList,
		getEditorParams, getEditorParams,
    }
});
