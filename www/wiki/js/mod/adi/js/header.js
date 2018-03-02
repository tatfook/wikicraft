/**
 * Created by big on 2017/12/19.
 */
define([
	'app',
	'wikimod/adi/section/header/header',
	'./adi_factory',
], function (app, header) {
	let design = {
		setting : {
			is_leaf : true,
			require : true,
			id      : 'header-style-0',
		},
		styles : [
			{
				id:'left',
				// cover: 'http://git.keepwork.com/gitlab_rls_official/keepworkimages/raw/master/official_images/img_1515414062976.jpeg'
			},
			{
				id:'right',
				// cover: 'http://git.keepwork.com/gitlab_rls_official/keepworkimages/raw/master/official_images/img_1515414083068.jpeg'
			}
		]
	}

	let	params = {
		menu : {
			type        : "menu",
			editable    : true,
			is_mod_hide : false,
			name        : "菜单",
			require     : true,
			list        : [
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
		text : {
			type        : "text",
			editable    : true,
			is_mod_hide : false,
			name        : "文本",
			require     : true,
			text        : "这个测试的文字"
		}
	}

	let component = "<adi-header params='params' design='design'></adi-header>";

    return app.createModCommand(params, design, component);
});
