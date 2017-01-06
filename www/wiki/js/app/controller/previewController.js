/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app','helper/util', 'helper/storage'], function (app, util, storage) {
    return ['$scope', function ($scope) {
        console.log("previewCtrl");
        var filename = window.location.search.replace('?','');
        util.setScope($scope);
        var moduleParser = new ModuleParser($scope);
        var md = window.markdownit({html:true});

        // 获取页面
        util.http('POST', config.apiUrlPrefix+'website_template_config/getTemplatePageByFilename', {filename:filename}, function(data){
            // 获取页面中模板
            var pageContent = data ? data : '<div>用户页丢失!!!</div>';
            pageContent = md.render(pageContent);
            moduleParser.render(pageContent);
        })
    }];
});