define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/img.html',
], function (app, util, htmlContent) {
	var initObj = {
		styles : [
			{
				"design": {
					"text":"style1",
					"cover": "/wiki/js/mod/adi/assets/images/imgOne.png"
				},
			},
			{
				"design": {
					"text":"style2",
					"cover": "/wiki/js/mod/adi/assets/images/imgTwo.png"
				},
			},
		],
		params_template : {
			design:{
				is_leaf      : true, 
				type         : "text",   
				editable     : false, 
				is_mod_hide  : false,  
				is_card_show : true,
				name         : "样式",   
				text         : "style1", 
				require      : true, 
			},
			media_img:{
				is_leaf      : true, 
				type         : "media",   
				mediaType    : "image",
				editable     : true, 
				is_mod_hide  : false,  
				is_card_show : true,
				name         : "图片",   
				text         : config.wikiModPath + 'adi/assets/imgs/imgTwo.png', 
				href         : "", 
				require      : true, 
				}
		}
	}

	function getEditorParams(modParams) {
		modParams = modParams || {};

		var params_template = initObj.params_template;
		for (var key in params_template) {
			if (key == "design") {
				modParams.design = modParams.design || {};
				modParams.design.text = modParams.design.text || params_template[key].text;
			} else {
				modParams[key] = modParams[key] || {};
				modParams[key]["$data"] = params_template[key];
				modParams[key]["text"] = modParams[key]["text"] || params_template[key]["text"];
			}
		}

		return modParams;
	}

	function getStyleList() {
		return initObj.styles;
	}

    function render(wikiblock) {
		var $scope = wikiblock.$scope;
		var $http = app.ng_objects.$http;
		var $sce = app.ng_objects.$sce;

		$scope.params = getEditorParams(wikiblock.modParams);
		$scope.mode = wikiblock.mode;
		$scope.setImgBackground = util.setImgBackground;           

		return htmlContent;
    }

    return {
        render: render,
		getEditorParams: getEditorParams,
		getStyleList: getStyleList,
    }
});

