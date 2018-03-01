/**
 * 
 */
define([
    'app',
    'helper/util',
    'text!renderer/directive/editSelector.html'
], function (app, util, template) {
	app.directive('editSelector', ['$rootScope', '$compile', function ($rootScope, $compile) {
        return {
            restrict   : 'E',
            scope      : false,
            // replace    : true,
            // transclude : true,
            // template   :', //if editmode==true  else {{textContent}}
            link: function ($scope, $element, $attrs) {
                let childNodes = $element.context.childNodes;
                let wrapNodes  = $compile(template)($scope);

                $scope.editMode = app.isEditMode();

                while(childNodes.length > 0){
                    wrapNodes[2].appendChild(childNodes[0])
                }

                $element.html(wrapNodes);
            },
        };
    }]);
});
