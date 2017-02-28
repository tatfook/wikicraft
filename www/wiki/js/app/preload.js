/**
 * Created by wuxiangan on 2016/12/20.
 */

/*预加载模块*/

(function () {
    var moduleList = [
        'controller/mainController',
        'controller/headerController',
        //'controller/testController',

        // directives
        'directive/directive',
        'directive/moduleDirective',
        'directive/userpage',
        'directive/wikiImage',
        'directive/wikiUISelect',

        // factory
        'factory/account',
        'factory/message',
        'factory/github',
        'factory/modal',
    ];
    moduleList = moduleList.concat(config.preloadModuleList);
    //console.log(moduleList);
    define(moduleList, function () {
        console.log("preload finished!!!");
    });
})();
