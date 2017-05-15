define([
    'app',
    'text!wikimod/wiki/html/worksHeader.html'
], function (app, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("worksHeaderController", ['$scope', function ($scope) {
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
        }
    }
});