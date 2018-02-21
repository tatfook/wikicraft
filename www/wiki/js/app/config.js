/**
 * Created by wuxiangan on 2016/12/20.
 */

/* 程序配置模块 */

(function () {
	const host        = window.location.host;
	const hostname    = window.location.hostname;
	const pathname    = window.location.pathname;
	const hash        = window.location.hash;
    const prodHost    = "^keepwork.com$";
	const releaseHost = "^release.keepwork.com$";
	
	var wiki_config   = window.wiki_config || {};
	var localEnv      = hostname.indexOf("localhost") >= 0 ? true : false;
	var localVMEnv    = localEnv && host != "localhost:63342";
	var pathPrefix    = (localEnv && !localVMEnv) ? '/www/wiki/' : (wiki_config.webroot || '/wiki/');
	var envIndex      = hostname.indexOf(".dev.keepwork.com");

	if (!wiki_config.webroot && envIndex > 0) {
		pathPrefix = '/' + hostname.substring(0, envIndex) + '/';
	}
	
	config = {
        /*---------------------------------------前端配置 START--------------------------------------------*/
        env                   : getEnv(),
		localEnv              : localEnv,                                                             // 是否本地调试环境
		localVMEnv            : localVMEnv,                                                           // 本地虚拟机环境
		hostname              : wiki_config.hostname ? wiki_config.hostname.split(":")[0] : hostname, // url中的hostname, 优先取服务端给过来的(cname转发，客户端获取不到真实的hostname)
		pathname              : pathname,
		hash                  : hash,
		officialDomainList    : ["keepwork.com", "qiankunew.com"],                                    // 官方域名 因存在用户官方子域名和其它域名 故需记录
		officialSubDomainList : [                                                                     // 官方占用的子域名列表
			"release.keepwork.com",
			"dev.keepwork.com",
			"stage.keepwork.com",
			"test.keepwork.com",
			"dev.qiankunew.com",
			"stage.qiankunew.com",
			"test.qiankunew.com",
			"wxa.keepwork.tk",
			"inside.keepwork.tk",
		],
		preloadModuleList     : [],    // 预加载模块列表 不支持打包 动态加载
		wikiModuleRenderMap   : {},    // wiki mod 解析函数
		pageSuffixName        : ".md",
		pageStoreName         : "sitepage",
		/*-------------------------------------------前端配置 END------------------------------------------*/

		/*------------------------------------------路径配置 START-----------------------------------------*/
		frontEndRouteUrl    : (localEnv && !localVMEnv) ? (pathPrefix + 'index.html') : '/',  // 当使用前端路由时使用的url
		pathPrefix          : pathPrefix, 		             // 路径配置 BEGIN
		imgsPath            : pathPrefix + 'assets/imgs/',   // 图片路径
		articlePath         : pathPrefix + 'html/articles/', // 文章路径前缀
		jsPath              : pathPrefix + 'js/',            // js 路径
		jsAppPath           : pathPrefix + 'js/app/',
		jsAppControllerPath : pathPrefix + 'js/app/controller',
		jsAppDirectivePath  : pathPrefix + 'js/app/directive',
		jsAppComponentsPath : pathPrefix + 'js/app/components',
		jsAppFactoryPath    : pathPrefix + 'js/app/factory',
		jsAppHelperPath     : pathPrefix + 'js/app/helper',
		// jsLibPath           : pathPrefix + 'js/lib',
		jsLibPath           : '/wiki/' + 'js/lib',    // 库路径写死 避免前后多次重复缓存库
		modPath             : pathPrefix + 'mod',
		wikiModPath         : pathPrefix + 'js/mod',
		htmlPath            : pathPrefix + 'html/',   // html 路径
		cssPath             : pathPrefix + 'assets/css/',
		pageUrlPrefix       :'/wiki/html/',
		// modulePageUrlPrefix : '/wiki/module',                       // api接口路径
		// moduleApiUrlPrefix  : 'http://localhost:8099/api/module/',  // + moduleName + "/models/" + modelName + '[apiName]'
		/*------------------------------------------路径配置 END------------------------------------------*/

		/*-----------------------------------------后端配置 START-----------------------------------------*/
		wikiConfig  : wiki_config,
		bustVersion : wiki_config.bustVersion, //bust version
		/*------------------------------------------后端配置 END------------------------------------------*/

		/*-------------------------------------------MAP START-------------------------------------------*/
		routeMap  : { // wiki page
			"/wiki/test"       : "controller/testController",
			"/wiki/wikieditor" : "controller/wikiEditorController"
		},
		filterMap : {
			"/wiki/iframeagent" : [],
		},
		shareMap  : {}, // 数据共享
		/*--------------------------------------------MAP END--------------------------------------------*/
		
		/*-------------------------------------HELPER FUNCTION START-------------------------------------*/
		isOfficialDomain : function (currentHostname) {
			currentHostname = currentHostname || hostname;
			currentHostname = currentHostname.split(':')[0];
	
			if (currentHostname.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
				return true;
			}
	
			if (currentHostname.indexOf(".dev.keepwork.com") >= 0 || currentHostname.indexOf(".stage.keepwork.com") >= 0 || currentHostname.indexOf("localhost") >= 0) {
				return true;
			}
	
			for (var i = 0; i < config.officialDomainList.length; i++) {
				if (config.officialDomainList[i] == currentHostname){
					return true;
				}
			}
	
			for (var i = 0; i < config.officialSubDomainList.length; i++) {
				if (config.officialSubDomainList[i] == currentHostname){
					return true;
				}
			}
	
			return false;
		},
		isDebugEnv : function() {
			if (config.isLocal()) {
				return true;
			}
	
			if (hostname == "wxa.keepwork.tk") {
				return true;
			}
	
			if (hostname.indexOf("localhost") >=0 ) {
				return true;
			}
	
			return false;
		},
		isLocal : function () { // local env
			return localEnv;
		},
		islocalWinEnv : function () { // local window env
			return localEnv && !localVMEnv
		},
		islocalVMEnv : function () { // local VM env
			return localEnv && localVMEnv;
		},
		registerPreloadModule : function (path) { // 预加载模块注册
			this.preloadModuleList.push(path);
		},
		registerFilter : function(path, func) { // 注册过滤函数
			let filterList = this.filterMap[path] || [];

			filterList.push(func);

			this.filterMap[path] = filterList;
		},
		setWikiModuleRender : function(moduleName, render) { // wiki mod 渲染函数注册
			this.wikiModuleRenderMap[moduleName] = render;
		},
		getWikiModuleRender : function (moduleName) { // 获得模块渲染函数
			return this.wikiModuleRenderMap[moduleName];
		},
		getPage : function() {},
		loadMainContent : function(cb, errcb) {
			let currentPathname = this.util.parseUrl().pagepath || pathname;

			if(this.islocalWinEnv()) {
				currentPathname =  hash ? hash.substring(1) : '/';
			}

			// 为官网页面 则预先加载
			let pageurl         = "";
			let rawPathname     = currentPathname;

			currentPathname = this.util.snakeToHump(currentPathname);

			if (currentPathname.indexOf('/wiki/mod/') == 0) {
				// mod 模块
				currentPathname = currentPathname.substring('/wiki/mod/' . length);

				let paths = currentPathname.split('/');

				if (paths.length > 1) {
					pageurl = 'mod/' + paths[0] + '/controller/' + paths[1] + "Controller";
				} else {
					pageurl = 'mod/' + paths[0] + '/controller/indexController';
				}

				this.mainContentType = "mod";
			} else if(currentPathname.indexOf('/wiki/js/mod/') == 0) {
				// wiki command mod
				pageurl = 'wikimod' + currentPathname.substring('/wiki/js/mod'.length);

				this.mainContentType = "wiki_mod";
			} else if (currentPathname.indexOf('/wiki/') == 0 || currentPathname == '/wiki') {
				let pagename = pathname.substring('/wiki/'.length);

				pageurl = 'controller/' + (pagename || 'home') + 'Controller';

				this.mainContentType = "wiki_page";
			} else {
				this.mainContentType = "user_page";
				this.mainContent     = undefined;
			}
	
			rawPathname = rawPathname.toLowerCase();

			if (this.routeMap[rawPathname]) {
				pageurl = this.routeMap[rawPathname];  // 优先配置路由
			}
			
			if (pageurl) {
				require([pageurl], function (mainContent) {
					if (typeof(mainContent) == "object") {
						config.mainContent = mainContent.render({});
					} else {
						config.mainContent = mainContent;
					}

					cb && cb();
				}, function () {
					errcb && errcb();
				});
			} else {
				cb && cb();
			}
		},
		init : function (cb) { // 全局初始化
			require(this.preloadModuleList, function () {
				cb && cb();
			});
		}
		/*-------------------------------------HELPER FUNCTION END---------------------------------------*/
	};

	function getEnv(){
        var prodExp    = new RegExp(prodHost);
		var releaseExp = new RegExp(releaseHost);
		
        if (prodExp.test(hostname)) {
            return "prod";
		}
		
        if (releaseExp.test(hostname)) {
            return "release";
		}
		
        return "develop";
	}

	function filterIE() {
        let b_name    = navigator.appName;
        let b_version = navigator.appVersion;
		let version   = b_version.split(";");
		
        if (!version[1]){
        	return;
		}

		let trim_version = version[1].replace(/[ ]/g, "");
		
        if (b_name == "Microsoft Internet Explorer") {
            /*如果是IE6或者IE7*/
            if (trim_version == "MSIE9.0" || trim_version == "MSIE8.0" || trim_version == "MSIE7.0" || trim_version == "MSIE6.0") {
                // alert("IE浏览器版本过低，请到指定网站去下载相关版本");
				//然后跳到需要连接的下载网站
				// console.log(window.location);
				if (pathname !== "/wiki/browers"){
					window.location.href = "/wiki/browers";
				}
            }
        }
    }

	function initConfig() {
		let initHostname;

		if (!config.isLocal() && !config.isOfficialDomain()) {
			for (var i = 0; i < config.officialDomainList.length; i++) {
				if (hostname.indexOf(config.officialDomainList[i]) >= 0) {
					initHostname = config.officialDomainList[i];
				}
			}
		}else{
			initHostname = hostname;
		}

		if (config.islocalWinEnv()) {
			config.apiHost = "localhost:8900";
		} else {
			config.apiHost = initHostname + host.substring(hostname.length);
		}

		config.apiUrlPrefix = 'http://' + config.apiHost + '/api/wiki/models/';
	}

    filterIE();
	initConfig();

	window.config = config;

	if(!window.debug) {
		console.log   = function(){};
		console.error = function(){};
		console.warn  = function(){};
	}
})();
