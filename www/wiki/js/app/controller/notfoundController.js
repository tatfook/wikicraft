/**
 * Created by wuxiangan on 2016/12/21.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'text!html/notfound.html'
], function (app, util, storage, htmlContent) {
    app.controller('notfoundController', ['$scope', 'Account','Message', function ($scope, Account, Message) {
        function init() {

        }
        $scope.$watch('$viewContentLoaded', init);
    }]);

    return htmlContent;
});