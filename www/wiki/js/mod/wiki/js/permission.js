/**
 * Created by 18730 on 2017/9/12.
 */
define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/permission.html'
], function (app, util, htmlContent) {
    function registerController(wikiblock) {
        function getModParams(wikiblock) {
            var modParams = wikiblock.modParams || storage.sessionStorageGetItem("wikiModParams") || {};
            return angular.copy(modParams);
        }

        app.registerController("permissionController", ["$scope", "Account", "modal", function ($scope, Account, modal) {
            const maxShowHeight = 500;
            var containerId,
                container,
                containerHeight;
            $scope.modParams = getModParams(wikiblock);

            var getShowHeight = function (containerElement) {
                containerElement = containerElement || container;
                if (!containerElement || ($scope.user && $scope.user.vipInfo.endDate)){
                    return "auto";
                }
                if (!containerHeight){
                    containerHeight = containerElement.height();
                }
                var height = containerHeight * 0.75;
                return ((height < 1500) ? height : 1500);
            }

            var initMorePosition = function (containerElement) {
                containerElement = containerElement || container;
                if (!containerElement){
                    return;
                }

                containerElement.css({
                    "height": getShowHeight(),
                    "position": "relative",
                    "overflow": "hidden"
                });
            };

            var init = function () {
                var mdwiki = config.shareMap["mdwiki"];
                containerId = mdwiki.getMdWikiContentContainerId();
                container = $("#"+ containerId);

                initMorePosition();
            };

            $scope.goLoginModal = function () {
                modal('controller/loginController', {
                    controller: 'loginController',
                    size: 'lg',
                    backdrop: true
                }, function (result) {
                    $scope.user = result;
                    $scope.logining = true;
                    init();
                }, function (result) {
                    $scope.logining = false;
                    init();
                });
            };

            $scope.$watch("$viewContentLoaded", function () {
                if (Account.isAuthenticated()){
                    $scope.user = Account.getUser();
                    $scope.logining = true;
                } else {
                    $scope.goLoginModal();
                }
                init();
            });
        }]);
    }
    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
        }
    }
});

/*
 ```@wiki/js/permission
 {
 "moduleKind":"vipPermission"
 }
 ```
 */