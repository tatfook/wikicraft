/**
 * Created by wuxiangan on 2016/12/12.
 */
define([
    'app',
    'helper/util',
    'helper/storage',
    'text!wikimod/wiki/html/statics.html',
], function (app, util, storage, htmlContent) {

    function getModParams(wikiblock) {
        var modParams = wikiblock.modParams || storage.sessionStorageGetItem("wikiModParams") || {};
        return angular.copy(modParams);
    }

    function registerController(wikiBlock) {
        // 个人信息统计
        app.registerController("personalStaticsController", ['$scope','Account','Message', function ($scope, Account, Message) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.modParams = angular.copy(wikiBlock.modParams || {});
            function init() {
                util.http("POST", config.apiUrlPrefix + "user/getStatics", {userId: $scope.userinfo._id}, function (data) {
                    $scope.statics = data || {};
                });
            }

            $scope.$watch("$viewContentLoaded", init);
        }]);

        // 组织信息统计
        app.registerController("organizationStaticsController", ['$scope', '$rootScope', 'Account','Message', function ($scope, $rootScope, Account, Message) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            var modParams = getModParams(wikiBlock);
            var siteinfo = $rootScope.siteinfo;
            var userinfo = $rootScope.userinfo;

            function init() {
                util.post(config.apiUrlPrefix + 'website/getStatics', {websiteId:siteinfo._id}, function (data) {
                    $scope.statics = data || {};
                    $scope.statics.recommendWorksCount = modParams.recommendWorksCount;
                });
            }
            
            $scope.$watch("$viewContentLoaded", function () {
                if (!modParams.username ||  !modParams.sitename) {
                    var urlObj = util.parseUrl();
                    modParams.username = urlObj.username;
                    modParams.sitename = urlObj.sitename;
                }
                util.post(config.apiUrlPrefix + "website/getUserSiteInfo", {username:modParams.username, sitename:modParams.sitename}, function (data) {
                    userinfo = data.userinfo;
                    siteinfo = data.siteinfo;
                    init();
                });
            });
            
            $scope.goOrganizationManagePage = function () {
                storage.sessionStorageSetItem("wikiModParams", {username:modParams.username, sitename:modParams.sitename});
                window.location.href = window.location.origin + '/wiki/js/mod/wiki/js/organizationMemberManage';
            }
            
            $scope.goWorksManagePage = function () {
                storage.sessionStorageSetItem("wikiModParams", {username:modParams.username, sitename:modParams.sitename});
                window.location.href = window.location.origin + '/wiki/js/mod/wiki/js/organizationWorksManage';
            }
            
            $scope.goSubmitWorksPage = function () {
                storage.sessionStorageSetItem("wikiModParams", {username:modParams.username, sitename:modParams.sitename});
                window.location.href = window.location.origin + '/wiki/js/mod/wiki/js/organizationSubmitWorks';
            }
            
            $scope.goMemberApplyPage = function () {
                storage.sessionStorageSetItem("wikiModParams", {username:modParams.username, sitename:modParams.sitename});
                window.location.href = window.location.origin + '/wiki/js/mod/wiki/js/organizationMemberApply';
            }
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock)
            return htmlContent;
        }
    }
});

/*
```@wiki/js/statics
{
    "moduleKind":"personal"
}
```
*/

/*
```@wiki/js/statics
{
    "moduleKind":"organization",
    "recommendWorksCount":"0"
}
```
*/
