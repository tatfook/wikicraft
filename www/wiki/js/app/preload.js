/**
 * Created by wuxiangan on 2016/12/20.
 */

/*预加载模块*/
(function () {
    var pathPrefix = config.pathPrefix;
    var controllerPathPrefix = pathPrefix + 'js/app/controller/';
    var directivePathPrefix = pathPrefix + 'js/app/directive/';
    var factoryPathPrefix = pathPrefix + 'js/app/factory/';
    var moduleList = [
        // controllers
        controllerPathPrefix + 'mainController.js',
        controllerPathPrefix +'headerController.js',

        // directives
        directivePathPrefix + 'moduleDirective.js',

        // factory
        factoryPathPrefix + 'account.js',
        factoryPathPrefix + 'message.js',
        factoryPathPrefix + 'ProjectStorageProvider.js',
    ];
    moduleList = moduleList.concat(config.preloadModuleList);
    //console.log(moduleList);
    define(moduleList, function () {
        console.log("preload finished!!!");
    });
})();
