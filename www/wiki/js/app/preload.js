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
    'controller/mainController',
	//'controller/myVIPController',
	//'controller/notfoundController',
	//'controller/oauthController',
	//'controller/payController',
	//'controller/previewController',
	//'controller/searchController',
	//'controller/servicesController',
	//'controller/staticsController',
	//'controller/userCenterController',
    //'controller/userController',
	//'controller/userProfileController',
	//'controller/usershowController',
	//'controller/verifyEmailController',
	//'controller/vipController',
	//'controller/VIPLevelController',
	//'controller/websiteController',
	//'controller/wikiBlockController',
	//'controller/worksApplyController',
    //'controller/testController',

    // directives
    //'directive/directive', // 不支持打包 动态加载
    'directive/moduleDirective',
    'directive/userpage',
    'directive/tplheader',
    'directive/wikiImage',
    'directive/wikiLink',
    'directive/wikiUISelect',
    'directive/wikiHtml',
    'directive/ngOn',

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
