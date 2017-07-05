/**
 * Created by wuxiangan on 2017/1/4.
 */

define(['app', 'helper/util'], function (app, util) {
    function registerController(wikiBlock) {
        app.registerController("defaultTemplateController", ['$scope', function ($scope) {
            function init() {
                var moduleParams = wikiBlock.modParams || {};
                //console.log(moduleParams);
                $scope.style = {
                    'background-color': moduleParams.backgroundColor,
                    'width':moduleParams.width,
                    "height": moduleParams.height || "100%" ,
                    'background-image': moduleParams.backgroundImage,
                };

                $scope.class = moduleParams.class;
            }

            init();
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return '<div ng-controller="defaultTemplateController" ng-class="class" ng-style="style">'+ wikiBlock.content +'</div>'
        }
    }
});

/*
```@template/js/default
{
    "class": "container"
}
```
*/