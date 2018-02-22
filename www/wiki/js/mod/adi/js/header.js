/**
 * Created by big on 2017/12/19.
 */
define([
	'app',
	'helper/util',
	'text!wikimod/adi/html/header.html',
	'wikimod/adi/component/menu/menu',
	'wikimod/adi/component/logo/logo',
], function (app, util, htmlContent, menuComponent) {
	var initObj = {
		styles:[
		{
			design:{
				text:'left',
				cover: 'http://git.keepwork.com/gitlab_rls_official/keepworkimages/raw/master/official_images/img_1515414062976.jpeg'
			}
		},
		{
			design:{
				text:'right',
				cover: 'http://git.keepwork.com/gitlab_rls_official/keepworkimages/raw/master/official_images/img_1515414083068.jpeg'
			}
		}
		],
		params_template:{
			design:{
				is_leaf: true,
				require: true,
				text:"left", // 默认值
			},
			menu_menu:{
				is_leaf: true,
				type: "menu",
				editable: true,
				is_mod_hide: false,
				name: "菜单",
				require: true,
				text: [
					{
						name : '菜单1',
						url  : '',
						children: [
							{
								name : '菜单1.1',
								url  : ''
							}
						]
					}
				]
			},
		}
	};

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

    function render(wikiBlock) {
		menuComponent(wikiBlock);

		var $scope = wikiBlock.$scope;
		$scope.params = getEditorParams(wikiBlock.modParams);
		$scope.mode = wikiBlock.mode;

		return htmlContent;
	}
	
    return {
        render          : render,
		getEditorParams : getEditorParams,
		getStyleList    : getStyleList,
    }
});
