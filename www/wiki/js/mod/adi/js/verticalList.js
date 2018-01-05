define([
    'app',
    'helper/util',
	'text!wikimod/adi/html/verticalList.html',
], function (app, util, htmlContent) {

    function registerController(wikiblock) {
        app.registerController("verticalListController", ['$scope','$sce', function ($scope, $sce) {

			$scope.editorMode = wikiblock.editorMode;

            initObj = {
				scope  : $scope,
				styles : [
					{
						"design": {
							"text":"style1",
						},
					},
					{
						"design": {
							"text":"style2",
						},
					},
				],
				params_template: {
					design:{
						is_leaf      : true,
						type         : "text",
						editable     : false,
						is_card_show : false,
						is_mod_hide  : true,
						name         : "样式",
						text         : "style1",
						require      : true,
					},
				}
			}

			
            wikiblock.init(initObj);
        }]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
		}
    }
});