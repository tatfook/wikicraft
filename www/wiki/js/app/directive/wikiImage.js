/**
 * Created by wuxiangan on 2016/12/30.
 */

define(['require', 'app'], function (require, app) {
    app.directive('wikiImage', ['$http', 'github',function ($http, github) {
        return {
            restrict: 'EA',
            replace: true,
            template:'<img>',
            link: function ($scope, $element, $attrs) {
                function getImages(src) {
                    src = src || '';
                    if (src.indexOf('#images/') == 0) {
                        github.getContent(src.substring(1), function (data) {
                            $element.attr('src', data);
                        });
                    }
                }

                function getSrc() {
                    return $element.attr('src');
                }
                $scope.$watch(getSrc, getImages)

                //getImages(getSrc());
            },
        };
    }]);
});