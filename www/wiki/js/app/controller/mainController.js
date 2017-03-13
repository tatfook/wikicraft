/**
 * Created by wuxiangan on 2016/12/19.
 */

define(['jquery', 'app', 'helper/markdownwiki', 'helper/storage', 'helper/util', 'codemirror',], function ($, app, markdownwiki, storage, util, CodeMirror) {
    var md = markdownwiki({html: true});

    app.controller('mainController', ['$scope', '$rootScope', '$state', '$http', '$auth', '$compile', 'Account', 'Message', 'github', 'modal',
        function ($scope, $rootScope, $state, $http, $auth, $compile, Account, Message, github, modal) {
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
                    $state: $state,
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

                // 注册路由改变事件, 改变路由时清空相关内容
                $scope.$on('$stateChangeStart', function (evt, toState, toParams, fromState, fromParams) {
                    // 如果需要阻止事件的完成
                    //evt.preventDefault();
                    console.log("$stateChangeStart");
                    $scope.IsRenderServerWikiContent = false;
                    util.html('#__UserSitePageContent__', '<div></div>', $scope);
                });
            }

            function renderHtmlText(pathname, md) {
                pathname = pathname.replace('/wiki/', '');
                var pageUrl = 'controller/' + pathname + 'Controller';
                var htmlContent;
                //console.log(pageUrl);
                require([pageUrl], function (htmlObj) {
                    //console.log(htmlContent);
                    $scope.IsRenderServerWikiContent = true;
                    if (typeof htmlObj == "string") {
                        htmlContent = htmlObj;
                        htmlContent = md ? md.render(htmlContent) : htmlContent;
                        util.html('#__UserSitePageContent__', htmlContent, $scope);
                    } else if (typeof htmlObj == "object") {
                        htmlContent = htmlObj.htmlContent;
                        htmlContent = md ? md.render(htmlContent) : htmlContent;
                        //util.html('#SinglePageId', htmlObj.htmlContent, $scope);
                        util.html('#__UserSitePageContent__', htmlObj.htmlContent, $scope);
                        typeof htmlObj.domReady == "function" && htmlObj.domReady();
                    }
                });
            }

            // 加载内容信息
            function initContentInfo() {
                $scope.IsRenderServerWikiContent = false;
                var urlObj = util.parseUrl();
                //console.log(urlObj);
                // 置空用户页面内容
                // urlObj.username = 'wiki';
                if (window.location.href.indexOf('#') >= 0 || !urlObj.username || urlObj.username == "wiki") {
                    //console.log($('#SinglePageId').children().length);
                    $scope.IsRenderServerWikiContent = $('#SinglePageId').children().length > 0;
                    if ($scope.IsRenderServerWikiContent) {
                        console.log("server page !!!");
                        return;
                    }
                    //console.log(window.location);
                    if (window.location.hash) {                  // 带有#前端路由 统一用/#/url格式
                        window.location.href = config.frontEndRouteUrl + window.location.search + window.location.hash;
                    } else if (window.location.pathname == '/' || window.location.pathname == '/wiki') {     // wikicraft.cn  重定向/#/home
                        //window.location.href = config.frontEndRouteUrl + window.location.search + "#/home";
                        renderHtmlText('/wiki/home');
                    } else { // /wiki/test
                        renderHtmlText(urlObj.pathname);
                        //renderHtmlText('/wiki/userCenter');
                    }
                    //console.log($scope.IsRenderServerWikiContent);
                    return;
                }
                // 访问用户页
                util.http("POST", config.apiUrlPrefix + "website_pages/getDetailInfo", {
                    username: urlObj.username,
                    sitename: urlObj.sitename,
                    pagename: urlObj.pagename
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
            }

            function init() {
                initBaseInfo();
                initView();
                initContentInfo();
                setTimeout(function () {
                    var w = $("#__mainContent__");
                    var headerHeight = w[0].offsetTop;
                    var footerHeight = $("#_footer_")[0].clientHeight;
                    var win = $(window);
                    var minHeight = win.height() - headerHeight - footerHeight;
                    w.css("min-height", minHeight);
                }, 100);
            }

            init();
        }]);

});
