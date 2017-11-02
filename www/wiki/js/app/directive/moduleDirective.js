/**
 * Created by wuxiangan on 2016/12/20.
 */

define(['require', 'app'], function (require, app) {
    app.directive('wikiBlock', ['$compile',function ($compile) {
        return {
            restrict: 'E',
            replace: true,
            template:'<div></div>',
            link: function ($scope, $element, $attrs) {
                if ($attrs.path) {
                    require([config.wikiModPath+$attrs.path + '.js'], function (wikiModule) {
                        $scope.wikiBlockParams = $attrs; // 传递模块参数
                        var content = typeof wikiModule.render == 'function' ? wikiModule.render({modParams:$attrs}) : '';
                        content = $compile(content)($scope);
                        $element.replaceWith(content);
                        $scope.$apply();
                    });
                }
            },
        };
    }]);

    app.directive('maxutf8length', function () {
        return {
            require: 'ngModel',
            scope: {
                maxutf8length: '='
            },
            link: function (scope, elem, attr, ngModel) {
                var maxutf8length = +scope.maxutf8length || 0;
                //For DOM -> model validation
                ngModel.$parsers.unshift(function (value) {
                    var valid = lengthInUtf8Bytes(value) <= maxutf8length;
                    ngModel.$setValidity('maxutf8length', valid);
                    return valid ? value : undefined;
                });
            
                //For model -> DOM validation
                ngModel.$formatters.unshift(function(value) {
                    ngModel.$setValidity('maxutf8length', lengthInUtf8Bytes(value) <= maxutf8length);
                    return value;
                });

                function lengthInUtf8Bytes(str) {
                    // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
                    var m = encodeURIComponent(str).match(/%[89ABab]/g);
                    return str.length + (m ? m.length : 0);
                }
            }
        };
    });
});