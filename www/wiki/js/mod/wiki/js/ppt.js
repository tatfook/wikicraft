/**
 * Created by 18730 on 2017/9/20.
 */
define([
    'app',
    'swiper',
    'helper/util',
    'text!wikimod/wiki/html/ppt.html'
], function (app, swiper, util, htmlContent) {
    function registerController(wikiblock) {
        function getModParams(wikiblock) {
            var modParams = wikiblock.modParams || storage.sessionStorageGetItem("wikiModParams") || {};
            return angular.copy(modParams);
        }

        app.registerController("pptController", ["$scope", "$rootScope", function ($scope, $rootScope) {
            $scope.modParams = getModParams(wikiblock);

            function initHeight() {
                var winH = $(document.body).height();
                var headerH = $rootScope.frameHeaderExist ? $("#__wikiHeader__").height() : 0;
                var footerH = $rootScope.frameHeaderExist ? $("#__wikiFooter__").height() : 0;
                $(".swiper-container").height(winH - headerH - footerH);
            }


            var init = function () {
                initHeight();
                var swiper1 = new swiper('#pptMod .swiper-container', {
                    pagination: '.swiper-pagination',
                    paginationClickable: true,
                    mousewheelControl : true,
                    direction: 'vertical'
                });
            };

            $scope.$watch("$viewContentLoaded", function () {
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