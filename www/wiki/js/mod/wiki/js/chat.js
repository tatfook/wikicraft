/**
 * Created by 18730 on 2017/7/18.
 */
define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/chat.html',
], function (app, util, htmlContent) {
    function getModParams(wikiblock) {
        var modParams = wikiblock.modParams || storage.sessionStorageGetItem("wikiModParams") || {};
        return angular.copy(modParams);
    }

    function registerController(wikiBlock) {
        app.registerController("chatController", ["$scope", function ($scope) {
            $scope.modParams = getModParams(wikiBlock);
            function init() {
                // console.log("init chat mod");
            }

            $scope.$watch("$viewContentLoaded", init);
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
        }
    };
});

/*
 ```@wiki/js/chat
 {
 "moduleKind":"qqChat",
 "message":"客服中心",
 "qq":"825973524"
 }
 ```
 */