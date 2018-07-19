/**
 * Created by wuxiangan on 2017/3/29.
 */

define([
    'app',
    'text!html/footer.html',
    'helper/util',
], function (app, htmlContent, util) {
    app.controller("footerController", ['$scope', '$translate', function ($scope, $translate) {
        function init() {
            $scope.serverUpdateTime =  config.wikiConfig.serverUpdateTime;
        }
        $scope.$watch('$viewContentLoaded', init);

        $scope.goContact = function () {
            util.go("contact",true);
        };

        $scope.translationUse = function (language) {
           $translate.use(language);
           window.localStorage.setItem('keepwork-language-locale', language);
           config.languageLocale = language
           $.cookie('lang', /en/.test(config.languageLocale) ? 'en-US' : 'zh-CN', {path: '/', expires: 365});
        }

        $scope.goHomePage = function () {
            util.go("home");
        };

        $scope.goStatics = function () {
            util.go("statics");
        }
    }]);

    return htmlContent;
});

