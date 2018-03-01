/**
 * Created by big on 2017/12/19.
 */
define([
	'app',
	'./mod_factory',
	'wikimod/adi/section/header/header',
], function (app, htmlContent) {
	let desgin = [
		{
			id:'left',
			// cover: 'http://git.keepwork.com/gitlab_rls_official/keepworkimages/raw/master/official_images/img_1515414062976.jpeg'
		},
		{
			id:'right',
			// cover: 'http://git.keepwork.com/gitlab_rls_official/keepworkimages/raw/master/official_images/img_1515414083068.jpeg'
		}
	];

	let	params = {
		desgin    : {
			is_leaf : true,
			require : true,
			id      : 'header-style-0',
		},
		menu : {
			is_leaf     : true,
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
	}

	let component = "<adi-header params='params'></adi-header>";

    return app.createModCommand(params, desgin, component);
});
