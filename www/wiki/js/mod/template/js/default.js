/**
 * Created by wuxiangan on 2017/1/4.
 */

define([
    'app',
    'helper/util',
    'helper/dataSource',
    'helper/markdownwiki'
], function (app, util, dataSource, markdownwiki) {
    function registerController(wikiBlock) {
        app.registerController("defaultTemplateController", ['$rootScope','$scope', function ($rootScope, $scope) {
            function init() {
                var moduleParams = wikiBlock.modParams || {};
                //console.log(moduleParams);
                $scope.style = {
                    'background-color': moduleParams.backgroundColor,
                    'width':moduleParams.width,
                    "height": moduleParams.height || "100%" ,
                    'background-image': moduleParams.backgroundImage,
                };

                $scope.class = moduleParams.class;

                if(moduleParams.footerpage &&  moduleParams.footerpage!=""){
                    var footerPageMD = markdownwiki({html:true, use_template:false});
                    var pageinfo = $rootScope.pageinfo;
                    var ds = dataSource.getDataSource(pageinfo.username, pageinfo.sitename);
                    var pathPrefix = $scope.pageinfo.username + '/' + $scope.pageinfo.sitename + '/';
                    ds.getRawContent({path: pathPrefix + moduleParams.footerpage + config.pageSuffixName}, function (content) {
                        util.html('#_footerPageContentId', footerPageMD.render(content||''), $scope);
                    });
                }
            }

            // init();
            $scope.$watch('$viewContentLoaded', init);
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return '<div ng-controller="defaultTemplateController" ng-class="class" ng-style="style">'+ wikiBlock.content + '<div id="_footerPageContentId"></div></div>'
        }
    }
});

/*
```@template/js/default
{
    "class": "container",
    "footerpage":"_bottom"
}
```
*/