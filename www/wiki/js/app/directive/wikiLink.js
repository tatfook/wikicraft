/**
 * Created by wuxiangan on 2017/3/8.
 */

define(['app'], function (app) {
    app.directive('wikiLink', ['$http', '$rootScope', function ($http, $rootScope) {
        return {
            restrict: 'E',
            scope:{},
            replace: true,
            template:'<a>{{textContent}}</a>',
            link: function ($scope, $element, $attrs) {
                //console.log("--------------------------");
                var href = $element.attr('href');
                //console.log($element);
                if ($element.context && $element.context.textContent)
                    $scope.textContent = $element.context.textContent;
                else
                    $scope.textContent = href;

                setTimeout(function () {
                   $scope.$apply();
                });

                if (!href) {
                    $element.attr('href','#');
                    return ;
                }

                if (href.indexOf('wikilink://') == 0 || href.indexOf('unsafe:wikilink://') == 0) {
                    href = href.replace('unsafe:wikilink://','');
                    href = href.replace('wikilink://','');
                }

                if (href.indexOf('http://') == 0 || href.indexOf('https://') == 0) {
                    $element.attr('href', href);
                    $element.attr('target','_blank');
                    return ;
                }
                var pageinfo = $rootScope.pageinfo;
                // 存在点表明是外部链接，内部连接禁用点
                if (href.indexOf('.') > 0) {
                    href = 'http://' + href;
                    $element.attr('target','_blank');
                } else if(pageinfo && pageinfo.username && pageinfo.sitename) {
                    if (href[0] == '/') {
                        href = window.location.origin + href;
                    } else {
                        href = window.location.origin + '/' + pageinfo.username + '/' + pageinfo.sitename + '/' + href;
                    }
                }

                //$element.attr('href', '#');
                $element.attr('href', href);
            },
        };
    }]);
});