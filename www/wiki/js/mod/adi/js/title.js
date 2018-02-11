
define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/title.html',
], function (app, util, htmlContent) {

	function getEditorParams(modParams) {
		modParams = modParams || {};

		modParams.design = modParams.design || {};
		modParams.design.text = modParams.design.text || "style1";
		//modParams.design.$data = {
			//is_leaf      : true, 
			//type         : "text",   
			//editable     : false, 
			//is_mod_hide  : false,  
			//is_card_show : true,
			//name         : "样式",   
			//text         : "style1", 
			//require      : true, 
		//};

		modParams.media_img = modParams.media_img || {};
		modParams.media_img.text = modParams.media_img.text ||(config.wikiModPath + 'adi/assets/imgs/titleMod.png')
		modParams.media_img.$data = {
			is_leaf      : true, 
			type         : "media",   
			mediaType    : "image",
			editable     : true, 
			is_mod_hide  : false,  
			is_card_show : true,
			name         : "logo",   
			require      : true, 
		}

		modParams.link_title = modParams.link_title || {};
		modParams.link_title.text = modParams.link_title.text || "YOUR HEAD LINE";
		modParams.link_title.href = modParams.link_title.href || "";
		modParams.link_title.$data = {
			is_leaf      : true, 
			type         : "link",   
			editable     : true, 
			is_mod_hide  : false,  
			is_card_show : true,
			name         : "标题",   
			text         : "YOUR HEAD LINE", 
			href         : "",
			require      : true, 
		}

		modParams.link_subtitle = modParams.link_subtitle || {};
		modParams.link_subtitle.text = modParams.link_subtitle.text || "YOUR SUB LINE";
		modParams.link_subtitle.href = modParams.link_subtitle.href || "";
		modParams.link_subtitle.$data = {
			is_leaf      : true, 
			type         : "link",   
			editable     : true, 
			is_mod_hide  : false,  
			is_card_show : true,
			name         : "子标题",   
			text         : "YOUR SUB LINE", 
			href         : "",
			require      : true, 
		};
		return modParams;
	}
			
	function getModuleParams(editorParams) {
		return editorParams;
	}

	function getStyleList() {
		return [
			{
				"design": {
					"text":"style1",
					"cover":"http://git.keepwork.com/gitlab_rls_official/keepworkimages/raw/master/official_images/img_1515414255990.jpeg"
				},
			},
			{
				"design": {
					"text":"style2",
					"cover":"http://git.keepwork.com/gitlab_rls_official/keepworkimages/raw/master/official_images/img_1515414270193.jpeg"
				},
			},
		];
	}

	function render(wikiblock) {
		var $scope = wikiblock.$scope;
		$scope.params = getEditorParams(wikiblock.modParams);
		$scope.mode = wikiblock.mode;
		$scope.setImgBackground = util.setImgBackground;

		return htmlContent;
    }

    return {
        render: render,
		getEditorParams: getEditorParams,
		getModuleParams: getModuleParams,
		getStyleList: getStyleList,
    }
});

