define([
    'app',
    'helper/util',
    'text!wikimod/board/main.html',
], function (app, util, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("boardController", ['$scope', '$uibModal', function ($scope, $uibModal) {
            window.boardWikiBlock = wikiBlock;

            $scope.edit = function () {
                if (!wikiBlock.editorMode) {
                    return;
                }

                $uibModal.open({
                    "animation": true,
                    "ariaLabeledBy": "title",
                    "ariaDescribedBy": "body",
                    "template": "hahaha",
                    "controller": "boardController",
                    "size": "lg",
                    "openedClass": "mx-client-modal",
                });
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