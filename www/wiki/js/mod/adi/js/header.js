/**
 * Created by big on 2017/12/19.
 */
define([
	'app',
	'wikimod/adi/section/header/header',
	'./adi_factory',
], function (app, header) {

	let	params = {
		design : {
			type : 'style',
			id   : 'header-style-0',
		},
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

	let component = "<adi-header params='params'></adi-header>";

    return app.createModCommand(params, header, component);
});
