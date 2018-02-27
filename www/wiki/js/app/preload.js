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
<<<<<<< HEAD
	"helper/md/mdconf",
	//"helper/mdwiki",
	"helper/toolbase",
	
	// controller
    //'controller/notfoundController',
    //'controller/appsController',
    //'controller/contactController',
    //'controller/crosController',
    //'controller/dataSourceController',
    //'controller/editWebsiteController',
	//'controller/fansController',
	//'controller/findPwdController',
    'controller/footerController',
	//'controller/gitVersionController',
    'controller/headerController',
	'controller/homeController',
	//'controller/iframeAgentController',
	//'controller/inviteController',
	//'controller/joinController',
	//'controller/knowledgeController',
	//'controller/licenseController',
	//'controller/loginController',
=======
	'helper/md/mdconf',
	// 'helper/mdwiki',
	'helper/toolbase',
    
    // controller
>>>>>>> 63a59e76fe4787884a5ced92549757f424f80e9e
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
], function () {
    return {};
});
