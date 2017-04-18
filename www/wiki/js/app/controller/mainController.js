/**
 * Created by wuxiangan on 2016/12/19.
 */

define([
    'app',
    'helper/markdownwiki',
    'helper/storage',
    'helper/util',
    'helper/dataSource',
    'controller/homeController',
    'controller/headerController',
    'controller/footerController',
    'controller/userController',
], function (app, markdownwiki, storage, util, dataSource, homeHtmlContent, headerHtmlContent, footerHtmlContent, userHtmlContent) {
    var md = markdownwiki({html: true});

    app.controller('mainController', ['$scope', '$rootScope', '$location', '$http', '$auth', '$compile', 'Account', 'Message', 'github', 'modal','gitlab',
        function ($scope, $rootScope, $location, $http, $auth, $compile, Account, Message, github, modal, gitlab) {
            console.log("mainController");

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
                });

                $rootScope.imgsPath = config.imgsPath;
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
                    console.log("$locationChangeSuccess change");
                    if (!isFirstLocationChange && window.location.pathname == '/wiki/wikiEditor') {
                        return ;
                    }
                    isFirstLocationChange = false;
                    initContentInfo();
                });
            }

            function renderHtmlText(pathname, md) {
                pathname = pathname.replace('/wiki/', '');
                var pageUrl = 'controller/' + pathname + 'Controller';
                var htmlContent;
                //console.log(pageUrl);
                require([pageUrl], function (htmlContent) {
                    if (pathname == "wikiEditor" || !md) {
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
                        $rootScope.siteinfo = data.siteinfo;

                        var dataSourceId = data.userinfo.dataSourceId;
                        var pageContent = data.pageContent;
                        var themeUrl = '/' + urlObj.username + '/' + urlObj.sitename + '/_theme';
                        var pageUrl = '/' + urlObj.username + '/' + urlObj.sitename + '/' + (urlObj.pagename || 'index');

                        if (data.siteinfo) {
                            dataSourceId = data.siteinfo.dataSourceId || dataSourceId;
                            var pageList = angular.fromJson(data.siteinfo.pageinfo || '[]');
                            for (var i = 0; i < pageList.length; i++) {
                                if (pageList[i].url == themeUrl) {
                                    $rootScope.tplinfo = pageList[i];
                                }

                                if (pageList[i].url == pageUrl) {
                                    $rootScope.pageinfo = pageList[i];
                                }
                            }
                        }

                        var renderContent = function (content) {
                            $rootScope.$broadcast('userpageLoaded',{});
                            content = md.render(content ||  '<div>用户页丢失!!!</div>');
                            util.html('#__UserSitePageContent__', content, $scope);
                        };

                        var userDataSource = dataSource.getUserDataSource(data.userinfo.username);
                        userDataSource.init(data.userinfo.dataSource, data.userinfo.dataSourceId);
                        userDataSource.registerInitFinishCallback(function () {
                            var ds = userDataSource.getDataSourceById(dataSourceId);
                            ds.getContent({path:pageUrl.substring(1)}, function (data) {
                                renderContent(data);
                            }, function () {
                                renderContent(pageContent);
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
                    if (urlObj.pathname.indexOf("/wiki/mod/") == 0) {
                        util.html('#__UserSitePageContent__', config.mainContent, $scope);
                        config.mainContent = undefined;
                    } else {
                        renderHtmlText(urlObj.pathname, md);
                    }
                } else if (!urlObj.username){
                    if (Account.isAuthenticated()) {
                        util.html('#__UserSitePageContent__', userHtmlContent, $scope);
                    } else {
                        util.html('#__UserSitePageContent__', homeHtmlContent, $scope);
                    }
                } else if(urlObj.username == 'wiki') {
                    renderHtmlText(urlObj.pathname, md);
                } else {
                    if (urlObj.domain) {
                        util.post(config.apiUrlPrefix + 'website/getByDomain',{domain:urlObj.domain}, function (data) {
                            if (data) {
                                urlObj.pagename = urlObj.sitename;
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
