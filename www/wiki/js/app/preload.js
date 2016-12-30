/**
 * Created by wuxiangan on 2016/12/20.
 */

/*预加载模块*/
(function () {
    var controllerPathPrefix = config.jsAppControllerPath;
    var directivePathPrefix = config.jsAppDirectivePath;
    var factoryPathPrefix = config.jsAppFactoryPath;
    var moduleList = [
        // controllers
        controllerPathPrefix + 'mainController.js',
        controllerPathPrefix +'headerController.js',

        // directives
        directivePathPrefix + 'moduleDirective.js',
        directivePathPrefix + 'wikiImage.js',

        // factory
        factoryPathPrefix + 'account.js',
        factoryPathPrefix + 'message.js',
        factoryPathPrefix + 'github.js',
    ];
    moduleList = moduleList.concat(config.preloadModuleList);
    //console.log(moduleList);
    define(moduleList, function () {
        console.log("preload finished!!!");
    });
})();
