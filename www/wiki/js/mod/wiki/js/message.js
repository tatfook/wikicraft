/**
 * Created by wuxiangan on 2016/12/20.
 */

define([
    'app',
    'text!wikimod/wiki/html/message.html'
], function (app, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("messageController", ['$scope', function ($scope) {
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
        }
    }
});