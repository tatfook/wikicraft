/**
 * Created by wuxiangan on 2017/12/8.
 */

define(['app',
    'text!wikimod/chpPermission/html/chpPermission.html',
    'helper/util',
], function (app, htmlContent, util) {
    function registerController(wikiblock) {

        app.registerController("permissionController", ["$scope", function ($scope) {

            var moduleParams = angular.copy(wikiBlock.modParams) || {};
            function init() {
                require(['http://www.daofeng-school.com/js/keepwork_permission.js'], function (initMask) {
                    initMask(moduleParams);
                });
            }

            $scope.$watch('$viewContentLoaded', init);
        }]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
        }
    }
});