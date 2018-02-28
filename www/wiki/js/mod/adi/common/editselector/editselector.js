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
            template:'if editmode==true <a><span>{{textContent}}</span></a> else {{textContent}}',
            link: function ($scope, $element, $attrs) {
            },
        };
    }]);
});
