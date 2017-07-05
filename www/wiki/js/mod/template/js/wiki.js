/**
 * Created by wuxiangan on 2017/3/20.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'helper/dataSource',
    'helper/markdownwiki',
    'text!wikimod/template/html/wiki.html'
], function (app, util, storage, dataSource, markdownwiki, htmlContent) {
    var headerMD = markdownwiki({html:true, use_template:false});
    var sidebarMD = markdownwiki({html:true, use_template:false});
    var footerMD = markdownwiki({html:true, use_template:false});
    var headerPageMD = markdownwiki({html:true, use_template:false});
    var sidebarPageMD = markdownwiki({html:true, use_template:false});
    var footerPageMD = markdownwiki({html:true, use_template:false});
    function registerController(wikiBlock) {
        app.registerController('wikiTemplateController', ['$rootScope','$scope','modal','Message', function ($rootScope, $scope, modal, Message) {
            //$rootScope.siteinfo = {username:"xiaoyao", name:"xiaoyao"};
            var modParams = wikiBlock.modParams || {};

            //console.log("-----------wiki template----------------");
            function setSelfPageContent(type, content) {
                content = content || "";

                var md = markdownwiki({html:true, use_template:false});
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
                //console.log("-----------init wiki template----------------");

                //console.log(modParams);
                if (modParams.headerContent) {
                    var headerHtml = headerMD.render(modParams.headerContent);
                    util.html('#_headerContentId', headerHtml, $scope);
                }
                if (modParams.sidebarContent) {
                    var sidebarHtml = sidebarMD.render(modParams.sidebarContent);
                    util.html('#_sidebarContentId', sidebarHtml, $scope);
                }
                if (modParams.footerContent) {
                    var footerHtml = footerMD.render(modParams.footerContent);
                    util.html('#_footerContentId', footerHtml, $scope);
                }

				var pageinfo = $rootScope.pageinfo;
                var ds = dataSource.getDataSource(pageinfo.username, pageinfo.sitename);
                var pathPrefix = $scope.pageinfo.username + '/' + $scope.pageinfo.sitename + '/';
                ds.getRawContent({path: pathPrefix + '_header' + config.pageSuffixName}, function (content) {
                    util.html('#_headerPageContentId', headerPageMD.render(content||''), $scope);
                });
                ds.getRawContent({path: pathPrefix + '_sidebar' + config.pageSuffixName}, function (content) {
                    util.html('#_sidebarPageContentId', sidebarPageMD.render(content||''), $scope);
                });
                ds.getRawContent({path: pathPrefix + '_footer' + config.pageSuffixName}, function (content) {
                    util.html('#_footerPageContentId', footerPageMD.render(content||''), $scope);
                });
            }

            //init();
            $scope.$watch('$viewContentLoaded', init);

            $scope.isSelfPageShow = function (type) {
                return $scope.isEditorEnable();
            }

            // 是否可以编辑模板
            $scope.isEditorEnable = function () {
                if (!wikiBlock.editorMode) {
                    return false;
                }

                //if (wikiBlock.isPageTemplate ||  ($rootScope.pageinfo && $rootScope.pageinfo.pagename == "_theme")) {
                if ($rootScope.pageinfo && $rootScope.pageinfo.pagename == "_theme") {
                    return true;
                }

                return false;
            }

            $scope.setSelfPage = function (type) {
                //console.log(wikiBlock);
                if (!wikiBlock.isPageTemplate && $rootScope.pageinfo.pagename != "_theme") {
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
                var pageinfo = $rootScope.pageinfo;
                var urlObj = {username: pageinfo.username, sitename:pageinfo.sitename, pagename:type};
                if (util.isEditorPage()) {
                    $rootScope.$broadcast('changeEditorPage', urlObj);
                } else {
                    storage.sessionStorageSetItem("urlObj", urlObj);
                    util.go('wikieditor');
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
