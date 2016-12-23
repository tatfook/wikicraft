/**
 * Created by wuxiangan on 2016/12/20.
 */

/* 程序配置模块 */

(function () {
    var pathPrefix = '/wiki/';
    config = {
        pathPrefix: pathPrefix,
        htmlPath: pathPrefix + 'html/',
        jsPath: pathPrefix + 'js/',
        imgsPath: pathPrefix + 'imgs/',
        libPath: pathPrefix + 'js/lib/',

        modPath: pathPrefix + 'mod/',
        wikiModPath: pathPrefix + 'js/mod/',
        
        apiUrlPrefix:'http://localhost:8099/api/wiki/models/',
        pageUrlPrefix:'http://localhost:8099/wiki/html/',

        //modulePageUrlPrefix:'/wiki/module',
        //moduleApiUrlPrefix:'http://localhost:8099/api/module/',  // + moduleName + "/models/" + modelName + '[apiName]'

        // 预加载模块列表
        preloadModuleList:[],
    };

    config.registerPreloadModule = function (path) {
        this.preloadModuleList.push(path);
    }
    window.config = config;
})();