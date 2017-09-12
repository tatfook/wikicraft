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
	
	// controller
    'controller/mainController',
    'controller/headerController',
    'controller/footerController',
    'controller/userController',
    'controller/notfoundController',
    'controller/crosController',
    //'controller/testController',

    // directives
    //'directive/directive', // 不支持打包 动态加载
    'directive/moduleDirective',
    'directive/userpage',
    'directive/wikiImage',
    'directive/wikiLink',
    'directive/wikiUISelect',

    // factory
    'factory/account',
    'factory/message',
    'factory/github',
    'factory/gitlab',
    'factory/modal',
    'factory/confirmDialog',
    'factory/loadingInterceptor',

], function () {
    return {};
});
