/**
 * Created by wuxiangan on 2016/12/19.
 */

define([
    'app',
    'helper/markdownwiki',
    'helper/storage',
    'helper/util',
    'helper/dataSource',
    'helper/loading',
    'controller/homeController',
    'controller/headerController',
    'controller/footerController',
    'controller/userController',
    'controller/notfoundController',
], function (app, markdownwiki, storage, util, dataSource, loading, homeHtmlContent, headerHtmlContent, footerHtmlContent, userHtmlContent, notfoundHtmlContent) {
    var md = markdownwiki({html: true});

    app.controller('mainController', ['$scope', '$rootScope', '$location', '$http', '$auth', '$compile', 'Account', 'Message', 'github', 'modal','gitlab',
        function ($scope, $rootScope, $location, $http, $auth, $compile, Account, Message, github, modal, gitlab) {
            //console.log("mainController");
            
            // 初始化基本信息
            function initBaseInfo() {
                //配置一些全局服务
                util.setAngularServices({
                    $rootScope: $rootScope,
                    $http: $http,
                    $compile: $compile,
                    $auth: $auth,
                    $location:$location,
                });

                util.setSelfServices({
                    config: config,
                    storage: storage,
                    Account: Account,
                    Message: Message,
                    github: github,
                    gitlab:gitlab,
                    dataSource:dataSource,
                    loading:loading,
                });

                $rootScope.imgsPath = config.imgsPath;
                $rootScope.cssPath = config.cssPath;
                $rootScope.user = Account.getUser();
                $rootScope.userinfo = $rootScope.user;
                if (config.isLocal()) {
                    $rootScope.frameHeaderExist = true;
                    $rootScope.frameFooterExist = true;
                } else {
                    $rootScope.frameHeaderExist = config.isOfficialDomain(window.location.hostname);
                    $rootScope.frameFooterExist = config.isOfficialDomain(window.location.hostname);
                }

                $rootScope.isLogin = Account.isAuthenticated();
                $rootScope.isSelfSite = function () {
                    return $rootScope.user._id == $rootScope.userinfo._id;
                }

                $rootScope.getImageUrl = function(imgUrl,imgsPath) {
                    if (imgUrl.indexOf("://") >= 0) {
                        return imgUrl;
                    }
                    if (imgUrl.indexOf("/wiki/") >= 0) {
                        return imgUrl + "?bust=" + config.bustVersion;
                    }

                    return (imgsPath || $rootScope.imgsPath) + imgUrl + "?bust=" + config.bustVersion;
                }

                $rootScope.getCssUrl = function(cssUrl, cssPath) {
                    if (cssUrl.indexOf("://") >= 0) {
                        return cssUrl;
                    }
                    if (cssUrl.indexOf("/wiki/") >= 0) {
                        return cssUrl + "?bust=" + config.bustVersion;
                    }

                    return (cssPath || $rootScope.cssPath) + cssUrl + "?bust=" + config.bustVersion;
                }

            }

            function initView() {

                // 信息提示框
                $("#messageTipCloseId").click(function () {
                    Message.hide();
                });

                if ($rootScope.frameHeaderExist) {
                    util.html('#__wikiHeader__', headerHtmlContent, $scope);
                }
                if ($rootScope.frameFooterExist) {
                    util.html('#__wikiFooter__', footerHtmlContent, $scope);
                }
                
                $rootScope.getBodyStyle = function () {
                    return {
                        "padding-top": $rootScope.frameHeaderExist ? "56px" : "0px",
                    };
                }

                // 页面重载回调
                // $(window).on("beforeunload", function () {
                //
                // });

                // 底部高度自适应
                var winH=$(window).height();
                var headerH=52;
                var footerH=100;
                var minH=winH-headerH-footerH;
                var w = $("#__mainContent__");
                w.css("min-height", minH);

                var isFirstLocationChange = true;
                // 注册路由改变事件, 改变路由时清空相关内容
                $rootScope.$on('$locationChangeSuccess', function () {
                    //console.log("$locationChangeSuccess change");
                    if (!isFirstLocationChange && util.snakeToHump(window.location.pathname) == '/wiki/wikiEditor') {
                        return ;
                    }
                    isFirstLocationChange = false;
                    config.loadMainContent(initContentInfo);
                });
            }

            function renderHtmlText(pathname, md) {
                pathname = util.snakeToHump(pathname);
                pathname = pathname.replace('/wiki/', '');
                var pageUrl = 'controller/' + pathname + 'Controller';
                var htmlContent;
                //console.log(pageUrl);
                require([pageUrl], function (htmlContent) {
                    //util.html('#__UserSitePageContent__', htmlContent, $scope);
                    if (pathname != "test" || pathname == "wikiEditor" || !md) {
                        util.html('#__UserSitePageContent__', htmlContent, $scope);
                    } else {
                        md.bindRenderContainer('#__UserSitePageContent__');
                        md.render(htmlContent);
                    }
                });
            }

            function setWindowTitle(urlObj) {
                var pathname = urlObj.pathname;
                //console.log(pathname);
                var paths = pathname.split('/');
                if (paths.length > 1 && paths[1]) {
                    $rootScope.title = paths[paths.length-1] + (paths.length > 2 ? (' - ' +paths.slice(1,paths.length-1).join('/')) : "");
                } else {
                    $rootScope.title = config.hostname.substring(0,config.hostname.indexOf('.'));
                }
            }

            function getUserPage() {
                var urlObj = $rootScope.urlObj;
                // 访问用户页
                $rootScope.userinfo = undefined;
                $rootScope.siteinfo = undefined;
                $rootScope.pageinfo = undefined;
                $rootScope.tplinfo = undefined;
                if (urlObj.username && urlObj.sitename) {
                    util.http("POST", config.apiUrlPrefix + "website/getDetailInfo", {
                        username: urlObj.username,
                        sitename: urlObj.sitename,
                        pagename: urlObj.pagename || 'index',
                        userId:$rootScope.user && $rootScope.user._id,
                    }, function (data) {
                        data = data || {};
                        // 这三种基本信息根化，便于用户页内模块公用
                        $rootScope.userinfo = data.userinfo;
                        $rootScope.siteinfo = data.siteinfo || {};
                        $rootScope.pageinfo = {username:urlObj.username,sitename:urlObj.sitename, pagename:urlObj.pagename, pagepath:urlObj.pagepath};
                        $rootScope.tplinfo = {username:urlObj.username,sitename:urlObj.sitename, pagename:"_theme"};

                        var dataSourceId = data.siteinfo.dataSourceId || data.userinfo.dataSourceId;
                        var userDataSource = dataSource.getUserDataSource(data.userinfo.username);

                        userDataSource.init(data.userinfo.dataSource, data.userinfo.dataSourceId);
                        userDataSource.registerInitFinishCallback(function () {
                            dataSource.setCurrentDataSource(data.userinfo.username, dataSourceId);
                            var currentDataSource = dataSource.getCurrentDataSource();
                            var renderContent = function (content) {
                                $rootScope.$broadcast('userpageLoaded',{});
                                content = md.render(content ||  notfoundHtmlContent);
                                util.html('#__UserSitePageContent__', content, $scope);
                            };

                            currentDataSource.getRawContent({path:urlObj.pagepath + config.pageSuffixName}, function (data) {
                                //console.log(data);
                                renderContent(data);
                            }, function () {
                                renderContent();
                            });
                        });
                    });
                } else if (urlObj.username){
                    util.html('#__UserSitePageContent__', userHtmlContent, $scope);
                }
            }

            // 加载内容信息
            function initContentInfo() {
                util.html('#__UserSitePageContent__', '<div></div>', $scope);
                $rootScope.urlObj = util.parseUrl();

                var urlObj = $rootScope.urlObj;
                // 置空用户页面内容
                console.log(urlObj);
                setWindowTitle(urlObj);

                if (config.mainContent) {
                    if (config.mainContentType == "wiki_page") {
                        renderHtmlText(urlObj.pathname, md);
                    } else {
                        util.html('#__UserSitePageContent__', config.mainContent, $scope);
                        config.mainContent = undefined;
                    }
                } else if (!urlObj.username){
                    if (Account.isAuthenticated()) {
                        Account.getUser(function (userinfo) {
                            util.goUserSite("/" + userinfo.username);
                        });
                        //util.html('#__UserSitePageContent__', userHtmlContent, $scope);
                    } else {
                        util.html('#__UserSitePageContent__', homeHtmlContent, $scope);
                    }
                } else if(urlObj.username == 'wiki') {
                    renderHtmlText(urlObj.pathname, md);
                } else {
                    if (urlObj.domain && !config.isOfficialDomain(urlObj.domain)) {
                        util.post(config.apiUrlPrefix + 'website/getByDomain',{domain:urlObj.domain}, function (data) {
                            if (data) {
                                urlObj.username = data.username;
                                urlObj.sitename = data.name;
                            }
                            getUserPage();
                        }, function () {
                            getUserPage();
                        });
                    } else {
                        getUserPage();
                    }
                }

            }

            function init() {
                initBaseInfo();
                initView();
            }

            init();

            $scope.$on("onUserProfile", function (event, user) {
                //console.log('onUserProfile -- mainController');
                $scope.user = user;
                //init();
            });
        }]);

});
