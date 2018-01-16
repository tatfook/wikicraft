define([
	'app',
    'helper/util',
	'text!wikimod/adi/html/paratext.html',
    'helper/mdconf',
], function (app, util, htmlContent, mdconf) {
    function registerController(wikiblock) {
        app.registerController("paratextController", ['$scope', '$uibModal', '$sce', function ($scope, $uibModal, $sce) {
			$scope.editorMode = wikiblock.editorMode;
			wikiblock.init({
                scope  : $scope,
				styles : [],
				params_template : {
                    paratext_desc:{
                        is_leaf      : true,
						type         : "paratext",
                        editable     : true,
						is_card_show : true,
						is_mod_hide  : false,
                        name         : "富文本",
                        svg          : "",
                        compressData : "",
                    	require      : true,
                    },
                }
			});
		}])
		app.registerController("paratextEditorController", ['$scope', '$uibModalInstance', 'wikiBlock', function ($scope, $uibModalInstance, wikiBlock) {
           
        }]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
		}
    }
    
});