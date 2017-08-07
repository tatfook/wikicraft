/**
 * Created by wuxiangan on 2016/12/20.
 */

/*预加载模块*/
define([
    'jquery-cookie',

    // helper
    'helper/util',
    'helper/loading',
	
	// controller
    'controller/mainController',
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
