/**
 * Created by wuxiangan on 2017/3/20.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'text!wikimod/template/html/wiki.html'
], function (app, util, storage, htmlContent) {

    function registerController(wikiBlock) {
        app.registerController('wikiTemplateController', ['$rootScope','$scope','Account', function ($rootScope, $scope, Account) {
            $scope.isSelfPageShow = function (type) {
                return true;
            }
            
            $scope.clickSelfPage = function (type) {
                if (!Account.isAuthenticated())
                    return;

                var siteinfo = $rootScope.siteinfo;
                var urlObj = {username: siteinfo.username, sitename:siteinfo.name, pagename:type}

                if (window.location.pathname == '/wiki/wikiEditor') {
                } else {
                    storage.sessionStorageSetItem("urlObj", urlObj);
                    util.go('wikiEditor');
                }
            }
        }]);
    }
    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent.replace('TemplateContent', wikiBlock.content);
        }
    }
});