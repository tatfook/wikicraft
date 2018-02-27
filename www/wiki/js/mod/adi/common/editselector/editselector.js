/**
 * 
 */
define([
	'app',
], function (app) {
	app.directive('editSelector', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'E',
            scope:{},
            replace: true,
            template:'<a><span>{{textContent}}</span></a>',
            link: function ($scope, $element, $attrs) {
            },
        };
    }]);
});
