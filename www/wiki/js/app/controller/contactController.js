/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app', 'helper/util', 'helper/storage', 'text!html/contact.html'], function (app, util, storage, htmlContent) {
    app.controller('contactController', ['$scope', function ($scope) {
        function init() {
            // console.log("contactController");
        }

        $scope.$watch('$viewContentLoaded', init);
    }]);

    return htmlContent;
});