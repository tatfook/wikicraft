/**
 * Created by wuxiangan on 2016/12/19.
 */

define(['jquery','app', 'helper/markdownwiki', 'helper/storage', 'helper/util'], function ($, app, markdownwiki, storage, util) {
    app.controller('mainController', ['$scope','$rootScope','$state', '$http', '$auth', '$compile', 'Account', 'Message', function ($scope, $rootScope, $state, $http, $auth, $compile, Account, Message) {
        console.log("mainController");
        // 初始化基本信息
        function initBaseInfo() {
            $rootScope.imgsPath = config.imgsPath;
            $rootScope.user = Account.getUser();
            $rootScope.userinfo = $rootScope.user;
            //配置一些全局服务
            util.setAngularServices({$rootScope:$rootScope, $http:$http, $state:$state, $compile:$compile, $auth:$auth});
            util.setSelfServices({config:config, storage:storage, Account:Account, Message:Message});
        }
        // 加载内容信息
        function initContentInfo() {
            $scope.IsRenderServerWikiContent = false;

            var urlObj = util.parseUrl();
            console.log(urlObj);
            urlObj.sitename = 'wiki';
            urlObj.pagename = "test";
            // 置空用户页面内容
            if (window.location.href.indexOf('#') >=0 || !urlObj.sitename || urlObj.sitename == "wiki") {
                console.log($('#SinglePageId').children().length);
                $scope.IsRenderServerWikiContent = $('#SinglePageId').children().length > 0;
                if ($scope.IsRenderServerWikiContent) {
                    return ;
                }
                if (window.location.path != "/" && window.location.hash) {                  // 带有#前端路由 统一用/#/url格式
                    window.location.href="/" + window.location.hash;
                } else if ((window.location.pathname == '/' || window.location.pathname == '/wiki') && !window.location.hash) {     // wikicraft.cn  重定向/#/home
                    window.location.href="/#/home";
                } else { // /wiki/test
                    var pageUrl = ['text!html/wiki/' + urlObj.pagename + '.html'];
                    require(pageUrl, function (htmlContent) {
                        console.log(htmlContent);
                        $scope.IsRenderServerWikiContent = true;
                        util.html('#SinglePageId', htmlContent, $scope);
                    });
                }
                console.log($scope.IsRenderServerWikiContent);
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
                /*
                pageContent='<wiki-block path="/background/default" background-image="url(\'/wiki/assets/imgs/3DGameBG.jpg\')"></wiki-block>' +
                            '<wiki-block path="header/gameHeader"></wiki-block>' +
                            '<wiki-block path="game/gamedate" contribute-date="12.1-12.30" vote-date="1.1-1.10" result-date="1.12"></wiki-block>' +
                            '<wiki-block path="statics/gameStatics"></wiki-block>' +
                            '<wiki-block path="works/workslist" title="入围作品" type="upgrade"></wiki-block>' +
                            '<wiki-block path="works/workslist" title="最新上传" type="latestNew" page-size="6"></wiki-block>' +
                            '<wiki-block path="works/workslist" title="全部作品" type="all"></wiki-block>' +
                            '<wiki-block path="user/userlist" title="评委成员" type="judge"></wiki-block>'+
                            '<div class="container"><img src="/wiki/assets/imgs/3DGameRule.jpg" class="img-responsive"></div>';
                */
                var md = markdownwiki({html:true});
                pageContent = md.render(pageContent);
                console.log(pageContent);
                pageContent = $compile(pageContent)($scope);
                $('#__UserSitePageContent__').html(pageContent)
            });

        }

        function init() {
            initBaseInfo();
            initContentInfo();
        }

        init();
    }]);
});