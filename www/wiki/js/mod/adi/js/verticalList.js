define([
    'app',
    'helper/util',
	'text!wikimod/adi/html/verticalList.html',
], function (app, util, htmlContent) {

    function registerController(wikiblock) {
        app.registerController("verticalListController", ['$scope','$sce', function ($scope, $sce) {
			//竖排 list mod

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
					image_imgOne: {
						is_leaf      : true,
						type         : "media",
						mediaType    : "image",
						editable     : true,
						is_card_show : true,
                        is_mod_hide  : false,
                        name         : "图一",
                        text         : config.wikiModPath + 'adi/assets/imgs/verticalList2.png',
                        href         : '',
                    	require      : true,
					},
					image_imgTwo: {
						is_leaf      : true,
						type         : "media",
						mediaType    : "image",
						editable     : true,
						is_card_show : true,
                        is_mod_hide  : false,
                        name         : "图二",
                        text         : config.wikiModPath + 'adi/assets/imgs/verticalList1.png',
                        href         : '',
                    	require      : true,
					},
					image_imgThree: {
						is_leaf      : true,
						type         : "media",
						mediaType    : "image",
						editable     : true,
						is_card_show : true,
                        is_mod_hide  : false,
                        name         : "图三",
                        text         : config.wikiModPath + 'adi/assets/imgs/verticalList3.png',
                        href         : '',
                    	require      : true,
					},
					multiText_decOne: {
						is_leaf      : true,
						type         : "multiText",
						editable     : true,
						is_card_show : true,
						is_mod_hide  : false,
						name         : "文字说明",
						text         : '',
						href         : "",
						require      : true,
					},
					multiText_decTwo: {
						is_leaf      : true,
						type         : "multiText",
						editable     : true,
						is_card_show : true,
						is_mod_hide  : false,
						name         : "文字说明",
						text         : '',
						href         : "",
						require      : true,
					},
					multiText_decThree: {
						is_leaf      : true,
						type         : "multiText",
						editable     : true,
						is_card_show : true,
						is_mod_hide  : false,
						name         : "文字说明",
						text         : '',
						href         : "",
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