/**
 * Created by big on 2017/12/19.
 */
define([
	'app',
	'../section/header/header.js',
], function (app, htmlContent) {
	let desgin = [
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

	let	params = {
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

	let component = "<adi-header></adi-header>";

    return app.createModCommand(params, desgin, component);
});
