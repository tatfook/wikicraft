define([
    'app',
    'helper/util',
	'text!wikimod/adi/html/pictureText.html',
], function (app, util, htmlContent) {

    function registerController(wikiblock) {
        app.registerController("pictureTextController", ['$scope','$sce', function ($scope, $sce) {

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
					pictureTextImg:{
                        is_leaf      : true,
						type         : "media",
						mediaType    : "image",
						editable     : true,
						is_card_show : true,
                        is_mod_hide  : false,
                        name         : "picture",
                        text         : config.wikiModPath + 'adi/assets/imgs/pictureMod.png',
                        href         : config.wikiModPath + 'adi/assets/imgs/pictureMod.png',
                    	require      : true,
					},
					hOne:{
						is_leaf      : true,
						type         : "link",
						editable     : true,
						is_card_show : true,
						is_mod_hide  : false,
						name         : "标题",
						text         : "一个人，一条路，人在途中",
						href         : "", 
						require      : true,
					},
					hTwo:{
						is_leaf      : true,
						type         : "link",
						editable     : true,
						is_card_show : true,
						is_mod_hide  : false,
						name         : "子标题",
						text         : "我们一直在旅行",
						href         : "",
						require      : true,
					},
					spanOne:{
						is_leaf      : true, 
						type         : "link",
						editable     : true,
						is_card_show : true,
            			is_mod_hide  : false,
						name         : "文字说明",
						text         : "",
						href         : "",
						require      : true,
					},
					btn:{
                        is_leaf      : true,
                        type         : "link",
                        editable     : true,
                        is_card_show : true,
                        is_mod_hide  : false,
                        name         : "按钮",
                        text         : "更多照片",
                        href         : "",
                    	require      : true,
					},
					spanOne:{
						is_leaf      : true,
						type         : "link",
						editable     : true,
						is_card_show : true,
						is_mod_hide  : false,
						name         : "文字说明",
						text         : "",
						href         : "",
						require      : true,
					},
					btn:{
                        is_leaf      : true,
                        type         : "link",
						editable     : true,
						is_card_show : true,
                        is_mod_hide  : false,
                        name         : "按钮", 
                        text         : "更多照片",
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