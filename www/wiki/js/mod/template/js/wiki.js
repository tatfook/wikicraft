/**
 * Created by wuxiangan on 2017/3/20.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'helper/markdownwiki',
    'text!wikimod/template/html/wiki.html'
], function (app, util, storage, markdownwiki, htmlContent) {
    var headerMD = markdownwiki({html:true, use_template:false});
    var sidebarMD = markdownwiki({html:true, use_template:false});
    var footerMD = markdownwiki({html:true, use_template:false});
    function registerController(wikiBlock) {
        app.registerController('wikiTemplateController', ['$rootScope','$scope','modal','Message', function ($rootScope, $scope, modal, Message) {
            //$rootScope.siteinfo = {username:"xiaoyao", name:"xiaoyao"};
            var modParams = wikiBlock.modParams || {};
            if ($rootScope.siteinfo) {
                $scope.urlPrefix = '/' + $rootScope.siteinfo.username + '/' + $rootScope.siteinfo.name + '/';
            }

            function setSelfPageContent(type, content) {
                if (!content)
                    return;

                var id = "#" + type + "ContentId";
                var html = md.render(content);
                util.html(id, html, $scope);

                if (type == "_header")
                    modParams.headerContent = content;
                else if (type == "_sidebar")
                    modParams.sidebarContent = content;
                else if (type == "_footer")
                    modParams.footerContent = content;
                else
                    return;

                wikiBlock.applyModParams(modParams);

            }
            function init() {
                //console.log($rootScope.siteinfo);
                if (!$rootScope.siteinfo)
                    return;

                //console.log(modParams);
                if (modParams.headerContent) {
                    var headerHtml = md.render(modParams.headerContent);
                    util.html('#_headerContentId', headerHtml, $scope);
                }
                if (modParams.sidebarContent) {
                    var sidebarHtml = md.render(modParams.sidebarContent);
                    util.html('#_sidebarContentId', sidebarHtml, $scope);
                }
                if (modParams.footerContent) {
                    var footerHtml = md.render(modParams.footerContent);
                    util.html('#_footerContentId', footerHtml, $scope);
                }

                /*
                headerMD.bindRenderContainer('#_headerPageContentId');
                sidebarMD.bindRenderContainer('#_sidebarPageContentId');
                footerMD.bindRenderContainer('#_footerPageContentId');
                */
                util.http("POST", config.apiUrlPrefix + 'website_pages/getWebsitePageByUrl', {url:$scope.urlPrefix + '_header'}, function (data) {
                    data && data.content && util.html('#_headerPageContentId', headerMD.render(data.content), $scope);
                });
                util.http("POST", config.apiUrlPrefix + 'website_pages/getWebsitePageByUrl', {url:$scope.urlPrefix + '_sidebar'}, function (data) {
                    data && data.content && util.html('#_sidebarPageContentId', sidebarMD.render(data.content), $scope);
                });
                util.http("POST", config.apiUrlPrefix + 'website_pages/getWebsitePageByUrl', {url:$scope.urlPrefix + '_footer'}, function (data) {
                    data && data.content && util.html('#_footerPageContentId', footerMD.render(data.content), $scope);
                });
            }
            
            $scope.$watch('$viewContentLoaded', init);

            $scope.isSelfPageShow = function (type) {
                return wikiBlock.editorMode;
            }

            $scope.setSelfPage = function (type) {
                if (!wikiBlock.isPageTemplate) {
                    //$scope.editSelfPage(type);
                    Message.info("请在_theme文件编辑布局模块");
                    return;
                }
                var content = type.substring(1) + "Content";
                //console.log(content, modParams[content]);
                storage.sessionStorageSetItem("_wikiBlockInputParam",{content:modParams[content]});

                modal('wikimod/template/js/_wikiBlockInput',{
                    controller:'_wikiBlockInputController',
                }, function (data) {
                    setSelfPageContent(type, data);
                });
            }
            $scope.editSelfPage = function (type) {
                var siteinfo = $rootScope.siteinfo;
                var urlObj = {username: siteinfo.username, sitename:siteinfo.name, pagename:type};
                if (window.location.pathname == '/wiki/wikiEditor') {
                    $rootScope.$broadcast('changeEditorPage', urlObj);
                } else {
                    storage.sessionStorageSetItem("urlObj", urlObj);
                    util.go('wikiEditor');
                }
            }
        }]);
    }
    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent.replace('TemplateContent', wikiBlock.content);
        }
    }
});

/*
```@template/js/wiki
{
    "headerContent":"# header",
    "sidebarContent":"# sidebar",
    "footerContent":"# footer"
}
```
*/