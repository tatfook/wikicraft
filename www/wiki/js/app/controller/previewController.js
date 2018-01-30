/**
 * Created by wuxiangan on 2016/12/21.
 */

define([
    'app',
    'helper/markdownwiki',
    'helper/util',
    'text!html/preview.html'
], function (app, markdownwiki, util, htmlContent) {
    app.registerController('previewController', ['$scope','$compile', function ($scope,$compile) {
        // console.log("previewCtrl");
        var filename = window.location.search.replace('?','');
        // console.log(filename);
        var md = markdownwiki({html:true});

        // 获取页面
        util.http('POST', config.apiUrlPrefix+'website_template_config/getTemplatePageByFilename', {filename:filename}, function(data){
            // 获取页面中模板
            var pageContent = data ? data : '<div>用户页丢失!!!</div>';
            //pageContent = md.render(pageContent);
            pageContent = $compile(pageContent)($scope);
            $('#__UserSitePageContent__').html(pageContent);
        })
    }]);

    return htmlContent;
});