/**
 * Created by wuxiangan on 2017/1/4.
 */

define(['app', 'helper/util'], function (app, util) {
    function registerController(wikiBlock) {
        app.registerController("defaultTemplateController", function ($scope) {
            function init() {
                var moduleParams = wikiBlock.modParams;
                console.log(moduleParams);
                $scope.style = {
                    'background-color': moduleParams.backgroundColor,
                    'width':moduleParams.width,
                    "height": moduleParams.height || "100%" ,
                    'background-image': moduleParams.backgroundImage,
                };
            }

            init();
        });
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return '<div class="container"><div class="row" ng-controller="defaultTemplateController" ng-style="style"><div class="col-xs-12">'+ wikiBlock.content +'</div></div></div>';
        }
    }
});