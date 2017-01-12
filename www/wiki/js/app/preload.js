/**
 * Created by wuxiangan on 2016/12/20.
 */

/*预加载模块*/

(function () {
    var moduleList = [
        'controller/mainController',
        'controller/headerController',

        // directives
        'directive/moduleDirective',
        'directive/userpage',
        'directive/wikiImage',

        // factory
        'factory/account',
        'factory/message',
        'factory/github',
    ];
    moduleList = moduleList.concat(config.preloadModuleList);
    //console.log(moduleList);
    define(moduleList, function () {
        console.log("preload finished!!!");
    });
})();
