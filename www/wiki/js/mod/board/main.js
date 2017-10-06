define([
    'app',
    'helper/util',
    'text!wikimod/board/main.html',
], function (app, util, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("boardController", ['$scope', function ($scope) {
            window.boardWikiBlock = wikiBlock;

            $scope.test = function () {
                alert("123123123");
            }
            //console.log(wikiBlock.editorMode);

            //if (wikiBlock.editorMode) {
            //    return true;
            //}

            //alert(222222222);
        }])
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
        },
    };
});