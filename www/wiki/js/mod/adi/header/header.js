/**
 * Created by big on 2017/12/19.
 */
define([
	'app',
	'helper/util',
	'text!wikimod/adi/header/header.template.html',
	'wikimod/adi/component/menu/menu',
	'wikimod/adi/component/logo/logo',
], function (app, util, htmlContent, menuComponent) {
	var desgin = [
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
	];

	var	modParams = {
		design    : {
			is_leaf: true,
			require: true,
			text:"left", // 默认值
		},
		menu_menu : {
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

	var styles = {

	}

	// return app.createModCommand({menu=... }, "<adi-header");

    return {
        render : function (block) {
			menuComponent(block, styles);
	
			var $scope  = block.$scope;
	
			$scope.params = app.objects.mainMdwiki.getEditorParams(block.modParams, modParams);
			$scope.mode   = block.mode;
	
			return htmlContent;
		},
		getEditorParams : modParams,
		getStyleList    : desgin,
    }
});
