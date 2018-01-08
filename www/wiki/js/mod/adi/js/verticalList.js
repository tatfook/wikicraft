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
						text         : '一个人去旅行，而且是去故乡的山水间徜徉。临行之前，面对太多的疑问和不\
						解：为何是一个人？也有善意的提醒：何不去远方！故乡的山水间徜徉。临行\
						之前，面对太多的疑问和不解：为何是一个人？也有善意的提醒：何不去远\
						方！一个人去旅行，而且是去故乡的山水间徜徉。临行之前，面对太多的疑问\
						和不解',
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
						text         : '一个人去旅行，而且是去故乡的山水间徜徉。临行之前，面对太多的疑问和不\
						解：为何是一个人？也有善意的提醒：何不去远方！故乡的山水间徜徉。临行\
						之前，面对太多的疑问和不解：为何是一个人？也有善意的提醒：何不去远\
						方！一个人去旅行，而且是去故乡的山水间徜徉。临行之前，面对太多的疑问\
						和不解',
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
						text         : '一个人去旅行，而且是去故乡的山水间徜徉。临行之前，面对太多的疑问和不\
						解：为何是一个人？也有善意的提醒：何不去远方！故乡的山水间徜徉。临行\
						之前，面对太多的疑问和不解：为何是一个人？也有善意的提醒：何不去远\
						方！一个人去旅行，而且是去故乡的山水间徜徉。临行之前，面对太多的疑问\
						和不解',
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