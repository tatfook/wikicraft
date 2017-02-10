/**
 * Created by wuxiangan on 2016/12/19.
 */

define(['jquery','app', 'helper/markdownwiki', 'helper/storage', 'helper/util'], function ($, app, markdownwiki, storage, util) {
    var md = markdownwiki({html:true});

    app.controller('mainController', ['$scope','$rootScope','$state', '$http', '$auth', '$compile', 'Account', 'Message', function ($scope, $rootScope, $state, $http, $auth, $compile, Account, Message) {
        console.log("mainController");
        // 初始化基本信息
        function initBaseInfo() {
            $rootScope.imgsPath = config.imgsPath;
            $rootScope.user = Account.getUser();
            $rootScope.userinfo = $rootScope.user;
            $rootScope.frameHeaderExist = true;
            $rootScope.frameFooterExist = true;

            $rootScope.isSelfSite = function () {
                return $rootScope.user._id == $rootScope.userinfo._id;
            }
            //配置一些全局服务
            util.setAngularServices({$rootScope:$rootScope, $http:$http, $state:$state, $compile:$compile, $auth:$auth});
            util.setSelfServices({config:config, storage:storage, Account:Account, Message:Message});
        }

        function renderHtmlText(pathname) {
            /*
            var pageUrl = ['text!html' + pathname + '.html'];
            require(pageUrl, function (htmlContent) {
                //console.log(htmlContent);
                var scriptReg = /<script>[\s\S]*?<\/script>/g;
                var scripts = htmlContent.match(scriptReg) || [];
                htmlContent.replace(scriptReg, '');
                console.log(scripts);
                for (var i = 0; i < scripts.length; i++) {
                    var scipt = scripts[i].match(/<script>([\s\S]*)<\/script>/)[1];
                    console.log(scipt);
                    eval(scipt);
                }
                console.log(htmlContent);
                $scope.IsRenderServerWikiContent = true;
                htmlContent = md.render(htmlContent);
                $('#__WikiPageContentContainer__').removeClass('container');
                util.html('#SinglePageId', htmlContent, $scope);
            });
            */
            pathname = pathname.replace('/wiki/','');
            var pageUrl = 'controller/' + pathname + 'Controller';
            //console.log(pageUrl);
            require([pageUrl], function (htmlContent) {
                //console.log(htmlContent);
                $scope.IsRenderServerWikiContent = true;
                //htmlContent = md.render(htmlContent);
                $('#__WikiPageContentContainer__').removeClass('container');
                util.html('#SinglePageId', htmlContent, $scope);
            });
        }

        // 加载内容信息
        function initContentInfo() {
            $scope.IsRenderServerWikiContent = false;
            var urlObj = util.parseUrl();
            console.log(urlObj);
            // 置空用户页面内容
            //urlObj.sitename = 'wiki';
            if (window.location.href.indexOf('#') >=0 || !urlObj.sitename || urlObj.sitename == "wiki") {
                //console.log($('#SinglePageId').children().length);
                $scope.IsRenderServerWikiContent = $('#SinglePageId').children().length > 0;
                if ($scope.IsRenderServerWikiContent) {
                    console.log("server page !!!");
                    return ;
                }
                //console.log(window.location);
                if (window.location.hash) {                  // 带有#前端路由 统一用/#/url格式
                    window.location.href=config.frontEndRouteUrl + window.location.search + window.location.hash;
                } else if (window.location.pathname == '/' || window.location.pathname == '/wiki') {     // wikicraft.cn  重定向/#/home
                    window.location.href=config.frontEndRouteUrl + window.location.search +"#/home";
                } else { // /wiki/test
                    renderHtmlText(urlObj.pathname);
                    //renderHtmlText('/wiki/test', md);
                }
                //console.log($scope.IsRenderServerWikiContent);
                return ;
            }
            // 访问用户页
            util.http("POST", config.apiUrlPrefix + "website_pages/getDetailInfo", {sitename:urlObj.sitename, pagename:urlObj.pagename}, function (data) {
                data = data || {};
                // 这三种基本信息根化，便于用户页内模块公用
                $rootScope.userinfo = data.userinfo;
                $rootScope.siteinfo = data.siteinfo;
                $rootScope.pageinfo = data.pageinfo;
                var pageContent = data.pageinfo ? data.pageinfo.content : '<div>用户页丢失!!!</div>';
                //console.log(pageContent);
                /*
                 require(['text!html/templates/test.html'], function (htmlContent) {
                    pageContent = htmlContent;
                    pageContent = md.render(pageContent);
                    console.log(pageContent);
                    pageContent = $compile(pageContent)($scope);
                    $('#__UserSitePageContent__').html(pageContent)
                });
                  */
                pageContent = md.render(pageContent);
                //console.log(pageContent);
                pageContent = $compile(pageContent)($scope);
                $('#__UserSitePageContent__').html(pageContent);
            });
        }

        function init() {
            initBaseInfo();
            initContentInfo();
        }

        init();
    }]);
});