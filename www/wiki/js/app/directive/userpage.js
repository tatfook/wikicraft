/**
 * Created by wuxiangan on 2016/12/20.
 */

define(['app','helper/util', 'helper/markdownwiki'], function (app, util, markdownwiki) {
    app.directive('userpage', ['$compile','$parse',function ($compile, $parse) {
        return {
            restrict: 'E',
            replace: true,
            template:'<div></div>',
            link: function ($scope, $element, $attrs) {
                if ($attrs.url) {
                    //console.log($attrs.url);
                    var md = markdownwiki({html:true, use_template:false});
                    util.http("POST", config.apiUrlPrefix + 'website_pages/getWebsitePageByUrl', {url:$attrs.url}, function (data) {
                        //console.log(data);
                        if (!data)
                            return;
                        var htmlContent = md.render(data.content);
                        htmlContent = $compile(htmlContent)($scope);
                        $element.replaceWith(htmlContent);
                        setTimeout(function () {
                            $scope.$apply();
                        })
                    });
                }
            },
        };
    }]);
});