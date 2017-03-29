/**
 * Created by wuxiangan on 2016/12/20.
 */

/* 程序配置模块 */

(function () {
    var wiki_config = window.wiki_config || {};
    var localEnv = window.location.hostname == "localhost";
    var localVMEnv = localEnv && (window.location.host == "localhost:8099" || window.location.host == "localhost:8900");
    var pathPrefix = (localEnv && !localVMEnv) ? '/html/wiki/' : (wiki_config.webroot || '/wiki/');
    var officialDomain = wiki_config.officialDomain || "keepwork.com";
    config = {
        // --------------------------------------前端配置 START----------------------------------------------
        localEnv:localEnv,                                                                                         // 是否本地调试环境
        localVMEnv:localVMEnv,                                                                                     // 本地虚拟机环境
        hostname:wiki_config.hostname ? wiki_config.hostname.split(":")[0] : window.location.hostname,      //  url中的hostname, 优先取服务端给过来的(cname转发，客户端获取不到真实的hostname)
        officialDomain:officialDomain,                                                                            // 官方域名 因存在用户官方子域名和其它域名 故需记录
        officialSubDomainList:[                                                                                  // 官方占用的子域名列表
            "dev." + officialDomain,
        ],
        // 预加载模块列表
        preloadModuleList:[
            'directive/directive', // 不支持打包 动态加载
        ],

        // wiki 模块解析函数
        wikiModuleRenderMap:{},
        // ----------------------------------------前端配置 END------------------------------------------

        //------------------------------------------路径配置 START-----------------------------------------
        frontEndRouteUrl: (localEnv && !localVMEnv) ? (pathPrefix + 'index.html') : '/',  // 当使用前端路由时使用的url
        // 路径配置 BEGIN
        pathPrefix: pathPrefix,
        // 图片路径
        imgsPath: pathPrefix + 'assets/imgs/',
        // 文章路径前缀
        articlePath: pathPrefix + 'html/articles/',

        // js 路径
        jsPath: pathPrefix + 'js/',
        jsAppPath: pathPrefix + 'js/app/',
        jsAppControllerPath: pathPrefix + 'js/app/controller/',
        jsAppDirectivePath: pathPrefix + 'js/app/directive/',
        jsAppFactoryPath: pathPrefix + 'js/app/factory/',
        jsAppHelperPath: pathPrefix + 'js/app/helper/',
        jsLibPath: pathPrefix + 'js/lib',

        modPath: pathPrefix + 'mod/',
        wikiModPath: pathPrefix + 'js/mod/',

        // html 路径
        htmlPath: pathPrefix + 'html/',
        pageUrlPrefix:'/wiki/html/',

        // api接口路径
        apiUrlPrefix:localEnv ? 'http://localhost:8099/api/wiki/models/' : ('http://' + officialDomain + '/api/wiki/models/'),
        //modulePageUrlPrefix:'/wiki/module',
        //moduleApiUrlPrefix:'http://localhost:8099/api/module/',  // + moduleName + "/models/" + modelName + '[apiName]'
        // --------------------------------------路径配置 END----------------------------------------

        // --------------------------------------后端配置 START------------------------------------
        // bust version
        bustVersion: wiki_config.bustVersion,

        dataSource:{
            innerGitlab:{
                host:wiki_config.dataSource && wiki_config.dataSource.innerGitlab.host,
            }
        },
        // --------------------------------------后端配置 END-------------------------------------
    };

    config.isOfficialDomain = function (hostname) {
        if (config.officialDomain == hostname)
            return true;

        for (var i = 0; i < config.officialSubDomainList.length; i++) {
            if (config.officialSubDomainList[i] == hostname)
                return true;
        }
        return false;
    }

    config.isLocal = function () {
        return localEnv;
    }
    // local window env
    config.islocalWinEnv = function () {
        return localEnv && !localVMEnv
    }
    // local VM env
    config.islocalVMEnv = function () {
        return localEnv && localVMEnv;
    }
    // 预加载模块注册
    config.registerPreloadModule = function (path) {
        this.preloadModuleList.push(path);
    }

    // wikiMod渲染函数注册
    config.setWikiModuleRender = function(moduleName, render) {
        this.wikiModuleRenderMap[moduleName] = render;
    }
    config.getWikiModuleRender = function (moduleName) {
        return this.wikiModuleRenderMap[moduleName];
    }

    // 全局初始化
    config.init = function (cb) {
        require(config.preloadModuleList,function () {
            cb && cb();
        })
    }

    window.config = config;
})();