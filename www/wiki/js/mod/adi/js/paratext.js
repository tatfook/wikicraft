define([
	'app',
	'markdown-it',
    'helper/util',
	'text!wikimod/adi/html/paratext.html',
], function (app, markdown_it, util, htmlContent) {

    function registerController(wikiblock) {
        app.registerController("paratextController", ['$scope','$sce', function ($scope, $sce) {

			$scope.editorMode = wikiblock.editorMode;

            initObj = {
				scope  : $scope,
				styles : [
					{
						"design": {
                            "text":"style1",
						},
                    },
				],
				params_template: {
					design:{
						is_leaf      : true,
						type         : "text",
						editable     : false,
						is_card_show : true,
						is_mod_hide  : false,
						name         : "样式",
						text         : "style1",
						require      : true,
					},
					multiText_desc:{
						is_leaf      : true,
						type         : "multiText",
						editable     : true,
						is_card_show : true,
						is_mod_hide  : false,
						name         : "文字说明",
						text         : "123",
						href         : "",
						require      : true,
					},
				}
			}

			
			wikiblock.init(initObj);

			var md = new markdown_it({
				html: true,
				langPrefix: 'code-'
			})
			
			$scope.$watch('params', function(){
				$scope.multiText_desc_md = md.render($scope.params.multiText_desc.text);
			})

        }]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
		}
    }
    
});