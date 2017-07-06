/**
 * Created by big on 2017/7/6.
 */

define([
    'app',
    'helper/util',
    'text!html/pay.html'
], function (app, util, htmlContent) {
    app.registerController("payController", ['$scope', 'Account', 'modal', function ($scope, Account, modal) {

    }]);

    return htmlContent;
});