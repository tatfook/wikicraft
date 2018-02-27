/**
 * Created by wuxiangan on 2016/12/20.
 */

/*预加载模块*/
define([
	//lib
    'jquery-cookie',

    // helper
    'helper/dataSource',
    'helper/filter',
    'helper/loading',
    'helper/markdownwiki',
    'helper/mods',
    'helper/siteStyle',
    'helper/storage',
    'helper/util',
	'helper/md/mdconf',
	// 'helper/mdwiki',
	'helper/toolbase',
    
    // controller
    'controller/mainController',

    // directives
    'directive/moduleDirective',
    'directive/userpage',
    'directive/tplheader',
    //'directive/wikiImage',
    //'directive/wikiLink',
	'directive/wikiUISelect',
	'directive/wikiHtml',
    'directive/ngOn',
    //'directive/wikipage',
    //'directive/wikiBlock',
    //'directive/wikiBlockContainer',

    // factory
    'factory/account',
    'factory/message',
    'factory/github',
    'factory/gitlab',
    'factory/modal',
    'factory/confirmDialog',
    'factory/realnameVerifyModal',
    'factory/datatreeEditorModal',
    'factory/assetsManagerModal',
    'factory/loadingInterceptor',
    'factory/selfDefinedModal',

    // components
    'components/editorMode',
], function () {
    return {};
});
