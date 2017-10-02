define([
    'app',
    'helper/util',
    'text!wikimod/board/main.html',
], function (app, util, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("boardController", ['$scope', function ($scope) {

            console.log(wikiBlock.editorMode);

            if (wikiBlock.editorMode) {
                return true;
            }

            
        }])
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
        },
    };
});