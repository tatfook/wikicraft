/**
 * Created by wuxiangan on 2016/12/19.
 */

define([
    'app',
    'helper/markdownwiki',
    'helper/storage',
    'helper/util',

    'controller/userController',
], function (app, markdownwiki, storage, util, userHtmlContent) {
    var md = markdownwiki({html: true, use_template:false});

    app.controller('mainController', ['$scope', '$rootScope', '$http', '$auth', '$compile', 'Account', 'Message', 'github', 'modal',
        function ($scope, $rootScope, $http, $auth, $compile, Account, Message, github, modal) {
            console.log("mainController");
            // 初始化基本信息
            function initBaseInfo() {
                $rootScope.imgsPath = config.imgsPath;
                $rootScope.user = Account.getUser();
                $rootScope.userinfo = $rootScope.user;
                $rootScope.frameHeaderExist = true;
                $rootScope.frameFooterExist = true;

                $rootScope.isLogin = Account.isAuthenticated();

                $rootScope.isSelfSite = function () {
                    return $rootScope.user._id == $rootScope.userinfo._id;
                }

                //配置一些全局服务
                util.setAngularServices({
                    $rootScope: $rootScope,
                    $http: $http,
                    $compile: $compile,
                    $auth: $auth
                });
                
                util.setSelfServices({
                    config: config,
                    storage: storage,
                    Account: Account,
                    Message: Message,
                    github: github
                });
            }

            function initView() {
                // 信息提示框
                $("#messageTipCloseId").click(function () {
                    Message.hide();
                });

                // 底部高度自适应
                var winH=$(window).height();
                var headerH=52;
                var footerH=100;
                var minH=winH-headerH-footerH;
                var w = $("#__mainContent__");
                w.css("min-height", minH);

                // 注册路由改变事件, 改变路由时清空相关内容

                $rootScope.$on('$locationChangeSuccess', function () {
                    console.log("$locationChangeSuccess change");
                    initContentInfo();
                });

                //initContentInfo();
            }

            function renderHtmlText(pathname, md) {
                pathname = pathname.replace('/wiki/', '');
                var pageUrl = 'controller/' + pathname + 'Controller';
                var htmlContent;
                //console.log(pageUrl);
                require([pageUrl], function (htmlContent) {
                    //console.log(htmlContent);
                    $scope.IsRenderServerWikiContent = true;
                    if (pathname != "wikiEditor") {
                        htmlContent = md ? md.render(htmlContent) : htmlContent;
                    }
                    util.html('#__UserSitePageContent__', htmlContent, $scope);
                });
            }

            // 加载内容信息
            function initContentInfo() {
                $scope.IsRenderServerWikiContent = false;
                util.html('#__UserSitePageContent__', '<div></div>', $scope);

                var pathname = "/wiki/home";
                var urlObj = util.parseUrl();
                $rootScope.urlObj = urlObj;
                // 置空用户页面内容
                console.log(urlObj);
                if (!urlObj.username || urlObj.username == "wiki") {
                    //console.log($('#SinglePageId').children().length);
                    $scope.IsRenderServerWikiContent = $('#SinglePageId').children().length > 0;
                    if ($scope.IsRenderServerWikiContent) {
                        console.log("server page !!!");
                        return;
                    }

                    if (!urlObj.username || !urlObj.sitename) {
                        pathname = '/wiki/home';
                    } else { // /wiki/test
                        pathname = urlObj.pathname;
                    }

                    if (config.isLocal())
                        renderHtmlText(pathname, md);
                    else
                        renderHtmlText(pathname);
                    
                    return;
                }

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

                function getUserPage() {
                    // 访问用户页
                    if (urlObj.username && urlObj.sitename) {
                        util.http("POST", config.apiUrlPrefix + "website_pages/getDetailInfo", {
                            username: urlObj.username,
                            sitename: urlObj.sitename,
                            pagename: urlObj.pagename || 'index',
                            userId:$rootScope.user && $rootScope.user._id,
                        }, function (data) {
                            data = data || {};
                            // 这三种基本信息根化，便于用户页内模块公用
                            $rootScope.userinfo = data.userinfo;
                            $rootScope.siteinfo = data.siteinfo;
                            $rootScope.pageinfo = data.pageinfo;
                            var pageContent = data.pageinfo ? data.pageinfo.content : '<div>用户页丢失!!!</div>';
                            pageContent = md.render(pageContent);
                            //console.log(pageContent);
                            pageContent = $compile(pageContent)($scope);
                            $('#__UserSitePageContent__').html(pageContent);
                        });
                    } else if (urlObj.username){
                        util.html('#__UserSitePageContent__', userHtmlContent, $scope);
                    }

                }
            }

            function init() {
                initBaseInfo();
                initView();
            }

            init();

            $scope.$on("onUserProfile", function (event, user) {
                console.log('onUserProfile -- mainController');
                $scope.user = user;
                //init();
            });
        }]);

});
