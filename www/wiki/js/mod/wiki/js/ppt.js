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
                var winH = $(window).height();
                var headerH = $rootScope.frameHeaderExist ? 52 : 0;
                var footerH = $rootScope.frameHeaderExist ? $("#__wikiFooter__").height() : 0;
                var minH=winH-headerH-footerH;
                $(".swiper-container").height(minH);
                var w = $("#__mainContent__");
                w.css("min-height", minH);
                // console.log(minH);
            }

            var init = function () {
                initHeight();
                setTimeout(function () {
                    var swiper1 = new swiper('#pptMod .swiper-container', {
                        pagination: '.swiper-pagination',
                        paginationClickable: true,
                        mousewheelControl : true,
                        direction: 'vertical'
                    });
                });
            };

            $scope.$watch("$viewContentLoaded", function () {
                init();
            });

            function throttle(method, context) {
                clearTimeout(method.stickTimer);
                method.stickTimer = setTimeout(function () {
                    method.call(context);
                },100);
            }

            window.onresize = function () {
                throttle(init);
            };
        }]);
    }
    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
        }
    }
});