/**
 * Created by wuxiangan on 2017/1/9.
 */

define(['app', 'text!wikimod/example/page/example.page'], function (app, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("exampleController", function ($scope) {
            console.log(wikiBlock);
            var modParams = wikiBlock.modParams || {};
            $scope.title = modParams.title || "title";
            $scope.content = modParams.content || "hello wiki module!!!";
            $scope.isViewEdit = wikiBlock.viewEdit;

            $scope.ok = function () {
                modParams.title = $scope.title;
                modParams.content = $scope.content;
                wikiBlock.applyModParams(modParams);
            }
;        });
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;
        }
    }
});